export type ListItem = {
  id: string
  title: string
  description: string
}

export type SiteConfig = {
  siteTitle: string
  hero: {
    headlinePrimary: string
    headlineEmphasis: string
    subtitle: string
  }
  pharmacist: {
    name: string
    description: string
    credentials: string[]
    profileDescription: string
    avatarUrl: string
  }
  services: {
    headline: string
    subtitle: string
    items: ListItem[]
  }
  trust: {
    items: ListItem[]
  }
  cosmeticLine: {
    headline: string
    subtitle: string
    items: ListItem[]
  }
}
