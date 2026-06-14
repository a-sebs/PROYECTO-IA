"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { Icon } from "@iconify/react";

const SignIn = ({ signInOpen }: { signInOpen?: any }) => {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    // Determinar la URL base según el entorno
    let baseUrl;
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      if (hostname.includes('devtunnels.ms')) {
        baseUrl = 'https://nc26qlpz-8001.use2.devtunnels.ms';
      } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        baseUrl = 'http://localhost:8000';
      } else {
        baseUrl = `http://${hostname}:8001`;
      }
    } else {
      baseUrl = 'http://localhost:8000';
    }

    try {
      const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Guardar información del usuario usando el context
        login(data.user);
        setMessage("¡Inicio de sesión exitoso! Redirigiendo...");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setMessage(data.detail || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error('Error en login:', error);
      setMessage("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/header/logo.png"
            alt="DenDiTec"
            width={60}
            height={60}
            className="mx-auto"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Iniciar sesión
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ingresa tus credenciales para acceder
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-md border border-black/10 dark:border-white/20 border-solid bg-transparent px-4 py-3 text-base text-dark outline-none transition placeholder:text-gray-400 focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary ${
              errors.email ? 'border-red-500' : ''
            }`}
            placeholder="tu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            className={`w-full rounded-md border border-black/10 dark:border-white/20 border-solid bg-transparent px-4 py-3 text-base text-dark outline-none transition placeholder:text-gray-400 focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary ${
              errors.password ? 'border-red-500' : ''
            }`}
            placeholder="Tu contraseña"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`text-sm text-center p-3 rounded-md ${
            message.includes('exitoso') 
              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700' 
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Botón de login */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-base font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isLoading ? (
            <>
              <Icon icon="ph:spinner" width={20} height={20} className="animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>

        {/* Enlaces */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                ¿Problemas para acceder?
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Contacta al administrador si no puedes acceder a tu cuenta
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
