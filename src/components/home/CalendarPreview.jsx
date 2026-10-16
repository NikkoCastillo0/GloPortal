
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const SHOP_TIMEZONE = "America/Los_Angeles";

// Get the current date in Garage Glo's timezone.
function getShopToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const part = (type) =>
    parts.find((item) => item.type === type)?.value;

  return `${part("year")}-${part("month")}-${part("day")}`;
}

// Convert a database timestamp to California time.
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    timeZone: SHOP_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CalendarPreview() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [year, month] = getShopToday().split("-").map(Number);
    return new Date(year, month - 1, 1);
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Database state
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [slots, setSlots] = useState([]);

  // UI state
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const today = getShopToday();

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const weekdays = [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
  ];

  const currentMonthKey =
    `${year}-${String(month + 1).padStart(2, "0")}`;

  const canGoBack = currentMonthKey > today.slice(0, 7);

  // ========================================
  // LOAD SERVICES FROM SUPABASE
  // ========================================

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      const { data, error: serviceError } = await supabase
        .from("services")
        .select("id, name, duration_minutes, price_cents")
        .eq("active", true)
        .order("name");

      if (cancelled) return;

      if (serviceError) {
        setError(serviceError.message);
      } else {
        setServices(data ?? []);
        setSelectedServiceId(data?.[0]?.id ?? "");
      }

      setLoadingServices(false);
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  // ========================================
  // LOAD AVAILABILITY FROM SUPABASE
  // ========================================

  useEffect(() => {
    if (!selectedDate || !selectedServiceId) return;

    let cancelled = false;

    async function loadAvailability() {
      setLoadingSlots(true);
      setError(null);
      setSlots([]);

      const { data, error: availabilityError } =
        await supabase.rpc("get_available_times", {
          p_date: selectedDate,
          p_service_id: selectedServiceId,
        });

      if (cancelled) return;

      if (availabilityError) {
        setError(availabilityError.message);
      } else {
        setSlots(data ?? []);
      }

      setLoadingSlots(false);
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, selectedServiceId, refreshKey]);

  // ========================================
  // CALENDAR INTERACTIONS
  // ========================================

  function changeMonth(amount) {
    setCurrentMonth(new Date(year, month + amount, 1));
    setSelectedDate(null);
    setSelectedTime(null);
    setSlots([]);
    setError(null);
  }

  function selectDay(day) {
    const dateString =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    setSelectedDate(dateString);
    setSelectedTime(null);
    setSlots([]);
    setLoadingSlots(Boolean(selectedServiceId));
  }

  function changeService(serviceId) {
    setSelectedServiceId(serviceId);
    setSelectedTime(null);
    setSlots([]);
    setLoadingSlots(Boolean(selectedDate && serviceId));
  }

  const selectedDateLabel = selectedDate
    ? new Date(`${selectedDate}T12:00:00`)
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // ========================================
  // RENDER
  // ========================================

  return (
    <section id="calendar" className="bg-gray-400 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 text-gray-900 shadow-lg">

        {/* MONTH NAVIGATION */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{monthName}</h2>

          <div className="flex gap-4">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              className="cursor-pointer text-2xl disabled:cursor-not-allowed disabled:opacity-30"
            >
              &lt;
            </button>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              className="cursor-pointer text-2xl"
            >
              &gt;
            </button>
          </div>
        </div>

        {/* SERVICE SELECTOR */}
        <div className="mb-6">
          <label
            htmlFor="booking-service"
            className="mb-2 block text-sm font-semibold"
          >
            Select a Service
          </label>

          <select
            id="booking-service"
            value={selectedServiceId}
            disabled={loadingServices || services.length === 0}
            onChange={(event) => changeService(event.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white p-3"
          >
            {loadingServices && (
              <option value="">Loading services...</option>
            )}

            {!loadingServices && services.length === 0 && (
              <option value="">No services available</option>
            )}

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} ({service.duration_minutes} min)
              </option>
            ))}
          </select>
        </div>

        {/* MONTHLY CALENDAR */}
        <div className="grid grid-cols-7 gap-1 text-center sm:gap-2">
          {weekdays.map((day) => (
            <div key={day} className="py-2 text-xs font-semibold sm:text-sm">
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} />;
            }

            const dateString =
              `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            const isPast = dateString < today;
            const isSelected = selectedDate === dateString;

            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                aria-pressed={isSelected}
                onClick={() => selectDay(day)}
                className={`min-h-10 rounded border border-gray-200 text-sm
                  ${isPast
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : isSelected
                      ? "bg-gray-900 text-white"
                      : "bg-white hover:bg-gray-200"
                  }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Select a date to check appointment availability.
        </p>

        {/* DAILY AVAILABILITY */}
        <div className="mt-6 border-t border-gray-200 pt-6">

          {!selectedDate ? (
            <p className="text-center text-gray-600">
              Select a date to view available times.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">
                  {selectedDateLabel}
                </h3>

                <button
                  type="button"
                  disabled={loadingSlots}
                  onClick={() => {
                    setSelectedTime(null);
                    setLoadingSlots(true);
                    setRefreshKey((value) => value + 1);
                  }}
                  className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>

              {loadingSlots ? (
                <p className="text-gray-500">
                  Loading availability...
                </p>
              ) : error ? null : slots.length === 0 ? (
                <p className="text-gray-500">
                  No appointment times are offered for this date.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.slot_start}
                      type="button"
                      disabled={!slot.is_available}
                      aria-pressed={
                        selectedTime === slot.slot_start
                      }
                      onClick={() =>
                        setSelectedTime(slot.slot_start)
                      }
                      className={`rounded-md border px-3 py-3 text-sm
                        ${!slot.is_available
                          ? "cursor-not-allowed bg-gray-200 text-gray-500"
                          : selectedTime === slot.slot_start
                            ? "bg-gray-900 text-white"
                            : "bg-white hover:bg-gray-100"
                        }`}
                    >
                      {formatTime(slot.slot_start)}
                      {!slot.is_available && " - Unavailable"}
                    </button>
                  ))}
                </div>
              )}

              {selectedTime && !loadingSlots && (
                <p className="mt-5 text-center font-medium text-green-700">
                  Selected appointment time: {formatTime(selectedTime)}
                </p>
              )}
            </>
          )}

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              Error: {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
