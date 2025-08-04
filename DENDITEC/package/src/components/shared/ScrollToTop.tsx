'use client';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Mostrar el botón cuando el usuario haga scroll hacia abajo
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Función para scroll hacia arriba
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-dark transition-all duration-300 flex items-center justify-center hover:shadow-xl transform hover:scale-110"
          aria-label="Volver arriba"
        >
          <Icon icon="ph:arrow-up-bold" width={24} height={24} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
