import { projects } from '../data/projects'

export default function Projects() {
  return (
    <section id="projekt" className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
          Referensprojekt
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Några av våra projekt</h2>
        <p className="mt-4 text-slate-600">
          Ett urval av nybyggnationer, tillbyggnader och renoveringar vi har genomfört i
          Stockholmsregionen.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <figure
            key={project.name}
            className="group overflow-hidden rounded-xl border border-slate-200"
          >
            <div className="aspect-4/3 overflow-hidden">
              <img
                src={project.image}
                alt={project.name}
                className="size-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <figcaption className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                {project.category}
              </span>
              <h3 className="mt-1 font-semibold text-slate-900">{project.name}</h3>
              <p className="text-sm text-slate-500">{project.location}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
