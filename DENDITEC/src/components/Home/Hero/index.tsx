"use client";

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'

const Hero: React.FC = () => {
  const { user } = useAuth();

  return (
    <section className='!py-0'>
      <div className='bg-gradient-to-b from-skyblue via-lightskyblue dark:via-[#4298b0] to-white/10 dark:to-black/10 overflow-hidden relative'>
        <div className='container max-w-8xl mx-auto px-5 2xl:px-0 pt-16 md:pt-24 md:pb-68'>
          <div className='relative text-white dark:text-dark text-center md:text-start z-10'>
            <h1 className='text-inherit text-5xl sm:text-7xl md:text-8xl font-semibold -tracking-wider md:max-w-45p mt-4 mb-3'>
              DenDiTec
            </h1>
            <p className='text-inherit text-lg sm:text-xl md:text-2xl font-medium opacity-90 mb-8 md:max-w-45p'>
              Detector de Enfermedades Orales
            </p>
            <div className='flex flex-col xs:flex-row justify-center md:justify-start gap-4'>
              <Link href="/detectorIA" className='px-8 py-4 border border-white dark:border-dark bg-white dark:bg-dark text-dark dark:text-white duration-300 dark:hover:text-dark hover:bg-transparent hover:text-white text-base font-semibold rounded-full hover:cursor-pointer'>
                Usar Detector IA
              </Link>
              {!user && (
                <Link href="/signin" className='px-8 py-4 border border-white dark:border-dark bg-transparent text-white dark:text-dark duration-300 hover:bg-white hover:text-dark dark:hover:bg-dark dark:hover:text-white text-base font-semibold rounded-full hover:cursor-pointer'>
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
          <div className='hidden md:block absolute -top-2 -right-68'>
            <Image
              src={'/images/hero/circuitoBanner.png'}
              alt='heroImg'
              width={1000}
              height={300}
              priority={false}
              unoptimized={true}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
