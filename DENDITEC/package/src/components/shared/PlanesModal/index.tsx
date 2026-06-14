"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';
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

interface PlanesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect?: (plan: string) => void;
}

const PlanesModal: React.FC<PlanesModalProps> = ({ isOpen, onClose, onPlanSelect }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const planes = [
    {
      id: 'premium',
      name: 'PREMIUM',
      price: '$4.99',
      period: '/7 días',
      duration: '7 días',
      color: 'bg-blue-500',
      icon: 'mdi:crown',
      features: [
        'Análisis ilimitados por 7 días',
        'Descargas PDF ilimitadas',
        'Acceso completo a todas las funciones'
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      price: '$14.99',
      period: '/mes',
      duration: '30 días',
      color: 'bg-purple-500',
      icon: 'mdi:diamond-stone',
      popular: true,
      features: [
        'Todo lo de PREMIUM',
        'Análisis ilimitados por 30 días',
        'Funciones avanzadas de IA',
        'Historial completo de análisis'
      ]
    },
    {
      id: 'vip_advanced',
      name: 'VIP ADVANCED',
      price: '$149.99',
      period: '/año',
      duration: '1 año',
      color: 'bg-yellow-500',
      icon: 'mdi:crown-outline',
      features: [
        'Todo lo de VIP',
        'Análisis ilimitados por 1 año',
        'Máximo ahorro anual',
        'Todas las funciones premium'
      ]
    }
  ];

  const handleSelectPlan = async (planId: string) => {
    if (!user) return;
    
    setLoading(planId);
    
    try {
      const baseUrl = getBackendUrl();
      const response = await fetch(`${baseUrl}/api/crear-suscripcion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          plan_tipo: planId
        })
      });

      if (response.ok) {
        alert('¡Suscripción activada exitosamente!');
        onPlanSelect && onPlanSelect(planId);
        onClose();
        // Recargar la página para actualizar el estado
        window.location.reload();
      } else {
        alert('Error al procesar la suscripción');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-dark dark:text-white">
                ¡Desbloquea todo el potencial de DenDiTec!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Elige el plan perfecto para tus necesidades de análisis dental
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {planes.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                  plan.popular 
                    ? 'border-purple-500 shadow-lg scale-105' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Más Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${plan.color} rounded-full mb-4`}>
                    <Icon icon={plan.icon} className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-dark dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-3xl font-bold text-dark dark:text-white">
                    {plan.price}
                    <span className="text-lg text-gray-500 dark:text-gray-400 font-normal">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Válido por {plan.duration}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Icon 
                          icon="mdi:check-circle" 
                          className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" 
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    plan.popular
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-dark dark:text-white'
                  } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center justify-center">
                      <Icon icon="mdi:loading" className="w-5 h-5 animate-spin mr-2" />
                      Procesando...
                    </div>
                  ) : (
                    'Seleccionar Plan'
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
              <Icon icon="mdi:shield-check" className="w-5 h-5 mr-2" />
              <span>
                Activación inmediata • Cancela cuando quieras • Soporte 24/7
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanesModal;
