const stats = [
  { value: '15+', label: 'års erfarenhet' },
  { value: '120+', label: 'genomförda projekt' },
  { value: '98%', label: 'nöjda kunder' },
  { value: '30+', label: 'aktiva samarbetspartners' },
]

export default function About() {
  return (
    <section id="om-oss" className="bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
            Om EV-Bygg-konsult
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Byggbart, kostnadseffektivt och hållbart
          </h2>
          <p className="mt-6 text-slate-600">
            Vi är ett byggkonsultföretag med rötterna i Stockholm. Vårt team av ingenjörer,
            projektledare och hantverkare arbetar tillsammans för att skapa lösningar som håller —
            praktiskt, ekonomiskt och över tid.
          </p>
          <p className="mt-4 text-slate-600">
            Oavsett om det gäller en villa, ett flerbostadshus eller en kommersiell lokal utgår vi
            alltid från rätt material på rätt plats, tydlig kommunikation och ett nära samarbete
            med dig som kund genom hela processen.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-6 text-center"
            >
              <div className="text-3xl font-bold text-amber-600">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
