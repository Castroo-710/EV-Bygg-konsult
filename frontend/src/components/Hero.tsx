import { company } from '../data/company'

export default function Hero() {
  return (
    <section id="hem" className="bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col items-start px-6 py-28 md:py-36">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-500">
          Byggkonsult i Stockholmsregionen
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
          {company.tagline}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-slate-300">{company.description}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#boka"
            className="rounded-md bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Boka kostnadsfri konsultation
          </a>
          <a
            href="#projekt"
            className="rounded-md border border-slate-500 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
          >
            Se våra projekt
          </a>
        </div>
      </div>
    </section>
  )
}
