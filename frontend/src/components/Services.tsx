import { Building2, Maximize, Hammer, Ruler, ClipboardList, Search, type LucideIcon } from 'lucide-react'
import { services } from '../data/services'

const icons: Record<string, LucideIcon> = {
  building: Building2,
  expand: Maximize,
  hammer: Hammer,
  blueprint: Ruler,
  clipboard: ClipboardList,
  search: Search,
}

export default function Services() {
  return (
    <section id="tjanster" className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
          Vad vi erbjuder
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Våra tjänster</h2>
        <p className="mt-4 text-slate-600">
          Från första idé till nyckelfärdigt resultat — vi tar ansvar för hela processen eller
          bidrar med spetskompetens där du behöver oss som mest.
        </p>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = icons[service.icon]
          return (
            <div
              key={service.title}
              className="rounded-xl border border-slate-200 p-6 transition hover:border-amber-300 hover:shadow-md"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{service.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
