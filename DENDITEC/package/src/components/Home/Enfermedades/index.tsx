import { Icon } from '@iconify/react'
import EnfermedadCard from './Card/Card'
import { enfermedades } from '@/app/api/enfermedades'

const Enfermedades: React.FC = () => {
  return (
    <section>
      <div className='container max-w-8xl mx-auto px-5 2xl:px-0'>
        <div className='mb-16 flex flex-col gap-3 '>
          <div className='flex gap-2.5 items-center justify-center'>
            <span>
              <Icon
                icon={'ph:tooth-fill'}
                width={20}
                height={20}
                className='text-primary'
              />
            </span>
            <p className='text-base font-semibold text-dark/75 dark:text-white/75'>
              Enfermedades Orales
            </p>
          </div>
          <h2 className='text-40 lg:text-52 font-medium text-black dark:text-white text-center tracking-tight leading-11 mb-2'>
            Conoce las principales enfermedades orales que nuestra IA detecta
          </h2>
          <p className='text-xm font-normal text-black/50 dark:text-white/50 text-center'>
            Información médica completa sobre las 6 enfermedades más comunes.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10'>
          {enfermedades.slice(0, 6).map((item, index) => (
            <div key={index} className=''>
              <EnfermedadCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Enfermedades
