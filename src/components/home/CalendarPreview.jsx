
import { useState } from "react";

export default function CalendarPreview() {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
const today = new Date();
today.setHours(0, 0, 0, 0);

// Temporary test data.
// These are NOT Garage Glo's actual closed days.
const mockUnavailableDays = [7, 21];

// Format: YYYY-MM-DD
const selectedDate = selectedDay === null
  ? null
  : `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;

const timeSlots = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

// Temporary test data, NOT real appointments.
const mockBookedTimes =
  selectedDay === null
    ? []
    : selectedDay % 2 === 0
      ? ["10:00 AM", "2:00 PM"]
      : ["9:00 AM", "1:00 PM"];


  function changeMonth(amount) {
    setCurrentMonth(new Date(year, month + amount, 1));
    setSelectedDay(null);
    setSelectedTime(null);
  }

  return (
    <section id="calendar" className="bg-gray-400 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 text-gray-900 shadow-lg">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{monthName}</h2>

          <div className="flex gap-4">
            <button
  type="button"
  onClick={() => changeMonth(-1)}
  disabled={
    year === today.getFullYear() &&
    month === today.getMonth()
  }
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

        <div className="grid grid-cols-7 gap-2 text-center">
          {weekdays.map((day) => (
            <div key={day} className="text-sm font-semibold">
              {day}
            </div>
          ))}

          
{calendarDays.map((day, index) => {
  if (day === null) {
    return <div key={`empty-${index}`} />;
  }

  const date = new Date(year, month, day);

  const isPast = date < today;
  const isClosed = mockUnavailableDays.includes(day);
  const isUnavailable = isPast || isClosed;
  const isSelected = selectedDay === day;

  return (
    <button
      key={day}
      type="button"
      disabled={isUnavailable}
      aria-pressed={isSelected}
      aria-label={`${date.toDateString()} ${
        isUnavailable ? "unavailable" : "available"
      }`}
      onClick={() => {
        setSelectedDay(day);
        setSelectedTime(null);
      }}
      className={`min-h-10 rounded border border-gray-200
        ${
          isPast
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : isClosed
              ? "cursor-not-allowed bg-gray-300 text-gray-500"
              : isSelected
                ? "cursor-pointer bg-gray-900 text-white"
                : "cursor-pointer bg-white hover:bg-gray-200"
        }`}
    >
      {day}
    </button>
  );
})}

        </div>

<div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
  <div className="flex items-center gap-2">
    <span className="h-3 w-3 rounded border border-gray-300 bg-white" />
    Available
  </div>

  <div className="flex items-center gap-2">
    <span className="h-3 w-3 rounded bg-gray-300" />
    Unavailable
  </div>

  <div className="flex items-center gap-2">
    <span className="h-3 w-3 rounded bg-gray-100" />
    Past date
  </div>
</div>

<p className="mt-2 text-xs text-gray-500">
  Availability is currently simulated for testing.
</p>

        
<div className="mt-6 border-t border-gray-200 pt-6">
  {selectedDay === null ? (
    <p className="text-center text-gray-600">
      Select a date to view available times.
    </p>
  ) : (
    <div>
      <h3 className="mb-2 text-xl font-semibold">
        {new Date(year, month, selectedDay).toLocaleDateString(
          "en-US",
          {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          }
        )}
      </h3>

      <p className="mb-4 text-sm text-gray-600">
        Select an available appointment time.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        
{timeSlots.map((time) => {
  const isBooked = mockBookedTimes.includes(time);

  // Convert "2:00 PM" into a 24-hour time.
  const [clock, period] = time.split(" ");
  const [hour, minute] = clock.split(":").map(Number);

  const hour24 =
    (hour % 12) + (period === "PM" ? 12 : 0);

  // Construct the appointment's actual date and time.
  const slotDate = new Date(
    year,
    month,
    selectedDay,
    hour24,
    minute
  );

  const isPastTime = slotDate.getTime() <= Date.now();
  const isUnavailable = isBooked || isPastTime;

  return (
    <button
      key={time}
      type="button"
      disabled={isUnavailable}
      aria-pressed={selectedTime === time}
      onClick={() => setSelectedTime(time)}
      className={`rounded-md border px-3 py-3 text-sm
        ${
          isUnavailable
            ? "cursor-not-allowed bg-gray-200 text-gray-500"
            : selectedTime === time
              ? "cursor-pointer bg-gray-900 text-white"
              : "cursor-pointer bg-white hover:bg-gray-100"
        }`}
    >
      {time}
      {isPastTime
        ? " - Passed"
        : isBooked
          ? " - Booked"
          : ""}
    </button>
  );
})}

      </div>

      {selectedTime && (
        <p className="mt-5 text-center font-medium text-green-700">
          Selected appointment time: {selectedTime}
        </p>
      )}
    </div>
  )}
</div>


      </div>
    </section>
  );
}
