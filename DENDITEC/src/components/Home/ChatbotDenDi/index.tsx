'use client'
import React from 'react';
import { Icon } from "@iconify/react";
import Link from 'next/link';

const ChatbotDenDi: React.FC = () => {
    return (
        <section id="chatbot" className="py-20 bg-gray-50 dark:bg-gray-900">
            <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
                <div className='flex justify-center mb-10'>
                    <div className="text-center">
                        <p className="text-dark/75 dark:text-white/75 text-base font-semibold flex gap-2 justify-center items-center">
                            <Icon icon="ph:chat-circle-dots-fill" className="text-2xl text-primary" aria-label="Chat icon" />
                            Chatbot DenDi
                        </p>
                        <h2 className="lg:text-52 text-40 font-medium dark:text-white">
                            Tu asistente inteligente de salud dental
                        </h2>
                        <p className='text-dark/50 dark:text-white/50 text-xm mt-4 max-w-3xl mx-auto'>
                            Conversa con DenDi, nuestro asistente de inteligencia artificial especializado en salud dental. 
                            Obtén respuestas inmediatas sobre cuidado bucal, tratamientos, prevención y más.
                        </p>
                    </div>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Icon icon="ph:chat-dots-fill" className="text-2xl text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-dark dark:text-white mb-2">
                                        Conversación Natural
                                    </h3>
                                    <p className="text-dark/70 dark:text-white/70">
                                        Habla con DenDi como lo harías con un dentista profesional. 
                                        Usa lenguaje natural para hacer cualquier pregunta sobre salud dental.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Icon icon="ph:clock-fill" className="text-2xl text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-dark dark:text-white mb-2">
                                        Disponible 24/7
                                    </h3>
                                    <p className="text-dark/70 dark:text-white/70">
                                        DenDi está disponible las 24 horas del día, los 7 días de la semana. 
                                        Obtén respuestas inmediatas cuando más las necesites.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Icon icon="ph:shield-check-fill" className="text-2xl text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-dark dark:text-white mb-2">
                                        Información Confiable
                                    </h3>
                                    <p className="text-dark/70 dark:text-white/70">
                                        Basado en conocimientos médicos actualizados y mejores prácticas 
                                        en odontología para brindarte información precisa y confiable.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8">
                            <Link 
                                href="/chatbot" 
                                className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-semibold transition-colors duration-300"
                            >
                                <Icon icon="ph:chat-circle-dots-fill" className="text-xl" />
                                Conversar con DenDi
                            </Link>
                        </div>
                    </div>
                    
                    <div className="lg:order-first">
                        <div className="relative">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                        <Icon icon="ph:robot-fill" className="text-2xl text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-dark dark:text-white">DenDi</h4>
                                        <p className="text-sm text-dark/60 dark:text-white/60">Asistente IA</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <p className="text-dark dark:text-white">
                                            ¡Hola! Soy DenDi, tu asistente personal de salud dental. 
                                            ¿En qué puedo ayudarte hoy?
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-2 flex-wrap">
                                        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                                            Cuidado preventivo
                                        </span>
                                        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                                            Tratamientos
                                        </span>
                                        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                                            Emergencias
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ChatbotDenDi;
