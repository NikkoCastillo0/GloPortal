import { Link } from 'react-router-dom'
import { footerPolicyLinks } from '../../config/footerPolicyLinks.js'
import garageGloLogo from '../../assets/GarageGloLogo.svg'

export default function Footer({ policyLinks = footerPolicyLinks }) {
  return (
    <footer className="shrink-0 border-t border-white/15 bg-[#323232] font-sans text-[#d9d9d9]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-10">
          <div className="min-w-0 md:max-w-xs">
            <Link
              to="/"
              aria-label="Garage Glo home"
              className="inline-flex items-center gap-4 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <img src={garageGloLogo} alt="" className="size-16 shrink-0 object-contain" />
              <span className="text-2xl font-semibold tracking-tight text-white">Garage Glo</span>
            </Link>
            <p className="mt-3 text-sm leading-6">Tire service in Salinas, California.</p>
          </div>

          <nav aria-label="Policies" className="min-w-0 md:max-w-xl">
            <h2 className="text-sm font-semibold text-white">Policies</h2>
            <ul className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {policyLinks.map(({ id, label, href }) => (
                <li key={id} className="min-w-0">
                  {href ? (
                    <a
                      href={href}
                      className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                      {label}
                    </a>
                  ) : (
                    <span aria-disabled="true" className="inline-flex min-h-11 flex-col justify-center gap-1 text-sm">
                      <span>{label}</span>
                      <span className="text-xs text-[#d9d9d9]">Coming soon</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-8 border-t border-white/15 pt-5 text-xs leading-5">
          &copy; {new Date().getFullYear()} Garage Glo. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
