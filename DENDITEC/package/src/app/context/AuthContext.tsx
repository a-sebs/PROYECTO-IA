"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  creditos: number;
  plan_activo?: string | null;
  descargas_restantes?: number;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateCredits: (newCredits: number) => void;
  updateUserPlan: (newPlan?: string | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname.includes('devtunnels.ms')) {
      return 'https://nc26qlpz-8001.use2.devtunnels.ms';
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    } else {
      return 'https://deteccion-oral-api.onrender.com';
    }
  } else {
    return 'https://deteccion-oral-api.onrender.com';
  }
};

// Función utilitaria para hacer fetch con timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout: number = 10000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Actualizar información del plan de forma asíncrona sin bloquear
        if (userData.id) {
          updateUserPlanById(userData.id).catch(error => {
            console.warn('Could not update user plan during initialization:', error);
            // No hacer nada más, el usuario seguirá funcionando con los datos de localStorage
          });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Actualizar información del plan después del login de forma asíncrona
    if (userData.id) {
      updateUserPlanById(userData.id).catch(error => {
        console.warn('Could not update user plan after login:', error);
        // No propagar el error, el login ya fue exitoso
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/'); // Redirigir a la página inicial
  };

  const updateCredits = (newCredits: number) => {
    if (user) {
      const updatedUser = { ...user, creditos: newCredits };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateUserPlan = async (newPlan?: string | null) => {
    if (user) {
      if (newPlan !== undefined) {
        // Si se proporciona un plan específico, actualizarlo directamente
        const updatedUser = {
          ...user,
          plan_activo: newPlan
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        // Si no se proporciona plan, obtener del servidor
        try {
          const baseUrl = getBackendUrl();
          const response = await fetchWithTimeout(`${baseUrl}/api/info-descargas/${user.id}`, {}, 30000);
          if (response.ok) {
            const info = await response.json();
            const updatedUser = {
              ...user,
              plan_activo: info.plan_activo,
              descargas_restantes: info.descargas_restantes
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error('Error updating user plan:', error);
          // No propagar el error para evitar interrumpir el flujo de la aplicación
        }
      }
    }
  };

  const updateUserPlanById = async (userId: number) => {
    try {
      const baseUrl = getBackendUrl();
      const response = await fetchWithTimeout(`${baseUrl}/auth/plan-activo/${userId}`, {}, 30000);
      if (response.ok) {
        const planData = await response.json();
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          plan_activo: planData.plan_activo
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating user plan by id:', error);
      // No propagar el error para evitar interrumpir el flujo de la aplicación
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateCredits, updateUserPlan, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
