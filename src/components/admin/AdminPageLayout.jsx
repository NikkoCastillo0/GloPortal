export function AdminPageLayout({ header, children, className = '' }) {
  return (
    <div className="min-h-screen bg-[#f6f6f4] text-[#242424]">
      {header}

      <main className={`mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 ${className}`}>
        {children}
      </main>
    </div>
  )
}

export function AdminPageHeader({ title, description, action, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-[#242424] sm:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm leading-6 text-[#717171] sm:text-base">
            {description}
          </p>
        )}

        {children && <div className="mt-2">{children}</div>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}