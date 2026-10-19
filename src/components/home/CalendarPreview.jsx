import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import "./CalendarPreview.css";

const SHOP_TIMEZONE = "America/Los_Angeles";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getShopToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    timeZone: SHOP_TIMEZONE,
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(dateString) {
  // Noon local time avoids dates changing when the browser is in a different zone.
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function CalendarPreview() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const [year, month] = getShopToday().split("-").map(Number);
    return new Date(year, month - 1, 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [servicesError, setServicesError] = useState(null);
  const [monthAvailability, setMonthAvailability] = useState({});
  const [loadingMonth, setLoadingMonth] = useState(true);
  const [monthError, setMonthError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bookingNotice, setBookingNotice] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const today = getShopToday();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
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

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, duration_minutes")
        .eq("active", true)
        .order("name");

      if (cancelled) return;
      if (error) {
        setServicesError(error.message);
      } else {
        setServices(data ?? []);
        setSelectedServiceId(data?.[0]?.id ?? "");
      }
      setLoadingServices(false);
    }

    loadServices();
    return () => { cancelled = true; };
  }, []);

  // One RPC request checks the whole month across all active services.
  // A day is unavailable only when *none* of the services can be booked.
  useEffect(() => {
    if (loadingServices) return;
    let cancelled = false;

    async function loadMonth() {
      setLoadingMonth(true);
      setMonthError(null);
      setMonthAvailability({});
      if (services.length === 0) {
        setLoadingMonth(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_month_availability", {
        p_month: `${monthKey}-01`,
      });
      if (cancelled) return;

      if (error) {
        // Do not mark dates as fully booked when we cannot check them.
        setMonthError("Unable to check the month. Select a date to try daily availability.");
      } else {
        setMonthAvailability(Object.fromEntries(
          (data ?? []).map(({ available_date, has_available_times }) => [
            available_date, has_available_times,
          ]),
        ));
      }
      setLoadingMonth(false);
    }

    loadMonth();
    return () => { cancelled = true; };
  }, [monthKey, loadingServices, services.length, refreshKey]);

  useEffect(() => {
    if (!selectedDate || !selectedServiceId) return;
    let cancelled = false;

    async function loadAvailability() {
      setLoadingSlots(true);
      setSlotsError(null);
      setSlots([]);
      const { data, error } = await supabase.rpc("get_available_times", {
        p_date: selectedDate,
        p_service_id: selectedServiceId,
      });
      if (cancelled) return;
      if (error) {
        setSlotsError(error.message);
      } else {
        setSlots(data ?? []);
      }
      setLoadingSlots(false);
    }

    loadAvailability();
    return () => { cancelled = true; };
  }, [selectedDate, selectedServiceId, refreshKey]);

  function changeMonth(amount) {
    setCurrentMonth(new Date(year, month + amount, 1));
    setSelectedDate(null);
    setSelectedTime(null);
    setSlots([]);
    setLoadingSlots(false);
    setSlotsError(null);
    setBookingNotice(false);
  }

  function selectDay(day) {
    const dateString = `${monthKey}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateString);
    setSelectedTime(null);
    setSlots([]);
    setSlotsError(null);
    setBookingNotice(false);
  }

  function changeService(serviceId) {
    setSelectedServiceId(serviceId);
    setSelectedTime(null);
    setSlots([]);
    setBookingNotice(false);
  }

  function refreshAvailability() {
    setSelectedTime(null);
    setBookingNotice(false);
    setRefreshKey((value) => value + 1);
  }

  const anyAvailableSlots = slots.some((slot) => slot.is_available);
  const selectedDateLabel = selectedDate ? formatDate(selectedDate) : null;

  return (
    <section id="calendar" className="calendar-preview" aria-labelledby="calendar-preview-title">
      <div className="calendar-preview__container">
        <h2 id="calendar-preview-title" className="calendar-preview__title">Find a time</h2>
        <p className="calendar-preview__description">Choose an available appointment time.</p>

        <div className="calendar-preview__card">
          <div className="calendar-preview__month-heading">
            <h3 className="calendar-preview__month-name">{monthName}</h3>
            <div className="calendar-preview__arrows">
              <button type="button" disabled={monthKey <= today.slice(0, 7)}
                onClick={() => changeMonth(-1)} aria-label="Previous month">&lt;</button>
              <button type="button" onClick={() => changeMonth(1)}
                aria-label="Next month">&gt;</button>
            </div>
          </div>

          <div className="calendar-preview__grid" aria-label={`Calendar for ${monthName}`}>
            {WEEKDAYS.map((day) => (
              <span key={day} className="calendar-preview__weekday">{day}</span>
            ))}
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <span key={`blank-${index}`} aria-hidden="true" />;
              }
              const dateString = `${monthKey}-${String(day).padStart(2, "0")}`;
              const isPast = dateString < today;
              const isUnavailable = !isPast && !loadingMonth && !monthError &&
                monthAvailability[dateString] === false;
              const isSelected = selectedDate === dateString;
              const availabilityLabel = isPast ? "Past date"
                : isUnavailable ? "No available appointments"
                  : loadingMonth ? "Checking availability" : "Select to view times";

              return (
                <button key={dateString} type="button"
                  disabled={isPast || isUnavailable || loadingServices || services.length === 0}
                  onClick={() => selectDay(day)}
                  aria-pressed={isSelected}
                  aria-label={`${formatDate(dateString)}: ${availabilityLabel}`}
                  title={availabilityLabel}
                  className={`calendar-preview__day${isPast ? " calendar-preview__day--past" : ""}${isUnavailable ? " calendar-preview__day--unavailable" : ""}${isSelected ? " calendar-preview__day--selected" : ""}`}>
                  {day}
                </button>
              );
            })}
          </div>

          <div className="calendar-preview__legend">
            <span><span className="calendar-preview__legend-swatch calendar-preview__legend-swatch--available" /> Available</span>
            <span><span className="calendar-preview__legend-swatch calendar-preview__legend-swatch--unavailable" /> Unavailable</span>
            <span><span className="calendar-preview__legend-swatch calendar-preview__legend-swatch--past" /> Past</span>
          </div>
          {loadingMonth && !loadingServices && (
            <p className="calendar-preview__helper" role="status">Checking this month's availability...</p>
          )}
          {monthError && <p className="calendar-preview__warning" role="status">{monthError}</p>}

          <div className="calendar-preview__details">
            {loadingServices ? (
              <p className="calendar-preview__helper">Loading services...</p>
            ) : servicesError ? (
              <p role="alert" className="calendar-preview__error">{servicesError}</p>
            ) : services.length === 0 ? (
              <p className="calendar-preview__helper">No services are available right now.</p>
            ) : !selectedDate ? (
              <p className="calendar-preview__helper">Select a date to see appointment times.</p>
            ) : (
              <>
                <div className="calendar-preview__details-heading">
                  <h4>{selectedDateLabel}</h4>
                  <button type="button" onClick={refreshAvailability} disabled={loadingSlots}
                    className="calendar-preview__refresh">Refresh</button>
                </div>
                <label className="calendar-preview__field-label" htmlFor="booking-service">Service</label>
                <select id="booking-service" value={selectedServiceId}
                  onChange={(event) => changeService(event.target.value)}
                  className="calendar-preview__service">
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes} min)
                    </option>
                  ))}
                </select>

                {loadingSlots ? (
                  <p className="calendar-preview__helper" role="status">Loading times...</p>
                ) : slotsError ? (
                  <p role="alert" className="calendar-preview__error">{slotsError}</p>
                ) : !anyAvailableSlots ? (
                  <p className="calendar-preview__helper">No available times for this service on this date. Try another service or day.</p>
                ) : (
                  <div className="calendar-preview__slots" aria-label="Appointment times">
                    {slots.map((slot) => (
                      <button key={slot.slot_start} type="button"
                        disabled={!slot.is_available}
                        aria-pressed={selectedTime === slot.slot_start}
                        onClick={() => { setSelectedTime(slot.slot_start); setBookingNotice(false); }}
                        className={`calendar-preview__slot${selectedTime === slot.slot_start ? " calendar-preview__slot--selected" : ""}`}>
                        {formatTime(slot.slot_start)}{!slot.is_available && " - Taken"}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <button className="calendar-preview__book" type="button"
          disabled={!selectedDate || !selectedTime || loadingSlots || !!slotsError}
          onClick={() => setBookingNotice(true)}>Book Now</button>
        {bookingNotice && (
          <p className="calendar-preview__notice" role="status">
            Booking page coming soon. Your selection ({selectedDateLabel}, {formatTime(selectedTime)}) is saved on this page for now.
          </p>
        )}
      </div>
    </section>
  );
}
