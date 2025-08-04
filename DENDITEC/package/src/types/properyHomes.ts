export type PropertyHomes = {
  name: string
  slug: string
  location: string
  rate: string
  severity: number
  frequency: number
  prevalence: number
  images: PropertyImage[]
  description?: {
    intro?: string
    mainContent?: string[]
    symptoms?: {
      title: string
      description: string
    }[]
    treatments?: {
      title: string
      description: string
    }[]
  }
}

interface PropertyImage {
  src: string;
}
