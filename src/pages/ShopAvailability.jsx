import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import Header from '../components/layout/Header.jsx'
import {
  SHOP_TIMEZONE,
  addDays,
  formatWeekRange,
  getMondayOfWeek,
  getShopToday,
  getWeekDates,
  localToTzOffsetString,
  tzIsoToTime24,
} from '../lib/availabilityUtils.js'

function getShopDate(isoString) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(isoString))

  const part = (type) => parts.find((item) => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

function DayToggle({ checked, onChange, dayName }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${dayName} availability`}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        checked ? 'bg-[#323232]' : 'bg-[#c9c9c9]'
      } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#323232]`}
    >
      <span
        className={`inline-block size-4 rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function ServiceOptions({ services, date, overrides, onChange }) {
  if (services.length === 0) {
    return <p className="text-sm text-[#717171]">No active services found.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
      {services.map((service) => {
        const key = `${date}:${service.id}`
        const checked = overrides[key] !== false

        return (
          <label
            key={service.id}
            className="flex min-w-0 cursor-pointer items-center gap-2 text-sm"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => onChange(key, event.target.checked)}
              className="size-4 shrink-0 accent-[#323232] focus-visible:outline-2 focus-visible:outline-offset-2"
            />
            <span className="truncate">{service.name}</span>
          </label>
        )
      })}
    </div>
  )
}

export default function ShopAvailability() {
  const navigate = useNavigate()

  const [access, setAccess] = useState('loading')
  const [loading, setLoading] = useState(true)
  const [currentMonday, setCurrentMonday] = useState(() =>
    getMondayOfWeek(getShopToday()),
  )

  const [services, setServices] = useState([])
  const [slotsByDate, setSlotsByDate] = useState({})
  const [dayAvailability, setDayAvailability] = useState({})
  const [serviceOverrides, setServiceOverrides] = useState({})

  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const verifyAdmin = useCallback(async () => {
    setAccess('loading')

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setAccess('denied')
      navigate('/login', { replace: true })
      return false
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      setAccess('denied')
      navigate('/customerportal', { replace: true })
      return false
    }

    setAccess('authorized')
    return true
  }, [navigate])

  useEffect(() => {
    let mounted = true

    const checkAccess = async () => {
      if (!mounted) return
      await verifyAdmin()
    }

    void checkAccess()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login', { replace: true })
        return
      }

      // Run after Supabase finishes its auth-state callback.
      window.setTimeout(() => {
        if (mounted) void verifyAdmin()
      }, 0)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [navigate, verifyAdmin])

  const loadData = useCallback(async (monday, isCurrent = () => true) => {
    setLoading(true)
    setError('')
    setSuccess('')

    const startBoundary = localToTzOffsetString(monday, '00:00')
    const endBoundary = localToTzOffsetString(addDays(monday, 7), '00:00')
    const sunday = addDays(monday, 6)

    const [windowsResult, servicesResult, overridesResult] = await Promise.all([
      supabase
        .from('availability_windows')
        .select('starts_at, ends_at')
        .gte('starts_at', startBoundary)
        .lt('starts_at', endBoundary)
        .order('starts_at'),
      supabase
        .from('services')
        .select('id, name')
        .eq('active', true)
        .order('name'),
      supabase
        .from('daily_service_availability')
        .select('date, service_id, is_available')
        .gte('date', monday)
        .lte('date', sunday),
    ])

    if (!isCurrent()) return false

    const queryError =
      windowsResult.error || servicesResult.error || overridesResult.error

    if (queryError) {
      setError(`Could not load availability: ${queryError.message}`)
      setLoading(false)
      return false
    }

    const nextSlots = {}
    const nextAvailability = {}

    for (const day of getWeekDates(monday)) {
      nextSlots[day.dateStr] = []
      nextAvailability[day.dateStr] = false
    }

    for (const window of windowsResult.data ?? []) {
      const date = getShopDate(window.starts_at)
      if (!nextSlots[date]) continue

      nextSlots[date].push({
        id: makeId(),
        startTime: tzIsoToTime24(window.starts_at),
        endTime: tzIsoToTime24(window.ends_at),
      })
      nextAvailability[date] = true
    }

    const nextOverrides = {}
    for (const override of overridesResult.data ?? []) {
      nextOverrides[`${override.date}:${override.service_id}`] =
        override.is_available
    }

    setSlotsByDate(nextSlots)
    setDayAvailability(nextAvailability)
    setServices(servicesResult.data ?? [])
    setServiceOverrides(nextOverrides)
    setDirty(false)
    setLoading(false)
    return true
  }, [])

  useEffect(() => {
    if (access !== 'authorized') return

    let current = true
    void loadData(currentMonday, () => current)

    return () => {
      current = false
    }
  }, [access, currentMonday, loadData])

  const markChanged = () => {
    setDirty(true)
    setSuccess('')
  }

  const changeWeek = (offset) => {
    if (dirty && !window.confirm('Discard unsaved availability changes?')) return
    setCurrentMonday((monday) => addDays(monday, offset))
  }

  const updateDayAvailability = (date, value) => {
    setDayAvailability((previous) => ({ ...previous, [date]: value }))
    markChanged()
  }

  const updateServiceAvailability = (key, value) => {
    setServiceOverrides((previous) => ({ ...previous, [key]: value }))
    markChanged()
  }

  const updateSlot = (date, slotId, field, value) => {
    setSlotsByDate((previous) => ({
      ...previous,
      [date]: (previous[date] ?? []).map((slot) =>
        slot.id === slotId ? { ...slot, [field]: value } : slot,
      ),
    }))
    markChanged()
  }

  const addSlot = (date) => {
    setSlotsByDate((previous) => ({
      ...previous,
      [date]: [
        ...(previous[date] ?? []),
        { id: makeId(), startTime: '', endTime: '' },
      ],
    }))
    setDayAvailability((previous) => ({ ...previous, [date]: true }))
    markChanged()
  }

  const removeSlot = (date, slotId) => {
    setSlotsByDate((previous) => ({
      ...previous,
      [date]: (previous[date] ?? []).filter((slot) => slot.id !== slotId),
    }))
    markChanged()
  }

  const saveAvailability = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const windows = []

      for (const day of getWeekDates(currentMonday)) {
        if (!dayAvailability[day.dateStr]) continue

        const slots = [...(slotsByDate[day.dateStr] ?? [])].sort((a, b) =>
          a.startTime.localeCompare(b.startTime),
        )

        if (slots.length === 0) {
          throw new Error(`${day.dayName} is marked available but has no time slots.`)
        }

        let previousEnd = ''

        for (const slot of slots) {
          if (!slot.startTime || !slot.endTime) {
            throw new Error(`Complete both times for every ${day.dayName} slot.`)
          }

          const startMinute = Number(slot.startTime.split(':')[1])
          const endMinute = Number(slot.endTime.split(':')[1])

          if (startMinute % 15 !== 0 || endMinute % 15 !== 0) {
            throw new Error(`${day.dayName} times must use 15-minute increments.`)
          }

          if (slot.startTime >= slot.endTime) {
            throw new Error(`Each ${day.dayName} slot must end after it starts.`)
          }

          if (previousEnd && slot.startTime < previousEnd) {
            throw new Error(`${day.dayName} time slots cannot overlap.`)
          }

          const startsAt = localToTzOffsetString(day.dateStr, slot.startTime)
          const endsAt = localToTzOffsetString(day.dateStr, slot.endTime)

          // Catch local times that do not exist during the spring DST change.
          if (
            getShopDate(startsAt) !== day.dateStr ||
            tzIsoToTime24(startsAt) !== slot.startTime ||
            getShopDate(endsAt) !== day.dateStr ||
            tzIsoToTime24(endsAt) !== slot.endTime
          ) {
            throw new Error(
              `A ${day.dayName} time falls in a daylight-saving time change. Choose another time.`,
            )
          }

          windows.push({ starts_at: startsAt, ends_at: endsAt })
          previousEnd = slot.endTime
        }
      }

      const serviceAvailability = getWeekDates(currentMonday).flatMap((day) =>
        services.map((service) => ({
          date: day.dateStr,
          service_id: service.id,
          is_available:
            serviceOverrides[`${day.dateStr}:${service.id}`] !== false,
        })),
      )

      const { error: saveError } = await supabase.rpc(
        'save_weekly_availability',
        {
          p_week_start_date: currentMonday,
          p_windows: windows,
          p_service_overrides: serviceAvailability,
        },
      )

      if (saveError) throw saveError

      setDirty(false)
      setSuccess('Availability saved.')
    } catch (saveError) {
      setError(saveError.message || 'Could not save availability.')
    } finally {
      setSaving(false)
    }
  }

  if (access !== 'authorized') {
    return (
      <div className="min-h-screen bg-[#f6f6f4] p-8 text-center text-[#323232]">
        {access === 'denied' ? 'Redirecting…' : 'Verifying admin access…'}
      </div>
    )
  }

  const renderDayControls = (day) => {
    const slots = slotsByDate[day.dateStr] ?? []
    const available = dayAvailability[day.dateStr] ?? false

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <DayToggle
            checked={available}
            onChange={(value) => updateDayAvailability(day.dateStr, value)}
            dayName={day.dayName}
          />
          <span className="text-sm font-medium">
            {available ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div className="space-y-2">
          {slots.map((slot, index) => (
            <div
              key={slot.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-[#d8d8d6] p-2"
            >
              <label className="sr-only" htmlFor={`${slot.id}-start`}>
                {day.dayName} slot {index + 1} start time
              </label>
              <input
                id={`${slot.id}-start`}
                type="time"
                step="900"
                value={slot.startTime}
                onChange={(event) =>
                  updateSlot(day.dateStr, slot.id, 'startTime', event.target.value)
                }
                className="min-h-10 min-w-28 rounded-md border border-[#cccccc] px-2 text-sm"
              />
              <span className="text-sm text-[#717171]">to</span>
              <label className="sr-only" htmlFor={`${slot.id}-end`}>
                {day.dayName} slot {index + 1} end time
              </label>
              <input
                id={`${slot.id}-end`}
                type="time"
                step="900"
                value={slot.endTime}
                onChange={(event) =>
                  updateSlot(day.dateStr, slot.id, 'endTime', event.target.value)
                }
                className="min-h-10 min-w-28 rounded-md border border-[#cccccc] px-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeSlot(day.dateStr, slot.id)}
                aria-label={`Remove ${day.dayName} slot ${index + 1}`}
                className="ml-auto rounded-md px-3 py-2 text-sm text-[#555] hover:bg-[#ececea] focus-visible:outline-2"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addSlot(day.dateStr)}
            className="min-h-10 rounded-full border border-[#bdbdbd] px-4 text-sm font-medium hover:bg-[#f3f3f3] focus-visible:outline-2"
          >
            + Add time slot
          </button>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-[#323232]">
            Services available
          </h3>
          <ServiceOptions
            services={services}
            date={day.dateStr}
            overrides={serviceOverrides}
            onChange={updateServiceAvailability}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f6f4] text-[#323232]">
      <Header role="admin" />

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Shop Availability</h1>

          <button
            type="button"
            onClick={saveAvailability}
            disabled={saving || loading || !dirty}
            className="min-h-11 rounded-full bg-[#323232] px-6 font-semibold text-white hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => changeWeek(-7)}
            aria-label="Previous week"
            className="size-11 rounded-full border border-[#cccccc] bg-white text-xl hover:bg-[#ececea] focus-visible:outline-2"
          >
            ‹
          </button>

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">
              Week of
            </p>
            <p className="text-base font-semibold sm:text-lg">
              {formatWeekRange(currentMonday)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => changeWeek(7)}
            aria-label="Next week"
            className="size-11 rounded-full border border-[#cccccc] bg-white text-xl hover:bg-[#ececea] focus-visible:outline-2"
          >
            ›
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-800"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mb-4 rounded-lg bg-green-100 p-4 text-sm text-green-800"
          >
            {success}
          </p>
        )}

        {loading ? (
          <p role="status" className="rounded-lg bg-white p-6 text-[#717171]">
            Loading weekly availability…
          </p>
        ) : (
          <>
            {/* Mobile: one compact card per day. */}
            <div className="space-y-3 lg:hidden">
              {getWeekDates(currentMonday).map((day) => (
                <article
                  key={day.dateStr}
                  className="rounded-xl border border-[#d8d8d6] bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 flex items-baseline justify-between gap-3">
                    <h2 className="font-bold">{day.dayName}</h2>
                    <span className="text-sm text-[#717171]">{day.shortDate}</span>
                  </div>
                  {renderDayControls(day)}
                </article>
              ))}
            </div>

            {/* Desktop: full-width weekly schedule, without a sidebar. */}
            <div className="hidden overflow-x-auto rounded-xl border border-[#d8d8d6] bg-white shadow-sm lg:block">
              <table className="w-full border-collapse text-left">
                <thead className="bg-[#ececea]">
                  <tr>
                    <th className="w-40 border-0 p-4 text-sm font-semibold">Day &amp; Date</th>
                    <th className="w-36 border-0 p-4 text-sm font-semibold">Availability</th>
                    <th className="min-w-[390px] border-0 p-4 text-sm font-semibold">Time Slots</th>
                    <th className="min-w-[340px] border-0 p-4 text-sm font-semibold">Services Available</th>
                  </tr>
                </thead>
                <tbody>
                  {getWeekDates(currentMonday).map((day) => (
                    <tr key={day.dateStr} className="border-t border-[#dededc] align-top">
                      <td className="border-0 p-4">
                        <div className="font-semibold">{day.dayName}</div>
                        <div className="mt-1 text-sm text-[#717171]">
                          {day.formattedDate}
                        </div>
                      </td>
                      <td className="border-0 p-4">
                        <div className="flex items-center gap-3">
                          <DayToggle
                            checked={dayAvailability[day.dateStr] ?? false}
                            onChange={(value) =>
                              updateDayAvailability(day.dateStr, value)
                            }
                            dayName={day.dayName}
                          />
                          <span className="text-sm">
                            {dayAvailability[day.dateStr] ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </td>
                      <td className="border-0 p-4">
                        <div className="space-y-2">
                          {(slotsByDate[day.dateStr] ?? []).map((slot, index) => (
                            <div
                              key={slot.id}
                              className="flex items-center gap-2 rounded-lg border border-[#d8d8d6] p-2"
                            >
                              <label className="sr-only" htmlFor={`${slot.id}-start`}>
                                {day.dayName} slot {index + 1} start time
                              </label>
                              <input
                                id={`${slot.id}-start`}
                                type="time"
                                step="900"
                                value={slot.startTime}
                                onChange={(event) =>
                                  updateSlot(day.dateStr, slot.id, 'startTime', event.target.value)
                                }
                                className="min-h-10 rounded-md border border-[#cccccc] px-2 text-sm"
                              />
                              <span className="text-sm text-[#717171]">to</span>
                              <label className="sr-only" htmlFor={`${slot.id}-end`}>
                                {day.dayName} slot {index + 1} end time
                              </label>
                              <input
                                id={`${slot.id}-end`}
                                type="time"
                                step="900"
                                value={slot.endTime}
                                onChange={(event) =>
                                  updateSlot(day.dateStr, slot.id, 'endTime', event.target.value)
                                }
                                className="min-h-10 rounded-md border border-[#cccccc] px-2 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => removeSlot(day.dateStr, slot.id)}
                                aria-label={`Remove ${day.dayName} slot ${index + 1}`}
                                className="ml-auto rounded-md px-3 py-2 text-sm hover:bg-[#ececea] focus-visible:outline-2"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addSlot(day.dateStr)}
                            className="min-h-9 rounded-full border border-[#bdbdbd] px-4 text-sm font-medium hover:bg-[#f3f3f3] focus-visible:outline-2"
                          >
                            + Add time slot
                          </button>
                        </div>
                      </td>
                      <td className="border-0 p-4">
                        <ServiceOptions
                          services={services}
                          date={day.dateStr}
                          overrides={serviceOverrides}
                          onChange={updateServiceAvailability}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={saveAvailability}
              disabled={saving || !dirty}
              className="mt-5 min-h-11 w-full rounded-full bg-[#323232] px-6 font-semibold text-white hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-50 lg:hidden"
            >
              {saving ? 'Saving…' : 'Save availability'}
            </button>
          </>
        )}
      </main>
    </div>
  )
}