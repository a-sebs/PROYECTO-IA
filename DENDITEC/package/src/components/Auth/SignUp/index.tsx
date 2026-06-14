"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

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

const SignUp = ({ signUpOpen }: { signUpOpen?: any }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) {
      newErrors.nombre = "El nombre solo puede contener letras";
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellido)) {
      newErrors.apellido = "El apellido solo puede contener letras";
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debe confirmar la contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
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

    // Obtener la URL base del backend
    const baseUrl = getBackendUrl();

    try {
      const response = await fetch(`${baseUrl}/api/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("¡Registro exitoso! Redirigiendo al login...");
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        setMessage(data.detail || "Error en el registro");
      }
    } catch (error) {
      console.error('Error en registro:', error);
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
            src="/images/header/logo.svg"
            alt="DenDiTec"
            width={60}
            height={60}
            className="mx-auto"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Crear cuenta
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Completa los datos para registrarte
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre y Apellido en la misma fila */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full rounded-md border border-black/10 dark:border-white/20 border-solid bg-transparent px-4 py-3 text-base text-dark outline-none transition placeholder:text-gray-400 focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary ${
                errors.nombre ? 'border-red-500' : ''
              }`}
              placeholder="Tu nombre"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Apellido
            </label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              required
              value={formData.apellido}
              onChange={handleChange}
              className={`w-full rounded-md border border-black/10 dark:border-white/20 border-solid bg-transparent px-4 py-3 text-base text-dark outline-none transition placeholder:text-gray-400 focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary ${
                errors.apellido ? 'border-red-500' : ''
              }`}
              placeholder="Tu apellido"
            />
            {errors.apellido && (
              <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>
            )}
          </div>
        </div>

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
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            className={`w-full rounded-md border border-black/10 dark:border-white/20 border-solid bg-transparent px-4 py-3 text-base text-dark outline-none transition placeholder:text-gray-400 focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary ${
              errors.password ? 'border-red-500' : ''
            }`}
            placeholder="Mínimo 6 caracteres"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full rounded-md border border-black/10 dark:border-white/20 border-solid bg-transparent px-4 py-3 text-base text-dark outline-none transition placeholder:text-gray-400 focus:border-primary focus-visible:shadow-none dark:text-white dark:focus:border-primary ${
              errors.confirmPassword ? 'border-red-500' : ''
            }`}
            placeholder="Confirma tu contraseña"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
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

        {/* Botón de registro */}
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
              Registrando...
            </>
          ) : (
            'Crear cuenta'
          )}
        </button>

        {/* Enlaces */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/signin"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
