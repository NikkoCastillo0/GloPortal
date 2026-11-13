import AdminDashboardCard from "./AdminDashboardCard.jsx";

const appointmentTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  hour: "numeric",
  minute: "2-digit",
});

export default function AdminDashboard({ summary = null, children }) {
  const count = (value) =>
    value == null ? "—" : value.toLocaleString("en-US");

  return (
    <main className="mx-auto max-w-382.5 px-5 pb-10 pt-7 md:px-12 md:py-16">
      <header className="mb-7 md:sr-only">
        <h1 className="text-[28px] font-bold leading-tight">Admin Dashboard</h1>
        <p className="mt-1 text-[15px] text-[#666666]">
          Today’s shop activity and operational overview.
        </p>
      </header>

      <dl className="mb-7 grid grid-cols-3 rounded-[18px] border border-[#cccccc] bg-white p-4 text-center md:hidden">
        {[
          ["Today", summary?.todayCount],
          ["Customers", summary?.customerCount],
          ["Requests", summary?.pendingCount],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse gap-1">
            <dt className="text-xs text-[#666666]">{label}</dt>
            <dd className="text-[28px] font-bold leading-tight">
              {count(value)}
            </dd>
          </div>
        ))}
      </dl>

      {children}

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-x-20 md:gap-y-24">
        <AdminDashboardCard title="Appointments" actionLabel="View All Appointments" navigateTo="/viewappointments">
          <p className="md:mb-6 md:font-semibold">Today’s Appointments</p>
          {summary ? (
            summary.todayAppointments.length ? (
              <>
                <ul>
                  {summary.todayAppointments.map((appointment) => (
                    <li key={appointment.id}>
                      <time dateTime={appointment.startsAt}>
                        {appointmentTime.format(new Date(appointment.startsAt))}
                      </time>
                      {" · "}
                      {appointment.serviceName}
                    </li>
                  ))}
                </ul>
                {summary.todayCount > summary.todayAppointments.length && (
                  <p className="mt-2 text-sm">
                    Showing {summary.todayAppointments.length} of{" "}
                    {count(summary.todayCount)}
                  </p>
                )}
              </>
            ) : (
              <p>No appointments today.</p>
            )
          ) : (
            <p>—</p>
          )}
        </AdminDashboardCard>

        <AdminDashboardCard title="Customers" actionLabel="View All Customers" navigateTo="/viewcustomers">
          <div className="text-center text-[22px] font-bold leading-tight md:space-y-8 md:text-xl lg:text-2xl xl:text-3xl">
            <p>Total Customers: {count(summary?.customerCount)}</p>
            <p>Registered Vehicles: {count(summary?.vehicleCount)}</p>
          </div>
        </AdminDashboardCard>

        <AdminDashboardCard title="Inventory" actionLabel="View All Inventory" navigateTo="/viewinventory">
          <div className="text-center">
            <p className="md:mb-6 md:font-semibold">Lowest Stock</p>
            {summary ? (
              summary.lowestStock.length ? (
                <ul>
                  {summary.lowestStock.map((item) => (
                    <li key={item.id}>
                      {item.name}: {count(item.quantity)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No inventory items yet.</p>
              )
            ) : (
              <p>—</p>
            )}
          </div>
        </AdminDashboardCard>

        <AdminDashboardCard title="Services" actionLabel="Edit Services" navigateTo="/editservices">
          <div className="text-center md:space-y-8">
            <p>Active Services: {count(summary?.activeServiceCount)}</p>
            <p>
              Most Popular:{" "}
              {summary
                ? (summary.popularService ?? "No completed jobs yet")
                : "—"}
            </p>
          </div>
        </AdminDashboardCard>

        <AdminDashboardCard
          title="Appointment Requests"
          actionLabel="Review Requests"
          navigateTo="/viewappointmentrequests"
          className="md:col-span-2 md:mx-auto md:w-full md:max-w-5xl"
        >
          <p className="text-center text-[22px] font-bold leading-tight md:text-3xl xl:text-4xl">
            {summary
              ? `${count(summary.pendingCount)} ${summary.pendingCount === 1 ? "request" : "requests"} waiting review`
              : "— requests waiting review"}
          </p>
        </AdminDashboardCard>
      </div>
    </main>
  );
}
