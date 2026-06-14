import { Enfermedad } from '@/types/enfermedad'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'

const EnfermedadCard: React.FC<{ item: Enfermedad }> = ({ item }) => {
  const { name, location, rate, severity, frequency, prevalence, slug, images } = item

  const mainImage = images[0]?.src;

  return (
    <div>
      <div className='relative rounded-2xl border border-dark/10 dark:border-white/10 group hover:shadow-3xl duration-300 dark:hover:shadow-white/20'>
        <div className='overflow-hidden rounded-t-2xl'>
          <Link href={`/enfermedades/${slug}`}>
            {mainImage && (
              <Image
                src={mainImage}
                alt={name}
                width={440}
                height={300}
                className='w-full rounded-t-2xl group-hover:brightness-50 group-hover:scale-125 transition duration-300 delay-75'
                unoptimized={true}
              />
            )}
          </Link>
          <div className='absolute top-6 right-6 p-4 bg-white rounded-full hidden group-hover:block'>
            <Icon
              icon={'solar:arrow-right-linear'}
              width={24}
              height={24}
              className='text-black'
            />
          </div>
        </div>
        <div className='p-6'>
          <div className='flex flex-col mobile:flex-row gap-5 mobile:gap-0 justify-between mb-6'>
            <div>
              <Link href={`/enfermedades/${slug}`}>
                <h3 className='text-xl font-medium text-black dark:text-white duration-300 group-hover:text-primary'>
                  {name}
                </h3>
              </Link>
              <p className='text-base font-normal text-black/50 dark:text-white/50'>
                {location}
              </p>
            </div>
            <div>
              <button className='text-base font-normal text-primary px-5 py-2 rounded-full bg-primary/10'>
                {rate}
              </button>
            </div>
          </div>
          <div className='flex justify-start gap-8'>
            <div className='flex items-center gap-2'>
              <Icon icon="ph:warning-circle" width={20} height={20} />
              <p className='text-xm text-dark dark:text-white'>
                Severidad: {severity}/10
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Icon icon="ph:chart-line" width={20} height={20} />
              <p className='text-xm text-dark dark:text-white'>
                Frecuencia: {frequency}/5
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnfermedadCard
