export type Enfermedad = {
  name: string
  slug: string
  location: string
  rate: string
  severity: number
  frequency: number
  prevalence: number
  images: EnfermedadImage[]
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

interface EnfermedadImage {
  src: string;
}
