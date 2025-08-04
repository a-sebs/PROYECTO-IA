export type Testimonial = {
    review: string
    name: string
    position: string
    image: string
    diseases?: string[]  // Array de enfermedades asociadas al testimonial
}