import DetectorIA from '@/components/Home/DetectorIA'
import Hero from '@/components/Home/Hero'
import Enfermedades from '@/components/Home/Enfermedades'
import Testimonial from '@/components/Home/Testimonial'
import ChatbotDenDi from '@/components/Home/ChatbotDenDi'

export default function Home() {
  return (
    <main>
      <Hero />
      <Enfermedades />
      <DetectorIA />
      <Testimonial />
      <ChatbotDenDi />
    </main>
  )
}
