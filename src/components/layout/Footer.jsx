import { Link } from 'react-router-dom'
import { footerPolicyLinks } from '../../config/footerPolicyLinks.js'
import garageGloLogo from '../../assets/GarageGloLogo.svg'

const policyRoutes = {
  'privacy policy': '/privacy-policy',
  'terms of service': '/terms-of-service',
}

export default function Footer({ policyLinks = footerPolicyLinks }) {
  const visibleLinks = policyLinks
    .filter(({ label }) =>
      ['privacy policy', 'terms of service'].includes(label.trim().toLowerCase()),
    )
    .map((link) => ({
      ...link,
      href: link.href || policyRoutes[link.label.trim().toLowerCase()],
    }))

  return (
    <footer className="w-full shrink-0 border-t border-white/15 bg-[#323232] font-sans text-[#d9d9d9]">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            to="/"
            aria-label="Garage Glo home"
            className="inline-flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <img src={garageGloLogo} alt="" className="size-12 object-contain" />
            <span className="text-xl font-semibold tracking-tight text-white">
              Garage Glo
            </span>
          </Link>

          <p className="text-sm">Tire service in Salinas, California.</p>

          <nav
            aria-label="Policies"
            className="flex flex-wrap items-center gap-x-4 gap-y-2 md:ml-auto"
          >
              <h2 className="text-sm font-semibold text-white">Policies</h2>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {visibleLinks.map(({ id, label, href }) => (
                <li key={id}>
                  <Link
                    to={href}
                    className="text-sm underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-3 border-t border-white/15 pt-3 text-xs leading-4">
          &copy; {new Date().getFullYear()} Garage Glo. All rights reserved.
        </p>
      </div>
    </footer>
  )
}