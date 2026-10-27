import { useState, type FormEvent } from 'react'
import { company } from '../data/company'
import { services } from '../data/services'
import { submitNetlifyForm } from '../lib/netlifyForm'

type Status = 'idle' | 'sending' | 'success' | 'error'

function today() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function Booking() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')

    const form = event.currentTarget

    try {
      await submitNetlifyForm('bokning', form)
      setStatus('success')
      form.reset()
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
          <p hidden>
            <label>
              Fyll inte i detta fält: <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </p>

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
              min={today()}
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
              required
              defaultValue=""
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="" disabled>
                Välj typ av projekt…
              </option>
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

          <label className="flex items-start gap-3 text-sm text-slate-300 sm:col-span-2">
            <input
              type="checkbox"
              name="consent"
              value="ja"
              required
              className="mt-1 accent-amber-600"
            />
            Jag godkänner att {company.name} sparar och behandlar mina uppgifter för att kunna
            besvara min förfrågan.
          </label>

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
                Något gick fel. Ring oss gärna på {company.phone} eller mejla {company.email}.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
