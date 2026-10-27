import { useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { company, navLinks } from '../data/company'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#hem" className="text-lg font-bold tracking-tight text-slate-900">
          {company.name}
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-amber-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={company.phoneHref}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-amber-600"
          >
            <Phone size={16} />
            {company.phone}
          </a>
          <a
            href="#boka"
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Boka konsultation
          </a>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <a
            href={company.phoneHref}
            className="flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white"
            aria-label={`Ring ${company.phone}`}
          >
            <Phone size={16} />
            Ring
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-slate-700"
            aria-label={open ? 'Stäng meny' : 'Öppna meny'}
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm font-medium text-slate-700"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#boka"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-md bg-amber-600 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Boka konsultation
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
