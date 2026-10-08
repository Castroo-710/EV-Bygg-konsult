export type Service = {
  title: string
  description: string
  icon: string
}

export const services: Service[] = [
  {
    title: 'Nybyggnation',
    description:
      'Helhetsansvar för nya villor, radhus och flerbostadshus — från markarbete till inflyttningsklart.',
    icon: 'building',
  },
  {
    title: 'Om- och tillbyggnad',
    description:
      'Vi utökar och förändrar befintliga hem, från vindsinredning till nya våningsplan.',
    icon: 'expand',
  },
  {
    title: 'Renovering',
    description:
      'Kök, badrum och helrenoveringar med fokus på kvalitet, funktion och hållbara material.',
    icon: 'hammer',
  },
  {
    title: 'Konstruktionsritningar',
    description:
      'Bygglovshandlingar och konstruktionsritningar framtagna enligt gällande normer och krav.',
    icon: 'blueprint',
  },
  {
    title: 'Projektledning',
    description:
      'Vi samordnar entreprenörer, tidsplan och budget så att ditt projekt levereras i tid.',
    icon: 'clipboard',
  },
  {
    title: 'Rådgivning & besiktning',
    description:
      'Oberoende konsultation, statusbesiktningar och rådgivning inför köp eller ombyggnation.',
    icon: 'search',
  },
]
