
import { useState } from "react";

export default function CalendarPreview() {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [selectedDay, setSelectedDay] = useState(null);

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

  function changeMonth(amount) {
    setCurrentMonth(new Date(year, month + amount, 1));
    setSelectedDay(null);
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
              aria-label="Previous month"
              className="cursor-pointer text-2xl"
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

          {calendarDays.map((day, index) =>
            day === null ? (
              <div key={`empty-${index}`} />
            ) : (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                aria-pressed={selectedDay === day}
                className={`min-h-10 cursor-pointer rounded border border-gray-200
                  ${selectedDay === day
                    ? "bg-gray-900 text-white"
                    : "bg-white hover:bg-gray-200"
                  }`}
              >
                {day}
              </button>
            )
          )}
        </div>

        <div className="mt-6 text-center">
          {selectedDay === null ? (
            <p>Select a date to view available times.</p>
          ) : (
            <p>
              Selected date: {month + 1}/{selectedDay}/{year}
            </p>
          )}
        </div>

      </div>
    </section>
  );
}
