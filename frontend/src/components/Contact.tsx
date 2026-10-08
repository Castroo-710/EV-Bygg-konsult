import { useState, type FormEvent } from 'react'
import { Phone, Mail, MapPin } from 'lucide-react'
import { company } from '../data/company'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')

    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())

    try {
      const res = await fetch('/api/contact', {
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
    <section id="kontakt" className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">Kontakt</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">Hör av dig</h2>
        <p className="mt-4 text-slate-600">
          Har du frågor eller vill diskutera ett projekt? Ring, mejla eller skicka ett meddelande
          så återkommer vi så snart vi kan.
        </p>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <a
            href={company.phoneHref}
            className="flex items-start gap-4 rounded-xl border border-slate-200 p-5 transition hover:border-amber-300"
          >
            <Phone className="mt-0.5 shrink-0 text-amber-600" size={20} />
            <div>
              <div className="font-semibold text-slate-900">Telefon</div>
              <div className="text-sm text-slate-600">{company.phone}</div>
            </div>
          </a>

          <a
            href={company.emailHref}
            className="flex items-start gap-4 rounded-xl border border-slate-200 p-5 transition hover:border-amber-300"
          >
            <Mail className="mt-0.5 shrink-0 text-amber-600" size={20} />
            <div>
              <div className="font-semibold text-slate-900">E-post</div>
              <div className="text-sm text-slate-600">{company.email}</div>
            </div>
          </a>

          <div className="flex items-start gap-4 rounded-xl border border-slate-200 p-5">
            <MapPin className="mt-0.5 shrink-0 text-amber-600" size={20} />
            <div>
              <div className="font-semibold text-slate-900">Adress</div>
              <div className="text-sm text-slate-600">{company.address}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-3 grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
              Namn
            </label>
            <input
              id="contact-name"
              name="name"
              required
              className="rounded-md border border-slate-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-email" className="text-sm font-medium text-slate-700">
              E-post
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              className="rounded-md border border-slate-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="contact-message" className="text-sm font-medium text-slate-700">
              Meddelande
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              required
              className="rounded-md border border-slate-300 px-4 py-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
            >
              {status === 'sending' ? 'Skickar...' : 'Skicka meddelande'}
            </button>
            {status === 'success' && (
              <p className="mt-3 text-sm text-emerald-600">
                Tack för ditt meddelande! Vi återkommer så snart vi kan.
              </p>
            )}
            {status === 'error' && (
              <p className="mt-3 text-sm text-red-600">
                Något gick fel. Ring oss gärna direkt på {company.phone}.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
