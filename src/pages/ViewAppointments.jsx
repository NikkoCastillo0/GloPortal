
import { useCallback, useEffect, useState } from 'react'
import Header from '../components/home/Header.jsx'
import AppointmentFilters from '../components/viewAppointments/AppointmentFilters.jsx'
import AppointmentPagination from '../components/viewAppointments/AppointmentPagination.jsx'
import AppointmentTable from '../components/viewAppointments/AppointmentTable.jsx'
import { supabase } from '../lib/supabase.js'

const PAGE_SIZE = 6

export default function ViewAppointments() {
  const [accessStatus, setAccessStatus] = useState('loading')
  const [filter, setFilter] = useState('date')
  const [date, setDate] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const updateTotalCount = useCallback((count) => {
    setTotalCount(count)
  }, [])

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter)
    setPage(1)
  }

  useEffect(() => {
    let active = true
    let verificationId = 0

    async function verifyAdmin() {
      const currentVerification = ++verificationId

      if (active) {
        setAccessStatus('loading')
      }

      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser()

        if (!active || currentVerification !== verificationId) return

        if (userError || !userData.user) {
          setAccessStatus('denied')
          return
        }

        const { data: profile, error: profileError } =
          await supabase
            .from('profiles')
            .select('role')
            .eq('id', userData.user.id)
            .single()

        if (!active || currentVerification !== verificationId) return

        if (profileError || profile?.role !== 'admin') {
          setAccessStatus('denied')
          return
        }

        setAccessStatus('authorized')
      } catch (error) {
        console.error('Admin verification failed:', error)

        if (active && currentVerification === verificationId) {
          setAccessStatus('denied')
        }
      }
    }

    verifyAdmin()

    const { data: authListener } =
      supabase.auth.onAuthStateChange(() => {
        queueMicrotask(() => {
          if (active) {
            verifyAdmin()
          }
        })
      })

    return () => {
      active = false
      verificationId++
      authListener.subscription.unsubscribe()
    }
  }, [])

  if (accessStatus === 'loading') {
    return (
      <main>
        <p>Verifying administrator access...</p>
      </main>
    )
  }

  if (accessStatus !== 'authorized') {
    return (
      <main>
        <h1>Access Denied</h1>
        <p>
          You must be signed in as an administrator
          to view all appointment records.
        </p>
      </main>
    )
  }

  return (
    <>
      <Header
        role="admin"
        isHome={false}
        isSignedIn={true}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">
            All Appointments
          </h1>
          <a
            href="/appointments/edit"
            className="ml-auto inline-flex shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Edit Appointments
          </a>
        </div>

        <AppointmentFilters
          value={filter}
          onChange={handleFilterChange}
          date={date}
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          onDateChange={(nextDate) => {
            setDate(nextDate)
            setPage(1)
          }}
        />

        <AppointmentTable
          filter={filter}
          search={search}
          date={date}
          page={page}
          pageSize={PAGE_SIZE}
          onTotalCountChange={updateTotalCount}
          onLoadingChange={setIsLoading}
        />

        <AppointmentPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </main>
    </>
  )
}
