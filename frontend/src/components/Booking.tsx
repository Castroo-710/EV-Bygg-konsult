import { useState, type FormEvent } from 'react'
import { services } from '../data/services'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function Booking() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')

    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
      event.currentTarget.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="boka" className="bg-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            Boka möte
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
            Boka en kostnadsfri konsultation
          </h2>
          <p className="mt-4 text-slate-300">
            Berätta kort om ditt projekt så återkommer vi inom en arbetsdag med en tid som passar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-name" className="text-sm font-medium text-slate-200">
              Namn
            </label>
            <input
              id="booking-name"
              name="name"
              required
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="För- och efternamn"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-phone" className="text-sm font-medium text-slate-200">
              Telefon
            </label>
            <input
              id="booking-phone"
              name="phone"
              type="tel"
              required
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="070-123 45 67"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-email" className="text-sm font-medium text-slate-200">
              E-post
            </label>
            <input
              id="booking-email"
              name="email"
              type="email"
              required
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="namn@exempel.se"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-date" className="text-sm font-medium text-slate-200">
              Önskat datum
            </label>
            <input
              id="booking-date"
              name="preferredDate"
              type="date"
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="booking-type" className="text-sm font-medium text-slate-200">
              Typ av projekt
            </label>
            <select
              id="booking-type"
              name="projectType"
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
            >
              {services.map((service) => (
                <option key={service.title} value={service.title}>
                  {service.title}
                </option>
              ))}
              <option value="Annat">Annat</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="booking-message" className="text-sm font-medium text-slate-200">
              Meddelande
            </label>
            <textarea
              id="booking-message"
              name="message"
              rows={4}
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="Berätta kort om ditt projekt..."
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-md bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60 sm:w-auto"
            >
              {status === 'sending' ? 'Skickar...' : 'Skicka bokningsförfrågan'}
            </button>
            {status === 'success' && (
              <p className="mt-3 text-sm text-emerald-400">
                Tack! Din förfrågan är mottagen — vi hör av oss inom kort.
              </p>
            )}
            {status === 'error' && (
              <p className="mt-3 text-sm text-red-400">
                Något gick fel. Ring oss gärna direkt så hjälper vi dig.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
