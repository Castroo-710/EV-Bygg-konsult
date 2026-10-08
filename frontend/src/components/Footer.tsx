import { company, navLinks } from '../data/company'

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 3h-2a5 5 0 0 0-5 5v2H6v4h2v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <div className="text-lg font-bold text-white">{company.name}</div>
            <p className="mt-2 max-w-xs text-sm text-slate-400">{company.description}</p>
            <div className="mt-4 flex gap-4">
              <a
                href={company.socials.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-slate-400 hover:text-amber-500"
              >
                <InstagramIcon />
              </a>
              <a
                href={company.socials.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-slate-400 hover:text-amber-500"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Navigering
            </div>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-slate-400 hover:text-amber-500">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Kontakt
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>{company.phone}</li>
              <li>{company.email}</li>
              <li>{company.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} {company.name}. Org.nr {company.orgNumber}. Alla
          rättigheter förbehållna.
        </div>
      </div>
    </footer>
  )
}
