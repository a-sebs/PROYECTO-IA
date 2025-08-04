import EnfermedadCard from '@/components/Home/Enfermedades/Card/Card'
import { enfermedades } from '@/app/api/enfermedades'

const EnfermedadesListing: React.FC = () => {
  return (
    <section className='pt-0!'>
      <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10'>
          {enfermedades.map((enfermedad, index) => (
            <div key={index} className=''>
              <EnfermedadCard item={enfermedad} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EnfermedadesListing
