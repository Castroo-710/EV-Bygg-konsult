import type { ReactNode } from 'react'
import { company } from '../data/company'

const updated = '27 oktober 2026'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3 text-slate-600">{children}</div>
    </section>
  )
}

export default function PrivacyPolicy() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-sm font-semibold uppercase tracking-widest text-amber-600">
        Integritetspolicy
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
        Så hanterar vi dina personuppgifter
      </h1>
      <p className="mt-4 text-sm text-slate-500">Senast uppdaterad: {updated}</p>

      <Section title="Personuppgiftsansvarig">
        <p>
          {company.name} (org.nr {company.orgNumber}), {company.address}, är
          personuppgiftsansvarig för behandlingen av dina personuppgifter. Har du frågor om hur vi
          hanterar dina uppgifter är du välkommen att kontakta oss på{' '}
          <a href={company.emailHref} className="text-amber-700 underline">
            {company.email}
          </a>
          .
        </p>
      </Section>

      <Section title="Vilka uppgifter vi samlar in">
        <p>När du kontaktar oss via formulären på webbplatsen sparar vi de uppgifter du lämnar:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>namn, e-postadress och telefonnummer</li>
          <li>ditt meddelande, önskat datum och typ av projekt</li>
          <li>vilken sida på webbplatsen förfrågan skickades från</li>
        </ul>
        <p>
          Kontaktar du oss via telefon eller mejl behandlar vi de uppgifter du själv lämnar i
          samtalet eller mejlet.
        </p>
      </Section>

      <Section title="Varför vi behandlar uppgifterna och med vilket stöd">
        <p>
          Vi använder uppgifterna för att besvara din förfrågan, boka möte och ta fram offert.
          Behandlingen sker för att vidta åtgärder på din begäran innan ett eventuellt avtal ingås
          (artikel 6.1 b i dataskyddsförordningen, GDPR) och utifrån vårt berättigade intresse av
          att kunna besvara förfrågningar (artikel 6.1 f).
        </p>
        <p>
          Blir du kund behandlar vi uppgifterna för att fullgöra avtalet och för att uppfylla krav
          i bland annat bokföringslagen.
        </p>
      </Section>

      <Section title="Hur länge vi sparar uppgifterna">
        <p>
          Förfrågningar som inte leder till uppdrag raderas senast 12 månader efter att ärendet
          avslutats. Blir du kund sparas uppgifterna så länge avtalet gäller och därefter så länge
          lagen kräver, till exempel sju år för bokföringsunderlag.
        </p>
      </Section>

      <Section title="Vilka som får ta del av uppgifterna">
        <p>
          Vi säljer aldrig dina uppgifter. För att driva webbplatsen och hantera förfrågningar
          anlitar vi följande leverantörer, som behandlar uppgifterna för vår räkning:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Netlify Inc. – driftar webbplatsen och tar emot formulären</li>
          <li>Google LLC – e-post (Gmail)</li>
        </ul>
        <p>
          Leverantörerna är baserade i USA, vilket innebär att uppgifter kan överföras dit. Båda
          är anslutna till EU–US Data Privacy Framework, som enligt EU-kommissionen ger en adekvat
          skyddsnivå. Överföringen omfattas även av EU-kommissionens standardavtalsklausuler.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Webbplatsen använder inga cookies för spårning eller marknadsföring. Vår driftleverantör
          kan tillfälligt logga tekniska uppgifter som IP-adress för att skydda webbplatsen mot
          missbruk.
        </p>
      </Section>

      <Section title="Dina rättigheter">
        <p>Du har rätt att:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>få veta vilka uppgifter vi har om dig och få en kopia av dem</li>
          <li>få felaktiga uppgifter rättade</li>
          <li>få dina uppgifter raderade</li>
          <li>begära att behandlingen begränsas eller invända mot den</li>
          <li>få ut uppgifterna i ett maskinläsbart format (dataportabilitet)</li>
        </ul>
        <p>
          Kontakta oss på{' '}
          <a href={company.emailHref} className="text-amber-700 underline">
            {company.email}
          </a>{' '}
          om du vill använda någon av dina rättigheter. Är du missnöjd med hur vi hanterar dina
          uppgifter kan du lämna klagomål till{' '}
          <a
            href="https://www.imy.se"
            target="_blank"
            rel="noreferrer"
            className="text-amber-700 underline"
          >
            Integritetsskyddsmyndigheten (IMY)
          </a>
          .
        </p>
      </Section>
    </article>
  )
}
