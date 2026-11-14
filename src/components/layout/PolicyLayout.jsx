import Header from './Header.jsx'

export default function PolicyLayout({ title, children }) {
  return (
    <>
      <title>{`${title} | Garage Glo`}</title>
      <meta name="robots" content="noindex" />
      <a
        href="#policy-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:outline-2 focus:outline-foreground"
      >
        Skip to policy content
      </a>
      <Header />
      <main
        id="policy-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-3xl scroll-mt-8 px-4 py-8 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground sm:px-8 sm:py-12"
      >
        <article aria-labelledby="policy-title">
          <h1 id="policy-title" className="text-3xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <div className="mt-5 rounded-lg border border-border bg-muted p-4">
            <p className="font-semibold">Draft for review</p>
            <p className="mt-1">
              Adrian and the project team must approve this draft before it is published as Garage Glo policy.
            </p>
          </div>
          <div className="mt-8 space-y-8 leading-relaxed wrap-break-word [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_p+p]:mt-3 [&_a]:underline [&_a]:underline-offset-4 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-foreground">
            {children}
          </div>
        </article>
      </main>
    </>
  )
}
