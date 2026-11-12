import { useNavigate } from 'react-router-dom'

export default function AdminDashboardCard({ title, actionLabel, children, className = '', navigateTo }) {
  const navigate = useNavigate()
  const titleId = `admin-${title.toLowerCase().replaceAll(' ', '-')}`

  return (
    <section
      aria-labelledby={titleId}
      className={`flex min-w-0 flex-col overflow-hidden rounded-[18px] border border-[#cccccc] bg-[#d9d9d9] md:rounded-md ${className}`}
    >
      <h2
        id={titleId}
        className="bg-[#3a3a3a] px-4 py-3 text-[22px] font-bold text-white md:bg-[#757575] md:px-6 md:py-4 md:text-center md:text-3xl lg:text-4xl xl:text-5xl"
      >
        {title}
      </h2>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex flex-1 flex-col justify-center text-[15px] leading-relaxed md:min-h-44 md:text-center md:text-xl lg:text-2xl xl:text-3xl">
          {children}
        </div>
        <button
          type="button"
          onClick={() => navigate(navigateTo)}
          className="min-h-12 w-full rounded-full bg-[#323232] px-3 py-2 text-base text-white disabled:cursor-not-allowed md:border-2 md:border-black md:text-xl md:font-semibold md:shadow-sm xl:text-3xl cursor-pointer"
        >
          {actionLabel}
        </button>
      </div>
    </section>
  )
}
