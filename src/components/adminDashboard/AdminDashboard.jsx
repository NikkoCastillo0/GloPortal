import { Link } from "react-router-dom";
import DashboardCard from "../dashboard/DashboardCard.jsx";

const appointmentTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  hour: "numeric",
  minute: "2-digit",
});

export default function AdminDashboard({ summary = null, children }) {
  const count = (value) =>
    value == null ? "—" : value.toLocaleString("en-US");
  const actionClassName =
    "inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white px-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <main className="mx-auto max-w-382.5 px-5 pb-10 pt-7 md:px-12 md:py-16">
      <header className="mb-7 md:sr-only">
        <h1 className="text-[28px] font-bold leading-tight">Admin Dashboard</h1>
        <p className="mt-1 text-[15px] text-[#666666]">
          Today’s shop activity and operational overview.
        </p>
      </header>

      <DashboardCard className="mb-7 md:hidden">
        <dl className="grid grid-cols-3 text-center">
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
      </DashboardCard>

      {children}

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2 md:gap-x-20 md:gap-y-24">
        <DashboardCard
          title="Appointments"
          className="min-w-0"
          action={
            <Link to="/viewappointments" className={actionClassName}>
              View All Appointments
            </Link>
          }
        >
          <p className="mb-3 font-semibold">Today’s Appointments</p>
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
        </DashboardCard>

        <DashboardCard
          title="Customers"
          className="min-w-0"
          action={
            <Link to="/viewcustomers" className={actionClassName}>
              View All Customers
            </Link>
          }
        >
          <div className="space-y-4 text-center text-xl font-bold leading-tight md:space-y-8 md:text-2xl">
            <p>Total Customers: {count(summary?.customerCount)}</p>
            <p>Registered Vehicles: {count(summary?.vehicleCount)}</p>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Inventory"
          className="min-w-0"
          action={
            <Link to="/viewinventory" className={actionClassName}>
              View All Inventory
            </Link>
          }
        >
          <div className="text-center">
            <p className="mb-3 font-semibold">Lowest Stock</p>
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
        </DashboardCard>

        <DashboardCard
          title="Services"
          className="min-w-0"
          action={
            <Link to="/viewservices" className={actionClassName}>
              View Services
            </Link>
          }
        >
          <div className="space-y-4 text-center md:space-y-8">
            <p>Active Services: {count(summary?.activeServiceCount)}</p>
            <p>
              Most Popular:{" "}
              {summary
                ? (summary.popularService ?? "No completed jobs yet")
                : "—"}
            </p>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Appointment Requests"
          className="min-w-0"
          action={
            <Link to="/viewappointmentrequests" className={actionClassName}>
              Review Requests
            </Link>
          }
        >
          <p className="text-center text-xl font-bold leading-tight md:text-2xl">
            {summary
              ? `${count(summary.pendingCount)} ${summary.pendingCount === 1 ? "request" : "requests"} waiting review`
              : "— requests waiting review"}
          </p>
        </DashboardCard>

        <DashboardCard
          title="Shop Availability"
          className="min-w-0"
          action={
            <Link to="/shopavailability" className={actionClassName}>
              Manage Availability
            </Link>
          }
        >
          <p className="text-center">Manage the shop’s weekly hours and service availability.</p>
        </DashboardCard>
      </div>
    </main>
  );
}
