"use client";
import { Icon } from '@iconify/react'
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

// Función utilitaria para obtener la URL base del backend
const getBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname.includes('devtunnels.ms')) {
      return 'https://nc26qlpz-8001.use2.devtunnels.ms';
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    } else {
      return `http://${hostname}:8001`;
    }
  } else {
    return 'http://localhost:8000';
  }
};

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  duracion: string;
  descripcion: string;
  caracteristicas: string[];
  popular?: boolean;
  gratuito?: boolean;
}

export default function PlanesPage() {
  const { user, updateUserPlan } = useAuth();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Definir los planes disponibles
  const planesDisponibles: Plan[] = [
    {
      id: 'gratuito',
      nombre: 'Plan Gratuito',
      precio: 0,
      duracion: 'Permanente',
      descripcion: 'Perfecto para comenzar a explorar DenDiTec',
      caracteristicas: [
        'Acceso a chatBot Dendi',
        'Acceso a módulos informativos sobre enfermedades dentales',
        '1050 créditos iniciales',
        'Análisis de IA limitados por créditos',
        '2 descargas de PDF gratuitas'
      ],
      gratuito: true
    },
    {
      id: 'premium',
      nombre: 'Premium',
      precio: 1.99,
      duracion: 'Semanal',
      descripcion: 'Ideal para uso regular',
      caracteristicas: [
        'Análisis de IA ilimitados',
        'Cantidad de descargas de PDF ampliadas',
        'Sin restricciones de créditos',
        'Acceso prioritario a nuevas funciones'
      ]
    },
    {
      id: 'vip',
      nombre: 'VIP',
      precio: 5.99,
      duracion: 'Mensual',
      descripcion: 'Ahorras más del 30% con este plan',
      caracteristicas: [
        'Análisis de IA ilimitados durante 30 días',
        'Descargas de PDF ilimitadas',
        'Acceso prioritario a nuevas funciones'
      ],
      popular: true
    },
    {
      id: 'vip_advanced',
      nombre: 'VIP Advanced',
      precio: 59.99,
      duracion: 'Anual',
      descripcion: 'Ahorras más del 40% con este plan',
      caracteristicas: [
        'Todo lo del plan VIP',
        'Acceso a nuestro sistema durante todo el año',
        'Soporte técnico 24/7',
        'Acceso a nuevos modelos de IA y actualizaciones exclusivas',
      ]
    }
  ];

  useEffect(() => {
    setPlanes(planesDisponibles);
  }, []);

  // Función para obtener el plan actual del usuario
  const getPlanActual = () => {
    if (!user?.plan_activo || user.plan_activo === null) {
      return planesDisponibles.find(p => p.id === 'gratuito');
    }
    // Verificación adicional para TypeScript
    const planActivo = user.plan_activo;
    if (!planActivo) {
      return planesDisponibles.find(p => p.id === 'gratuito');
    }
    
    // Buscar por ID exacto primero
    let plan = planesDisponibles.find(p => p.id === planActivo.toLowerCase());
    
    // Si no se encuentra por ID, buscar por nombre
    if (!plan) {
      plan = planesDisponibles.find(p => p.nombre.toLowerCase().includes(planActivo.toLowerCase()));
    }
    
    // Si aún no se encuentra, retornar plan gratuito
    return plan || planesDisponibles.find(p => p.id === 'gratuito');
  };

  // Función para seleccionar un plan
  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      alert('Debes iniciar sesión para seleccionar un plan');
      return;
    }

    if (plan.gratuito) {
      alert('Ya tienes acceso al plan gratuito');
      return;
    }

    const planActual = getPlanActual();
    if (planActual?.id === plan.id) {
      alert('Ya tienes este plan activo');
      return;
    }

    setLoading(true);

    try {
      // Obtener la URL base del backend
      const baseUrl = getBackendUrl();

      const response = await fetch(`${baseUrl}/api/crear-suscripcion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          plan_tipo: plan.id, // Cambiar de plan.nombre a plan.id
          precio: plan.precio
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`¡Plan ${plan.nombre} activado exitosamente!`);
        
        // Actualizar el plan del usuario en el contexto
        if (updateUserPlan) {
          updateUserPlan(plan.nombre);
        }
        
        // Recargar la página para mostrar los cambios
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error al activar el plan: ${errorData.detail || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al activar plan:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar el plan actual
  const handleCancelPlan = async () => {
    if (!user) return;

    const planActual = getPlanActual();
    if (planActual?.gratuito) {
      alert('Ya estás en el plan gratuito');
      return;
    }

    const confirmCancel = confirm('¿Estás seguro de que quieres cancelar tu plan actual y volver al plan gratuito?');
    if (!confirmCancel) return;

    setCancelLoading(true);

    try {
      // Obtener la URL base del backend
      const baseUrl = getBackendUrl();

      const response = await fetch(`${baseUrl}/api/cancelar-suscripcion/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert('Plan cancelado exitosamente. Has vuelto al plan gratuito.');
        
        // Actualizar el plan del usuario en el contexto
        if (updateUserPlan) {
          updateUserPlan(null);
        }
        
        // Recargar la página para mostrar los cambios
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error al cancelar el plan: ${errorData.detail || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al cancelar plan:', error);
      alert('Error al conectar con el servidor');
    } finally {
      setCancelLoading(false);
    }
  };

  const planActual = getPlanActual();

  // Debug info - remover en producción
  console.log('Usuario actual:', user);
  console.log('Plan activo del usuario:', user?.plan_activo);
  console.log('Plan actual detectado:', planActual);

  return (
    <div className='container max-w-8xl mx-auto px-5 2xl:px-0 pt-16 md:pt-20 pb-14 md:pb-28'>
      {/* Header */}
      <div className='mb-16'>
        <div className='flex gap-2.5 items-center justify-center mb-3'>
          <span>
            <Icon
              icon={'ph:crown'}
              width={20}
              height={20}
              className='text-primary'
            />
          </span>
          <p className='text-base font-semibold text-badge dark:text-white/90'>
            Planes de Suscripción
          </p>
        </div>
        <div className='text-center'>
          <h3 className='text-4xl sm:text-52 font-medium tracking-tighter text-black dark:text-white mb-3 leading-10 sm:leading-14'>
            Elige el plan perfecto para ti
          </h3>
          <p className='text-xm font-normal tracking-tight text-black/50 dark:text-white/50 leading-6'>
            Desde análisis básicos hasta soluciones profesionales completas. 
            Encuentra el plan que mejor se adapte a tus necesidades.
          </p>
        </div>
      </div>

      {/* Plan Actual */}
      {user && planActual && (
        <div className='mb-12'>
          <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-8'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center'>
                  <Icon icon="ph:user-circle" width={32} height={32} className="text-white" />
                </div>
                <div>
                  <h4 className='text-xl font-semibold text-blue-700 dark:text-blue-300 mb-1'>
                    Tu Plan Actual
                  </h4>
                  <p className='text-2xl font-bold text-blue-800 dark:text-blue-200'>
                    {planActual.nombre}
                  </p>
                  <p className='text-sm text-blue-600 dark:text-blue-400'>
                    {planActual.gratuito ? 'Plan permanente' : `${planActual.duracion} - $${planActual.precio}`}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                {!planActual.gratuito && (
                  <button
                    onClick={handleCancelPlan}
                    disabled={cancelLoading}
                    className={`px-6 py-3 rounded-full font-medium transition-colors ${
                      cancelLoading 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {cancelLoading ? (
                      <div className='flex items-center gap-2'>
                        <Icon icon="ph:spinner" width={16} height={16} className="animate-spin" />
                        <span>Cancelando...</span>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2'>
                        <Icon icon="ph:x-circle" width={16} height={16} />
                        <span>Cancelar Plan Actual</span>
                      </div>
                    )}
                  </button>
                )}
                
                {planActual.gratuito && (
                  <div className="px-6 py-3 bg-green-100 dark:bg-green-900/20 rounded-full text-center">
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      ✅ Plan Gratuito Activo
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Planes Disponibles */}
      <div className='grid lg:grid-cols-2 xl:grid-cols-4 gap-8'>
        {planes.map((plan, index) => {
          const esPlanActual = planActual?.id === plan.id;
          
          return (
            <div 
              key={plan.id} 
              className={`relative border rounded-2xl p-8 transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-primary bg-gradient-to-b from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20' 
                  : esPlanActual
                  ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30'
                  : 'border-black/10 dark:border-white/10 bg-white dark:bg-gray-800/50'
              }`}
            >
              {/* Badge para plan popular */}
              {plan.popular && (
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                  <div className='bg-primary text-white px-4 py-2 rounded-full text-sm font-medium'>
                    🔥 Más Popular
                  </div>
                </div>
              )}

              {/* Badge para plan actual */}
              {esPlanActual && (
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                  <div className='bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium'>
                    ✨ Tu Plan Actual
                  </div>
                </div>
              )}

              {/* Header del plan */}
              <div className='text-center mb-8'>
                <h4 className='text-2xl font-semibold text-black dark:text-white mb-2'>
                  {plan.nombre}
                </h4>
                <p className='text-sm text-black/60 dark:text-white/60 mb-4'>
                  {plan.descripcion}
                </p>
                
                {plan.gratuito ? (
                  <div className='mb-2'>
                    <span className='text-4xl font-bold text-green-600 dark:text-green-400'>
                      Gratis
                    </span>
                  </div>
                ) : (
                  <div className='mb-2'>
                    <span className='text-4xl font-bold text-black dark:text-white'>
                      ${plan.precio}
                    </span>
                    <span className='text-lg text-black/60 dark:text-white/60 ml-1'>
                      /{plan.duracion.toLowerCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Características */}
              <ul className='space-y-4 mb-8'>
                {plan.caracteristicas.map((caracteristica, i) => (
                  <li key={i} className='flex items-start gap-3'>
                    <Icon 
                      icon="ph:check-circle" 
                      width={20} 
                      height={20} 
                      className={`${
                        plan.popular ? 'text-primary' : 
                        esPlanActual ? 'text-blue-500' :
                        plan.gratuito ? 'text-green-500' : 'text-gray-500'
                      } mt-0.5 flex-shrink-0`} 
                    />
                    <span className='text-sm text-black dark:text-white'>
                      {caracteristica}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Botón de acción */}
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={loading || esPlanActual}
                className={`w-full py-4 px-6 rounded-full font-semibold transition-colors ${
                  esPlanActual
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-primary text-white hover:bg-dark'
                    : plan.gratuito
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                }`}
              >
                {loading ? (
                  <div className='flex items-center justify-center gap-2'>
                    <Icon icon="ph:spinner" width={20} height={20} className="animate-spin" />
                    <span>Procesando...</span>
                  </div>
                ) : esPlanActual ? (
                  'Plan Actual'
                ) : plan.gratuito ? (
                  'Plan Incluido'
                ) : (
                  `Seleccionar ${plan.nombre}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className='mt-16'>
        <div className='bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8'>
          <div className='text-center mb-8'>
            <h4 className='text-2xl font-semibold text-black dark:text-white mb-4'>
              ¿Tienes preguntas sobre nuestros planes?
            </h4>
            <p className='text-black/60 dark:text-white/60'>
              Estamos aquí para ayudarte a elegir el plan perfecto para tus necesidades.
            </p>
          </div>
          
          <div className='grid md:grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Icon icon="ph:money" width={32} height={32} className="text-primary" />
              </div>
              <h5 className='text-lg font-medium text-black dark:text-white mb-2'>
                Sin compromisos
              </h5>
              <p className='text-sm text-black/60 dark:text-white/60'>
                Cancela tu suscripción en cualquier momento sin penalizaciones.
              </p>
            </div>
            
            <div className='text-center'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Icon icon="ph:shield-check" width={32} height={32} className="text-primary" />
              </div>
              <h5 className='text-lg font-medium text-black dark:text-white mb-2'>
                Seguro y confiable
              </h5>
              <p className='text-sm text-black/60 dark:text-white/60'>
                Todos los pagos están protegidos con encriptación de nivel bancario.
              </p>
            </div>
            
            <div className='text-center'>
              <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Icon icon="ph:headset" width={32} height={32} className="text-primary" />
              </div>
              <h5 className='text-lg font-medium text-black dark:text-white mb-2'>
                Soporte 24/7
              </h5>
              <p className='text-sm text-black/60 dark:text-white/60'>
                Nuestro equipo está disponible para ayudarte en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
