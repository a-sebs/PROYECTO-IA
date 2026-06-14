'use client'
import { navLinks } from '@/app/api/navlink'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import NavLink from './Navigation/NavLink'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useAuth } from '@/app/context/AuthContext'

const Header: React.FC = () => {
  const [navbarOpen, setNavbarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout, isLoading } = useAuth()

  const sideMenuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (sideMenuRef.current && !sideMenuRef.current.contains(event.target as Node)) {
      setNavbarOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="w-full bg-white dark:bg-dark border-b border-gray-200 dark:border-gray-700 shadow-sm z-50">
      <nav className="container mx-auto max-w-8xl flex items-center justify-between py-4 px-4 lg:px-0">
        <div className='flex justify-between items-center gap-2 w-full'>
          <div className="flex items-center">
            <Link href='/' className="flex items-center">
              <Image
                src={'/images/header/dark-logo.svg'}
                alt='DenDiTec Logo'
                width={90}
                height={40}
                unoptimized={true}
                className="block dark:hidden"
              />
              <Image
                src={'/images/header/logo.svg'}
                alt='DenDiTec Logo'
                width={90}
                height={40}
                unoptimized={true}
                className="hidden dark:block"
              />
            </Link>
          </div>
          
          <div className='flex items-center gap-4'>
            {/* Información del usuario logueado */}
            {!isLoading && user && (
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.nombre} {user.apellido}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    {!user.plan_activo && (
                      <span className="text-gray-600 dark:text-gray-400">
                        {user.creditos} créditos
                      </span>
                    )}
                    {user.plan_activo && (
                      <>
                        {!user.plan_activo && <span className="text-gray-400">•</span>}
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.plan_activo === 'vip_advanced' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                            : user.plan_activo === 'vip' 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        }`}>
                          {user.plan_activo === 'vip_advanced' ? 'VIP Advanced' : 
                           user.plan_activo === 'vip' ? 'VIP' : 'Premium'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            {/* Botón de cambio de tema */}
            <button
              className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Cambiar tema"
            >
              <Icon
                icon={'solar:sun-bold'}
                width={28}
                height={28}
                className="dark:hidden block text-gray-700 hover:text-primary"
              />
              <Icon
                icon={'solar:moon-bold'}
                width={28}
                height={28}
                className='dark:block hidden text-gray-300 hover:text-primary'
              />
            </button>
            
            {/* Botón de menú */}
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className="flex items-center gap-3 px-4 py-2 sm:px-6 sm:py-3 rounded-full font-semibold hover:cursor-pointer border-2 bg-primary text-white hover:bg-transparent hover:text-primary border-primary dark:bg-primary dark:text-white dark:hover:bg-transparent dark:hover:text-primary transition-all duration-300"
              aria-label='Abrir menú de navegación'>
              <Icon icon={'ph:list'} width={20} height={20} />
              <span className='hidden sm:block text-sm'>Menú</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay de fondo cuando el menú está abierto */}
      {navbarOpen && (
        <div className='fixed top-0 left-0 w-full h-full bg-black/60 z-40 backdrop-blur-sm' />
      )}

      {/* Menú lateral */}
      <div
        ref={sideMenuRef}
        className={`fixed top-0 right-0 h-full w-full bg-white dark:bg-dark shadow-2xl transition-transform duration-300 max-w-md ${navbarOpen ? 'translate-x-0' : 'translate-x-full'} z-50 overflow-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Header del menú */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Navegación</h2>
            <button
              onClick={() => setNavbarOpen(false)}
              aria-label='Cerrar menú'
              className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'>
              <Icon icon="ph:x" width={24} height={24} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Contenido del menú */}
          <div className="flex-1 p-6">
            <nav className='flex flex-col gap-2'>
              <ul className='space-y-2'>
                {navLinks.map((item, index) => (
                  <NavLink key={index} item={item} onClick={() => setNavbarOpen(false)} />
                ))}
              </ul>
              
              {/* Información del usuario en menú móvil */}
              {!isLoading && user && (
                <div className="md:hidden bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.nombre} {user.apellido}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        {!user.plan_activo && (
                          <span className="text-gray-600 dark:text-gray-400">
                            {user.creditos} créditos disponibles
                          </span>
                        )}
                        {user.plan_activo && (
                          <>
                            {!user.plan_activo && <span className="text-gray-400">•</span>}
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              user.plan_activo === 'vip_advanced' 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                : user.plan_activo === 'vip' 
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            }`}>
                              {user.plan_activo === 'vip_advanced' ? 'VIP Advanced' : 
                               user.plan_activo === 'vip' ? 'VIP' : 'Premium'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Botones de autenticación */}
              {!isLoading && (
                <div className='flex flex-col gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700'>
                  {user ? (
                    <button 
                      onClick={() => {
                        logout();
                        setNavbarOpen(false);
                      }}
                      className='py-3 px-6 bg-red-500 text-white text-center rounded-full border border-red-500 font-semibold hover:bg-transparent hover:text-red-500 transition-all duration-300'
                    >
                      Cerrar Sesión
                    </button>
                  ) : (
                    <>
                      <Link 
                        href="/signin" 
                        className='py-3 px-6 bg-primary text-white text-center rounded-full border border-primary font-semibold hover:bg-transparent hover:text-primary transition-all duration-300'
                        onClick={() => setNavbarOpen(false)}
                      >
                        Iniciar Sesión
                      </Link>
                      <Link 
                        href="/signup" 
                        className='py-3 px-6 bg-transparent border border-primary text-primary text-center rounded-full font-semibold hover:bg-primary hover:text-white transition-all duration-300'
                        onClick={() => setNavbarOpen(false)}
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              )}
            </nav>
          </div>

          {/* Footer del menú */}
          <div className='p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'>
            <p className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-3'>
              Contacto
            </p>
            <div className='space-y-2'>
              <Link href="#" className='block text-sm text-gray-700 dark:text-gray-300 hover:text-primary transition-colors'>
                hello@denditec.com
              </Link>
              <Link href="#" className='block text-sm text-gray-700 dark:text-gray-300 hover:text-primary transition-colors'>
                +1-212-456-7890
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
