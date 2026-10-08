export type Project = {
  name: string
  location: string
  category: string
  image: string
}

export const projects: Project[] = [
  {
    name: 'Villa Solsidan',
    location: 'Lidingö',
    category: 'Nybyggnation',
    image: 'https://placehold.co/600x450/1e293b/f8fafc?text=Villa+Solsidan',
  },
  {
    name: 'Radhusområde Ängen',
    location: 'Täby',
    category: 'Nybyggnation',
    image: 'https://placehold.co/600x450/1e293b/f8fafc?text=Radhus+Ängen',
  },
  {
    name: 'Vindsinredning Vasastan',
    location: 'Stockholm',
    category: 'Tillbyggnad',
    image: 'https://placehold.co/600x450/1e293b/f8fafc?text=Vindsinredning',
  },
  {
    name: 'Köksrenovering Brf Eken',
    location: 'Nacka',
    category: 'Renovering',
    image: 'https://placehold.co/600x450/1e293b/f8fafc?text=Köksrenovering',
  },
  {
    name: 'Tillbyggnad Villa Berg',
    location: 'Huddinge',
    category: 'Tillbyggnad',
    image: 'https://placehold.co/600x450/1e293b/f8fafc?text=Villa+Berg',
  },
  {
    name: 'Kontorslokal ombyggnad',
    location: 'Solna',
    category: 'Renovering',
    image: 'https://placehold.co/600x450/1e293b/f8fafc?text=Kontorslokal',
  },
]
