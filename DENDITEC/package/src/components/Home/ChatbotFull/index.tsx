'use client'
import React from 'react';
import { Icon } from "@iconify/react";

const ChatbotFull: React.FC = () => {
    return (
        <section className="py-20">
            <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
                <div className='flex justify-center mb-10'>
                    <div className="text-center">
                        <p className="text-dark/75 dark:text-white/75 text-base font-semibold flex gap-2 justify-center items-center">
                            <Icon icon="ph:chat-circle-dots-fill" className="text-2xl text-primary" aria-label="Chat icon" />
                            Conversa con DenDi
                        </p>
                        <h2 className="lg:text-52 text-40 font-medium dark:text-white">
                            Tu asistente personal de salud dental
                        </h2>
                        <p className='text-dark/50 dark:text-white/50 text-xm mt-4 max-w-2xl mx-auto'>
                            DenDi está aquí para responder todas tus preguntas sobre salud dental. 
                            Desde cuidado preventivo hasta tratamientos específicos, nuestro asistente inteligente 
                            te brindará información confiable y personalizada.
                        </p>
                    </div>
                </div>
                <div className="flex justify-center">
                    <div className="w-full max-w-5xl min-h-[700px] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                        <iframe
                            src="https://www.stack-ai.com/chat/6882e6960d3201f08c97b8b1-3bGjMbFj8P8F2A38HDsk8o"
                            width="100%"
                            height="700"
                            style={{ 
                                border: 'none', 
                                borderRadius: '12px',
                                minHeight: '700px'
                            }}
                            title="Chatbot DenDi - Asistente de Salud Dental"
                            allow="microphone; camera; clipboard-read; clipboard-write"
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ChatbotFull;
