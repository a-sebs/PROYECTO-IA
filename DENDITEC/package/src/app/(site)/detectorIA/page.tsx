"use client";
import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import PlanesModal from '@/components/shared/PlanesModal';

// Función utilitaria para obtener la URL base del backend
const getBackendUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname.includes('devtunnels.ms')) {
      return 'https://nc26qlpz-8001.use2.devtunnels.ms';
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8001';
    } else {
      return `http://${hostname}:8001`;
    }
  } else {
    return 'http://localhost:8001';
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

export default function DetectorIA() {
  const { user, updateCredits } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any>(null);
  
  // Estados para planes y descargas
  const [showPlanesModal, setShowPlanesModal] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Verificar si el usuario tiene plan premium
  const hasPremiumPlan = user?.plan_activo && user.plan_activo !== null;

  // Verificar información de descargas al cargar
  useEffect(() => {
    if (user) {
      fetchDownloadInfo();
    }
  }, [user]);

  const fetchDownloadInfo = async () => {
    if (!user) return;
    
    try {
      const baseUrl = getBackendUrl();
      const response = await fetchWithTimeout(`${baseUrl}/api/info-descargas/${user.id}`, {}, 8000);
      if (response.ok) {
        const info = await response.json();
        setDownloadInfo(info);
      }
    } catch (error) {
      console.error('Error fetching download info:', error);
    }
  };

  // Verificar si se quedó sin créditos después del análisis
  const checkCreditsAndShowModal = () => {
    if (user && user.creditos <= 0) {
      setShowPlanesModal(true);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        // Limpiar resultados anteriores
        setResultImage(null);
        setError(null);
        setAnalysisComplete(false);
        setDetectionResults(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedImage || !resultImage || !detectionResults || !user) {
      setError('No hay resultados completos para descargar');
      return;
    }

    // Verificar si puede descargar (usuarios premium siempre pueden)
    if (!hasPremiumPlan && !downloadInfo?.puede_descargar) {
      setShowPlanesModal(true);
      return;
    }

    setIsDownloading(true);

    try {
      // Usar una descarga si no tiene plan activo (solo para usuarios gratuitos)
      if (!hasPremiumPlan && !downloadInfo?.plan_activo) {
        const baseUrl = getBackendUrl();
        const response = await fetchWithTimeout(`${baseUrl}/api/usar-descarga/${user.id}`, {
          method: 'POST'
        }, 8000);
        
        if (!response.ok) {
          throw new Error('Sin descargas disponibles');
        }
        
        // Actualizar info de descargas
        await fetchDownloadInfo();
      }

      // Generar PDF usando jsPDF
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF();

      // Configuración
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      // Título principal más compacto
      pdf.setFontSize(18);
      pdf.setTextColor(40, 44, 52);
      pdf.text('DenDiTec - Reporte de Análisis Dental', margin, margin + 8);

      // Información del usuario y fecha más compacta
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const fecha = new Date().toLocaleDateString('es-ES');
      pdf.text(`Paciente: ${user.nombre} ${user.apellido}`, margin, margin + 20);
      pdf.text(`Fecha: ${fecha}`, margin, margin + 28);

      // Línea divisoria
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, margin + 35, pageWidth - margin, margin + 35);

      let yPosition = margin + 45;

      // Imagen original
      pdf.setFontSize(12);
      pdf.setTextColor(40, 44, 52);
      pdf.text('Imagen Original:', margin, yPosition);
      yPosition += 8;

      try {
        const imgWidth = contentWidth * 0.4;
        const imgHeight = imgWidth * 0.6;
        pdf.addImage(selectedImage, 'JPEG', margin, yPosition, imgWidth, imgHeight);
        
        // Imagen con detecciones al lado
        pdf.text('Imagen con Detecciones:', margin + imgWidth + 15, yPosition - 8);
        pdf.addImage(resultImage, 'JPEG', margin + imgWidth + 15, yPosition, imgWidth, imgHeight);
        
        yPosition += imgHeight + 15;
      } catch (imgError) {
        console.error('Error agregando imágenes:', imgError);
        yPosition += 10;
      }

      // Resultados del análisis
      pdf.setFontSize(14);
      pdf.setTextColor(40, 44, 52);
      pdf.text('Resultados del Análisis:', margin, yPosition);
      yPosition += 12;

      const enfermedades = [
        { key: 'caries', nombre: 'Caries Dental', color: [220, 53, 69] },
        { key: 'gingivitis', nombre: 'Gingivitis', color: [255, 193, 7] },
        { key: 'sarro', nombre: 'Sarro Dental', color: [108, 117, 125] },
        { key: 'ulceras', nombre: 'Úlceras Orales', color: [220, 53, 69] },
        { key: 'hipodoncia', nombre: 'Hipodoncia', color: [13, 202, 240] },
        { key: 'decoloracion', nombre: 'Decoloración Dental', color: [102, 16, 242] }
      ];

      pdf.setFontSize(10);
      enfermedades.forEach((enfermedad) => {
        const porcentaje = detectionResults[enfermedad.key] || 0;
        const nivel = porcentaje > 70 ? 'Alto' : porcentaje > 30 ? 'Moderado' : 'Bajo';
        
        pdf.setTextColor(enfermedad.color[0], enfermedad.color[1], enfermedad.color[2]);
        pdf.text(`• ${enfermedad.nombre}: ${porcentaje.toFixed(1)}% (${nivel})`, margin + 5, yPosition);
        yPosition += 6;
      });

      // Recomendaciones
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.setTextColor(40, 44, 52);
      pdf.text('Recomendaciones:', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const recomendaciones = [
        '• Consulte con un dentista profesional para una evaluación completa',
        '• Este análisis es una herramienta de apoyo, no un diagnóstico médico',
        '• Mantenga una buena higiene bucal diaria',
        '• Realice revisiones dentales regulares'
      ];

      recomendaciones.forEach((rec) => {
        pdf.text(rec, margin + 5, yPosition);
        yPosition += 5;
      });

      // Recordatorio importante
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(220, 53, 69); // Color rojo para destacar
      pdf.text('**Recordatorio Importante**', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const recordatorio = [
        'Este análisis utiliza inteligencia artificial como herramienta de apoyo diagnóstico.',
        'Los porcentajes indican la confianza del modelo, no la certeza médica.',
        'Solo un profesional puede realizar un diagnóstico definitivo.'
      ];

      recordatorio.forEach((texto) => {
        pdf.text(texto, margin + 5, yPosition);
        yPosition += 5;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Generado por DenDiTec - Tecnología de análisis dental con IA', margin, pageHeight - 15);

      // Descargar PDF
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      pdf.save(`denditec-reporte-${timestamp}.pdf`);

    } catch (error) {
      console.error('Error generando PDF:', error);
      setError('Error al generar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Por favor selecciona una imagen');
      return;
    }

    // Verificar si el usuario está logueado
    if (!user) {
      setError('Debes iniciar sesión para usar el detector');
      return;
    }

    // Verificar si tiene créditos suficientes (solo si no tiene plan premium)
    if (!hasPremiumPlan && user.creditos < 150) {
      setError('No tienes créditos suficientes. Necesitas 150 créditos para usar el detector.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResultImage(null);

    // Obtener la URL base del backend
    const baseUrl = getBackendUrl();

    try {
      console.log('Enviando solicitud a:', `${baseUrl}/api/detectar-con-datos`);
      // Enviar imagen a la API de DeteccionOralAPI (nueva ruta con datos)
      const response = await fetchWithTimeout(`${baseUrl}/api/detectar-con-datos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imagen_base64: selectedImage,
          confianza_minima: 0.2
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Obtener imagen con detecciones
        setResultImage(data.imagen_resultado);
        setAnalysisComplete(true);
        
        // Analizar detecciones reales y calcular máximos por enfermedad
        const maxPorcentajes = {
          caries: 0,
          gingivitis: 0,
          sarro: 0,
          ulceras: 0,
          hipodoncia: 0,
          decoloracion: 0
        };

        // Mapeo de nombres de clases del modelo a nuestras categorías
        const mapeoClases: { [key: string]: keyof typeof maxPorcentajes } = {
          'caries': 'caries',
          'gingivitis': 'gingivitis', 
          'calculus': 'sarro',
          'ulcer': 'ulceras',
          'hypodontia': 'hipodoncia',
          'tooth_discolation': 'decoloracion'
        };

        // Procesar cada detección y encontrar el máximo porcentaje por enfermedad
        data.detecciones.forEach((deteccion: any) => {
          const claseDetectada = mapeoClases[deteccion.clase];
          if (claseDetectada) {
            const porcentaje = deteccion.confianza * 100;
            if (porcentaje > maxPorcentajes[claseDetectada]) {
              maxPorcentajes[claseDetectada] = porcentaje;
            }
          }
        });

        console.log('Detecciones procesadas:', data.detecciones);
        console.log('Máximos calculados:', maxPorcentajes);
        
        setDetectionResults(maxPorcentajes);

        // Usar créditos después del análisis exitoso (solo si no tiene plan premium)
        if (!hasPremiumPlan) {
          try {
            const creditResponse = await fetch(`${baseUrl}/api/usar-creditos`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_id: user.id
              })
            });

            if (creditResponse.ok) {
              const creditData = await creditResponse.json();
              updateCredits(creditData.creditos_restantes);
              console.log(`Créditos actualizados: ${creditData.creditos_restantes}`);
              
              // Verificar si se quedó sin créditos y mostrar modal de planes
              if (creditData.creditos_restantes <= 0) {
                setTimeout(() => checkCreditsAndShowModal(), 1000);
              }
            }
          } catch (creditError) {
            console.error('Error actualizando créditos:', creditError);
            // No interrumpir el flujo principal por errores de créditos
          }
        }
      } else {
        throw new Error(`Error de la API: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error completo:', error);
      console.error('URL utilizada:', baseUrl);
      
      let errorMessage = 'Error al conectar con el servidor de análisis';
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = `Error de conexión. Verificando URL: ${baseUrl}/api/detectar-con-datos`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };
  return (
    <>
      <div className='container max-w-8xl mx-auto px-5 2xl:px-0 pt-16 md:pt-20 pb-14 md:pb-28'>
      <div className='mb-16'>
        <div className='flex gap-2.5 items-center justify-center mb-3'>
          <span>
            <Icon
              icon={'ph:robot'}
              width={20}
              height={20}
              className='text-primary'
            />
          </span>
          <p className='text-base font-semibold text-badge dark:text-white/90'>
            Detector de IA
          </p>
        </div>
        <div className='text-center'>
          <h3 className='text-4xl sm:text-52 font-medium tracking-tighter text-black dark:text-white mb-3 leading-10 sm:leading-14'>
            Sube tu imagen para análisis
          </h3>
          <p className='text-xm font-normal tracking-tight text-black/50 dark:text-white/50 leading-6'>
            Carga una fotografía intraoral para que nuestro detector de IA 
            analice posibles enfermedades orales con alta precisión.
          </p>
        </div>
      </div>
      {/* Detector de IA */}
      <div className='border border-black/10 dark:border-white/10 rounded-2xl p-8 shadow-xl dark:shadow-white/10 mb-8'>
        <div className='grid lg:grid-cols-2 gap-12'>
          {/* Sección de carga de imagen */}
          <div className='flex flex-col gap-6'>
            <h4 className='text-2xl font-semibold text-black dark:text-white'>
              Cargar imagen para análisis
            </h4>
            <div className='border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center hover:border-primary/60 transition-colors'>
              <div className='flex flex-col items-center gap-4'>
                <Icon icon="ph:cloud-arrow-up" width={48} height={48} className="text-primary" />
                <div>
                  <p className='text-lg font-medium text-black dark:text-white mb-2'>
                    Arrastra tu imagen aquí
                  </p>
                  <p className='text-sm text-black/50 dark:text-white/50 mb-4'>
                    O haz clic para seleccionar una imagen
                  </p>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block px-6 py-3 bg-primary text-white rounded-full cursor-pointer hover:bg-dark transition-colors"
                  >
                    Seleccionar imagen
                  </label>
                </div>
                <p className='text-xs text-black/40 dark:text-white/40'>
                  Formatos soportados: JPG, PNG, WebP (máx. 10MB)
                </p>
              </div>
            </div>
            
            {/* Información sobre el análisis */}
            <div className='bg-primary/5 dark:bg-primary/10 rounded-xl p-6'>
              <h5 className='text-lg font-medium text-black dark:text-white mb-3'>
                ¿Qué puede detectar nuestro IA?
              </h5>
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex items-center gap-2'>
                  <Icon icon="ph:check-circle" width={16} height={16} className="text-primary" />
                  <span className='text-sm text-black dark:text-white'>Caries</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Icon icon="ph:check-circle" width={16} height={16} className="text-primary" />
                  <span className='text-sm text-black dark:text-white'>Gingivitis</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Icon icon="ph:check-circle" width={16} height={16} className="text-primary" />
                  <span className='text-sm text-black dark:text-white'>Sarro</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Icon icon="ph:check-circle" width={16} height={16} className="text-primary" />
                  <span className='text-sm text-black dark:text-white'>Decoloración</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Icon icon="ph:check-circle" width={16} height={16} className="text-primary" />
                  <span className='text-sm text-black dark:text-white'>Úlceras</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Icon icon="ph:check-circle" width={16} height={16} className="text-primary" />
                  <span className='text-sm text-black dark:text-white'>Hipodoncia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de vista previa */}
          <div className='flex flex-col gap-6'>
            <h4 className='text-2xl font-semibold text-black dark:text-white'>
              Vista previa de la imagen
            </h4>
            
            {/* Área de vista previa de la imagen */}
            <div className='border border-black/10 dark:border-white/10 rounded-2xl p-6 min-h-[300px] flex items-center justify-center'>
              {selectedImage ? (
                <div className='w-full h-full flex flex-col items-center'>
                  <Image
                    src={selectedImage}
                    alt="Imagen cargada para análisis"
                    width={400}
                    height={300}
                    className="rounded-xl max-h-[250px] object-contain"
                    unoptimized={true}
                  />
                  <div className='flex gap-2 mt-4'>
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setResultImage(null);
                        setError(null);
                        setAnalysisComplete(false);
                        setDetectionResults(null);
                      }}
                      className='text-sm text-red-500 hover:text-red-700 flex items-center gap-1'
                    >
                      <Icon icon="ph:trash" width={16} height={16} />
                      Eliminar imagen
                    </button>
                    {resultImage && (
                      <button
                        onClick={() => {
                          setResultImage(null);
                          setError(null);
                          setAnalysisComplete(false);
                        }}
                        className='text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1'
                      >
                        <Icon icon="ph:arrow-counter-clockwise" width={16} height={16} />
                        Nuevo análisis
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className='text-center text-black/50 dark:text-white/50'>
                  <Icon icon="ph:image" width={64} height={64} className="mx-auto mb-4 opacity-50" />
                  <p className='text-lg'>No hay imagen cargada</p>
                  <p className='text-sm'>La imagen aparecerá aquí una vez que la cargues</p>
                </div>
              )}
            </div>

            {/* Botón de análisis */}
            {!user ? (
              <div className="w-full text-center">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 mb-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Debes iniciar sesión para usar el detector de IA
                  </p>
                </div>
                <Link 
                  href="/signin"
                  className="inline-block w-full py-4 px-6 bg-primary text-white rounded-full font-semibold hover:bg-dark transition-colors"
                >
                  Iniciar Sesión
                </Link>
              </div>
            ) : (
              <>
                {!hasPremiumPlan && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Créditos disponibles: {user.creditos}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Costo del análisis: 150 créditos
                        </p>
                      </div>
                      <Icon 
                        icon="ph:coins" 
                        width={24} 
                        height={24} 
                        className="text-blue-500" 
                      />
                    </div>
                  </div>
                )}
                
                {hasPremiumPlan && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          ✨ Plan Premium Activo
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Análisis ilimitados incluidos
                        </p>
                      </div>
                      <Icon 
                        icon="ph:crown" 
                        width={24} 
                        height={24} 
                        className="text-green-500" 
                      />
                    </div>
                  </div>
                )}
                
                <button 
                  className={`w-full py-4 px-6 rounded-full font-semibold transition-colors ${
                    !selectedImage || isAnalyzing || (!hasPremiumPlan && user.creditos < 150)
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-dark'
                  }`}
                  disabled={!selectedImage || isAnalyzing || (!hasPremiumPlan && user.creditos < 150)}
                  onClick={handleAnalyze}
                >
                  <div className='flex items-center justify-center gap-2'>
                    {isAnalyzing ? (
                      <>
                        <Icon icon="ph:spinner" width={20} height={20} className="animate-spin" />
                        <span>Analizando...</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="ph:brain" width={20} height={20} />
                        <div className="flex flex-col">
                          <span>Analizar con IA</span>
                          {!hasPremiumPlan && (
                            <span className="text-xs opacity-75">Usar 150 créditos</span>
                          )}
                          {hasPremiumPlan && (
                            <span className="text-xs opacity-75">Incluido en tu plan</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </button>
              </>
            )}

            {/* Mostrar errores */}
            {error && (
              <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4'>
                <div className='flex items-start gap-3'>
                  <Icon icon="ph:warning-circle" width={20} height={20} className="text-red-500 mt-0.5" />
                  <div>
                    <p className='text-sm font-medium text-red-700 dark:text-red-400'>Error en el análisis</p>
                    <p className='text-sm text-red-600 dark:text-red-300 mt-1'>{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Resultados */}
      {(resultImage || analysisComplete) && (
        <div className='border border-black/10 dark:border-white/10 rounded-2xl p-8 shadow-xl dark:shadow-white/10'>
          <div className='flex items-center justify-between gap-3 mb-6'>
            <div className='flex items-center gap-3'>
              <Icon icon="ph:chart-line" width={24} height={24} className="text-primary" />
              <h4 className='text-2xl font-semibold text-black dark:text-white'>
                Resultados del Análisis
              </h4>
            </div>
          </div>
          
          {resultImage && (
            <div className='grid lg:grid-cols-2 gap-8'>
              {/* Imagen Original */}
              <div>
                <h5 className='text-lg font-medium text-black dark:text-white mb-4 flex items-center gap-2'>
                  <Icon icon="ph:image" width={18} height={18} className="text-gray-500" />
                  Imagen Original
                </h5>
                <div className='border border-black/10 dark:border-white/10 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50'>
                  <Image
                    src={selectedImage!}
                    alt="Imagen original"
                    width={400}
                    height={300}
                    className="rounded-lg max-h-[300px] w-full object-contain"
                    unoptimized={true}
                  />
                </div>
              </div>

              {/* Imagen con Detecciones */}
              <div>
                <h5 className='text-lg font-medium text-black dark:text-white mb-4 flex items-center gap-2'>
                  <Icon icon="ph:brain" width={18} height={18} className="text-primary" />
                  Detecciones de IA
                </h5>
                <div className='border border-black/10 dark:border-white/10 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50'>
                  <Image
                    src={resultImage}
                    alt="Imagen con detecciones de IA"
                    width={400}
                    height={300}
                    className="rounded-lg max-h-[300px] w-full object-contain"
                    unoptimized={true}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Botón de descarga prominente */}
          {resultImage && (
            <div className='flex justify-center mt-6'>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading || (!hasPremiumPlan && !downloadInfo?.puede_descargar)}
                className={`flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                  (hasPremiumPlan || downloadInfo?.puede_descargar) && !isDownloading
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white hover:from-dark hover:to-primary' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100'
                }`}
              >
                <Icon icon={isDownloading ? "ph:spinner" : "ph:file-pdf"} 
                      width={24} height={24} 
                      className={isDownloading ? "animate-spin" : ""} />
                {isDownloading ? 'Generando PDF...' : 'Descargar PDF con Resultados'}
                {hasPremiumPlan && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    ✨ Premium
                  </span>
                )}
              </button>
              
              {!hasPremiumPlan && !downloadInfo?.puede_descargar && (
                <div className="ml-4 text-center">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                    {downloadInfo?.plan_activo ? 'Error de permisos' : 'Sin descargas gratuitas disponibles'}
                  </p>
                  <button
                    onClick={() => setShowPlanesModal(true)}
                    className="text-sm text-primary hover:text-dark font-medium"
                  >
                    Ver planes premium
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Información sobre las detecciones */}
          <div className='mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6'>
            <div className='flex items-start gap-3'>
              <Icon icon="ph:check-circle" width={20} height={20} className="text-green-500 mt-0.5" />
              <div className='flex-1'>
                <p className='text-sm font-medium text-green-700 dark:text-green-400 mb-2'>Análisis completado exitosamente</p>
                <p className='text-sm text-green-600 dark:text-green-300 mb-4'>
                  El sistema de IA ha analizado la imagen dental y ha marcado las patologías encontradas con sus porcentajes de confianza. 
                  Las etiquetas muestran el nombre de la condición y el porcentaje de certeza de la detección:
                </p>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 bg-red-500 rounded'></div>
                    <span className='text-sm text-green-700 dark:text-green-300'>Caries (% confianza)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 bg-blue-500 rounded'></div>
                    <span className='text-sm text-green-700 dark:text-green-300'>Gingivitis (% confianza)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 bg-orange-500 rounded'></div>
                    <span className='text-sm text-green-700 dark:text-green-300'>Sarro/Cálculo (% confianza)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 bg-purple-500 rounded'></div>
                    <span className='text-sm text-green-700 dark:text-green-300'>Úlceras (% confianza)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 bg-yellow-500 rounded'></div>
                    <span className='text-sm text-green-700 dark:text-green-300'>Hipodoncia (% confianza)</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 bg-purple-700 rounded'></div>
                    <span className='text-sm text-green-700 dark:text-green-300'>Decoloración (% confianza)</span>
                  </div>
                </div>
                <div className='mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg'>
                  <p className='text-xs text-blue-700 dark:text-blue-300'>
                    <strong>Sobre los porcentajes:</strong> Cada etiqueta muestra el porcentaje de confianza del modelo de IA para esa detección específica. 
                    En la sección de resultados se muestra el porcentaje más alto detectado para cada tipo de enfermedad.
                  </p>
                </div>
                <div className='mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg'>
                  <p className='text-xs text-yellow-700 dark:text-yellow-300'>
                    <strong>Nota importante:</strong> Este análisis es una herramienta de apoyo y no reemplaza el diagnóstico profesional. 
                    Siempre consulte con un odontólogo para obtener un diagnóstico definitivo y tratamiento adecuado.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sección de Porcentajes y Recomendaciones */}
          {detectionResults && (
            <div className='mt-8'>
              <div className='flex items-center gap-3 mb-6'>
                <Icon icon="ph:percent" width={24} height={24} className="text-primary" />
                <h5 className='text-xl font-semibold text-black dark:text-white'>
                  Análisis de Detecciones
                </h5>
              </div>
              
              <div className='grid md:grid-cols-2 gap-6'>
                {/* Gráfico de probabilidades */}
                <div className='space-y-4'>
                  <div className='bg-white dark:bg-gray-800 rounded-xl p-6 border border-black/10 dark:border-white/10'>
                    <h6 className='text-lg font-medium text-black dark:text-white mb-4 flex items-center gap-2'>
                      <Icon icon="ph:chart-bar" width={18} height={18} className="text-primary" />
                      Porcentajes Más Altos Detectados
                    </h6>
                    
                    <div className='text-xs text-gray-600 dark:text-gray-400 mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded'>
                      💡 Estos son los porcentajes de confianza más altos encontrados para cada tipo de enfermedad en toda la imagen
                    </div>
                    
                    {[
                      { name: 'Caries Dental', value: detectionResults.caries, color: 'bg-red-500', risk: detectionResults.caries > 70 ? 'Alto' : detectionResults.caries > 40 ? 'Medio' : 'Bajo' },
                      { name: 'Gingivitis', value: detectionResults.gingivitis, color: 'bg-blue-500', risk: detectionResults.gingivitis > 70 ? 'Alto' : detectionResults.gingivitis > 40 ? 'Medio' : 'Bajo' },
                      { name: 'Sarro/Cálculo', value: detectionResults.sarro, color: 'bg-orange-500', risk: detectionResults.sarro > 70 ? 'Alto' : detectionResults.sarro > 40 ? 'Medio' : 'Bajo' },
                      { name: 'Úlceras Orales', value: detectionResults.ulceras, color: 'bg-purple-500', risk: detectionResults.ulceras > 70 ? 'Alto' : detectionResults.ulceras > 40 ? 'Medio' : 'Bajo' },
                      { name: 'Hipodoncia', value: detectionResults.hipodoncia, color: 'bg-yellow-500', risk: detectionResults.hipodoncia > 70 ? 'Alto' : detectionResults.hipodoncia > 40 ? 'Medio' : 'Bajo' },
                      { name: 'Decoloración', value: detectionResults.decoloracion, color: 'bg-purple-700', risk: detectionResults.decoloracion > 70 ? 'Alto' : detectionResults.decoloracion > 40 ? 'Medio' : 'Bajo' }
                    ].map((item, index) => (
                      <div key={index} className='space-y-2'>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm font-medium text-black dark:text-white'>{item.name}</span>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm text-black dark:text-white'>{item.value.toFixed(1)}%</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              item.risk === 'Alto' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                              item.risk === 'Medio' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {item.risk}
                            </span>
                          </div>
                        </div>
                        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${Math.min(item.value, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Recomendaciones médicas */}
                <div className='space-y-4'>
                  <div className='bg-white dark:bg-gray-800 rounded-xl p-6 border border-black/10 dark:border-white/10'>
                    <h6 className='text-lg font-medium text-black dark:text-white mb-4 flex items-center gap-2'>
                      <Icon icon="ph:heart" width={20} height={20} className="text-red-500" />
                      Recomendaciones Médicas
                    </h6>
                    
                    {/* Recomendaciones basadas en los resultados */}
                    <div className='space-y-4'>
                      {/* Alerta de alto riesgo */}
                      {Math.max(detectionResults.caries, detectionResults.gingivitis, detectionResults.sarro, detectionResults.ulceras, detectionResults.hipodoncia, detectionResults.decoloracion) > 70 && (
                        <div className='p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg'>
                          <div className='flex items-start gap-3'>
                            <Icon icon="ph:warning" width={20} height={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className='text-sm font-medium text-red-700 dark:text-red-300 mb-1'>⚠️ Atención Urgente Recomendada</p>
                              <p className='text-sm text-red-600 dark:text-red-400'>
                                El análisis muestra confianzas superiores al 70% en algunas detecciones. <strong>Te recomendamos acudir a un odontólogo lo antes posible</strong> para una evaluación profesional inmediata.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Alerta de riesgo medio */}
                      {Math.max(detectionResults.caries, detectionResults.gingivitis, detectionResults.sarro, detectionResults.ulceras, detectionResults.hipodoncia, detectionResults.decoloracion) > 40 && 
                       Math.max(detectionResults.caries, detectionResults.gingivitis, detectionResults.sarro, detectionResults.ulceras, detectionResults.hipodoncia, detectionResults.decoloracion) <= 70 && (
                        <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg'>
                          <div className='flex items-start gap-3'>
                            <Icon icon="ph:clock" width={20} height={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className='text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1'>⏰ Monitoreo Recomendado</p>
                              <p className='text-sm text-yellow-600 dark:text-yellow-400'>
                                Se detectaron señales con confianzas del 40-70%. <strong>Programa una cita con tu odontólogo en las próximas semanas</strong> para prevenir complicaciones.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Detecciones específicas */}
                      {Object.entries(detectionResults).some(([key, value]) => (value as number) > 0) && (
                        <div className='p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg'>
                          <div className='flex items-start gap-3'>
                            <Icon icon="ph:info" width={20} height={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className='text-sm font-medium text-blue-700 dark:text-blue-300 mb-2'>📊 Detecciones Específicas Encontradas:</p>
                              <div className='text-sm text-blue-600 dark:text-blue-400 space-y-1'>
                                {detectionResults.caries > 0 && (
                                  <p>• <strong>Caries:</strong> Confianza máxima del {detectionResults.caries.toFixed(1)}%</p>
                                )}
                                {detectionResults.gingivitis > 0 && (
                                  <p>• <strong>Gingivitis:</strong> Confianza máxima del {detectionResults.gingivitis.toFixed(1)}%</p>
                                )}
                                {detectionResults.sarro > 0 && (
                                  <p>• <strong>Sarro/Cálculo:</strong> Confianza máxima del {detectionResults.sarro.toFixed(1)}%</p>
                                )}
                                {detectionResults.ulceras > 0 && (
                                  <p>• <strong>Úlceras:</strong> Confianza máxima del {detectionResults.ulceras.toFixed(1)}%</p>
                                )}
                                {detectionResults.hipodoncia > 0 && (
                                  <p>• <strong>Hipodoncia:</strong> Confianza máxima del {detectionResults.hipodoncia.toFixed(1)}%</p>
                                )}
                                {detectionResults.decoloracion > 0 && (
                                  <p>• <strong>Decoloración:</strong> Confianza máxima del {detectionResults.decoloracion.toFixed(1)}%</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className='p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg'>
                        <div className='flex items-start gap-3'>
                          <Icon icon="ph:calendar" width={20} height={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className='text-sm font-medium text-blue-700 dark:text-blue-300 mb-1'>📅 Prevención General</p>
                            <p className='text-sm text-blue-600 dark:text-blue-400'>
                              <strong>Independientemente de estos resultados, es recomendable visitar al odontólogo cada 6 meses</strong> para mantener una óptima salud oral y prevenir enfermedades.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className='p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-lg'>
                        <div className='flex items-start gap-3'>
                          <Icon icon="ph:shield-check" width={20} height={20} className="text-gray-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>🛡️ Recordatorio Importante</p>
                            <p className='text-sm text-gray-600 dark:text-gray-400'>
                              Este análisis utiliza inteligencia artificial como herramienta de apoyo diagnóstico. <strong>Los porcentajes indican la confianza del modelo, no la certeza médica.</strong> Solo un profesional puede realizar un diagnóstico definitivo.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sección Ver nuestros planes */}
      <div className='mt-16'>
        <div className='bg-gradient-to-r from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 border border-primary/20 dark:border-primary/30 rounded-2xl p-8'>
          <div className='text-center'>
            <div className='flex gap-2.5 items-center justify-center mb-4'>
              <span>
                <Icon
                  icon={'ph:crown'}
                  width={24}
                  height={24}
                  className='text-primary'
                />
              </span>
              <p className='text-lg font-semibold text-primary'>
                Planes Premium
              </p>
            </div>
            
            <h4 className='text-3xl font-bold text-black dark:text-white mb-4'>
              ¿Necesitas más análisis de IA?
            </h4>
            
            <p className='text-lg text-black/70 dark:text-white/70 mb-6 max-w-2xl mx-auto'>
              Descubre nuestros planes premium con análisis ilimitados, descargas de PDF sin restricciones y acceso a funciones avanzadas para profesionales.
            </p>
            
            <div className='grid md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-black/10 dark:border-white/10'>
                <div className='flex items-center gap-3 mb-3'>
                  <Icon icon="ph:infinity" width={24} height={24} className="text-green-500" />
                  <h5 className='text-lg font-semibold text-black dark:text-white'>Análisis Ilimitados</h5>
                </div>
                <p className='text-sm text-black/60 dark:text-white/60'>
                  Sin restricciones de créditos. Analiza todas las imágenes que necesites.
                </p>
              </div>
              
              <div className='bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-black/10 dark:border-white/10'>
                <div className='flex items-center gap-3 mb-3'>
                  <Icon icon="ph:file-pdf" width={24} height={24} className="text-red-500" />
                  <h5 className='text-lg font-semibold text-black dark:text-white'>PDFs Ilimitados</h5>
                </div>
                <p className='text-sm text-black/60 dark:text-white/60'>
                  Descarga todos los reportes PDF que necesites sin limitaciones.
                </p>
              </div>
              
              <div className='bg-white dark:bg-gray-800/50 rounded-xl p-6 border border-black/10 dark:border-white/10'>
                <div className='flex items-center gap-3 mb-3'>
                  <Icon icon="ph:headset" width={24} height={24} className="text-blue-500" />
                  <h5 className='text-lg font-semibold text-black dark:text-white'>Soporte Prioritario</h5>
                </div>
                <p className='text-sm text-black/60 dark:text-white/60'>
                  Soporte técnico prioritario y acceso a nuevas funciones.
                </p>
              </div>
            </div>
            
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Link 
                href="/planes"
                className='inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300'
              >
                <Icon icon="ph:crown" width={24} height={24} />
                <span>Ver Todos los Planes</span>
                <Icon icon="ph:arrow-right" width={20} height={20} />
              </Link>
              
              <button
                onClick={() => setShowPlanesModal(true)}
                className='text-primary hover:text-dark font-medium flex items-center gap-2 transition-colors'
              >
                <Icon icon="ph:info" width={16} height={16} />
                <span>Comparar planes rápidamente</span>
              </button>
            </div>
            
            {user && !hasPremiumPlan && (
              <div className='mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl'>
                <div className='flex items-center justify-center gap-2'>
                  <Icon icon="ph:lightning" width={20} height={20} className="text-yellow-600" />
                  <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                    <strong>Te quedan {user.creditos} créditos.</strong> Actualiza a un plan premium para análisis ilimitados.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      
      {/* Modal de planes */}
      <PlanesModal 
        isOpen={showPlanesModal}
        onClose={() => setShowPlanesModal(false)}
        onPlanSelect={(plan) => {
          console.log('Plan seleccionado:', plan);
          // Actualizar info de descargas después de seleccionar plan
          setTimeout(() => fetchDownloadInfo(), 1000);
        }}
      />
    </>
  )
}
