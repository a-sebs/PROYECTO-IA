"use client"
import React from 'react';
import { enfermedades } from '@/app/api/enfermedades';
import { useParams } from "next/navigation";
import { Icon } from '@iconify/react';
import { testimonials } from '@/app/api/testimonial';
import Link from 'next/link';
import Image from 'next/image';

export default function DetallesEnfermedad() {
    const { slug } = useParams();

    const enfermedad = enfermedades.find((enfermedad) => enfermedad?.slug === slug);
    return (
        <section className="!pt-44 pb-20 relative" >
            <div className="container mx-auto max-w-8xl px-5 2xl:px-0">
                <div className="grid grid-cols-12 items-end gap-6">
                    <div className="lg:col-span-8 col-span-12">
                        <h1 className='lg:text-52 text-40 font-semibold text-dark dark:text-white'>{enfermedad?.name}</h1>
                        <div className="flex gap-2.5">
                            <Icon icon="ph:tooth" width={24} height={24} className="text-dark/50 dark:text-white/50" />
                            <p className='text-dark/50 dark:text-white/50 text-xm'>{enfermedad?.location}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-4 col-span-12">
                        <div className='flex justify-center gap-8'>
                            <div className='flex flex-col gap-2 items-center'>
                                <Icon icon="ph:warning-circle" width={20} height={20} />
                                <p className='text-sm mobile:text-base font-normal text-black dark:text-white'>
                                    Severidad: {enfermedad?.severity}/10
                                </p>
                            </div>
                            <div className='flex flex-col gap-2 items-center'>
                                <Icon icon="ph:chart-line" width={20} height={20} />
                                <p className='text-sm mobile:text-base font-normal text-black dark:text-white'>
                                    Frecuencia: {enfermedad?.frequency}/5
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-12 mt-8 gap-8">
                    <div className="lg:col-span-8 col-span-12 row-span-2">
                        {enfermedad?.images && enfermedad?.images[0] && (
                            <div className="">
                                <Image
                                    src={enfermedad?.images[0]?.src}
                                    alt="Imagen principal de la enfermedad"
                                    width={400}
                                    height={500}
                                    className="rounded-2xl w-full h-540"
                                    unoptimized={true}
                                />
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-4 lg:block hidden">
                        {enfermedad?.images && enfermedad?.images[1] && (
                            <Image src={enfermedad?.images[1]?.src} alt="Imagen secundaria" width={400} height={500} className="rounded-2xl w-full h-full" unoptimized={true} />
                        )}
                    </div>
                    <div className="lg:col-span-2 col-span-6">
                        {enfermedad?.images && enfermedad?.images[2] && (
                            <Image src={enfermedad?.images[2]?.src} alt="Imagen adicional" width={400} height={500} className="rounded-2xl w-full h-full" unoptimized={true} />
                        )}
                    </div>
                    <div className="lg:col-span-2 col-span-6">
                        {enfermedad?.images && enfermedad?.images[3] && (
                            <Image src={enfermedad?.images[3]?.src} alt="Imagen detalle" width={400} height={500} className="rounded-2xl w-full h-full" unoptimized={true} />
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-8 mt-10">
                    <div className="lg:col-span-8 col-span-12">
                        <h3 className='text-xl font-medium'>Información médica</h3>
                        <div className="py-8 my-8 border-y border-dark/10 dark:border-white/20 flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <div>
                                    <Image src="/images/SVGs/property-details.svg" width={400} height={500} alt="" className='w-8 h-8 dark:hidden' unoptimized={true} />
                                    <Image src="/images/SVGs/property-details-white.svg" width={400} height={500} alt="" className='w-8 h-8 dark:block hidden' unoptimized={true} />
                                </div>
                                <div>
                                    <h3 className='text-dark dark:text-white text-xm'>Diagnóstico clínico</h3>
                                    <p className='text-base text-dark/50 dark:text-white/50'>
                                        Evaluación profesional requerida para diagnóstico preciso.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div>
                                    <Image src="/images/SVGs/smart-home-access.svg" width={400} height={500} alt="" className='w-8 h-8 dark:hidden' unoptimized={true} />
                                    <Image src="/images/SVGs/smart-home-access-white.svg" width={400} height={500} alt="" className='w-8 h-8 dark:block hidden' unoptimized={true} />
                                </div>
                                <div>
                                    <h3 className='text-dark dark:text-white text-xm'>Prevención efectiva</h3>
                                    <p className='text-base text-dark/50 dark:text-white/50'>
                                        Higiene oral adecuada y visitas regulares al dentista.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div>
                                    <Image src="/images/SVGs/energyefficient.svg" width={400} height={500} alt="" className='w-8 h-8 dark:hidden' unoptimized={true} />
                                    <Image src="/images/SVGs/energyefficient-white.svg" width={400} height={500} alt="" className='w-8 h-8 dark:block hidden' unoptimized={true} />
                                </div>
                                <div>
                                    <h3 className='text-dark dark:text-white text-xm'>Tratamiento moderno</h3>
                                    <p className='text-base text-dark/50 dark:text-white/50'>
                                        Tecnología avanzada para tratamientos efectivos y cómodos.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5">
                            {enfermedad?.description?.intro ? (
                                <p className='text-dark dark:text-white text-xm font-medium'>
                                    {enfermedad?.description.intro}
                                </p>
                            ) : (
                                <p className='text-dark dark:text-white text-xm '>
                                    Información médica general sobre enfermedades orales.
                                </p>
                            )}
                            {enfermedad?.description?.mainContent ? (
                                enfermedad?.description.mainContent.map((paragraph, index) => (
                                    <p key={index} className='text-dark dark:text-white text-xm'>
                                        {paragraph}
                                    </p>
                                ))
                            ) : (
                                <>
                                    <p className='text-dark dark:text-white text-xm '>
                                        Las enfermedades orales pueden afectar significativamente la calidad de vida. Es importante mantener una buena higiene oral y realizar visitas regulares al dentista.
                                    </p>
                                    <p className='text-dark dark:text-white text-xm '>
                                        El diagnóstico temprano y el tratamiento adecuado son fundamentales para prevenir complicaciones y mantener una salud oral óptima.
                                    </p>
                                    <p className='text-dark dark:text-white text-xm '>
                                        Consulte con un profesional de la salud oral para obtener un diagnóstico preciso y un plan de tratamiento personalizado.
                                    </p>
                                </>
                            )}
                            <p className='text-dark dark:text-white text-xm '>
                                The primary suite serves as a private retreat with a spa-like ensuite bathroom and a spacious walk-in closet.
                                each additional bedroom is thoughtfully designed with comfort and style in mind, offering ample space and modern
                                finishes. the home’s three bathrooms feature high-end fixtures, custom vanities, and elegant tiling.
                            </p>
                            <p className='text-dark dark:text-white text-xm '>
                                Outdoor living is equally impressive, with a beautifully landscaped backyard, multiple lounge areas,
                                and two fully equipped bar spaces.
                            </p>
                        </div>
                        <div className="py-8 mt-8 border-t border-dark/5 dark:border-white/15">
                            <h3 className='text-xl font-medium'>Síntomas y tratamientos</h3>
                            <div className="grid grid-cols-3 mt-5 gap-6">
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:warning-circle" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Síntomas tempranos</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:first-aid-kit" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Tratamiento conservador</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:hospital" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Consulta profesional</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:shield-check" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Prevención efectiva</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:pill" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Medicación específica</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Icon icon="ph:heart" width={24} height={24} className="text-dark dark:text-white" />
                                    <p className='text-base dark:text-white text-dark'>Cuidado integral</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-4 col-span-12">
                        <div className="bg-primary/10 p-8 rounded-2xl relative z-10 overflow-hidden">
                            <h4 className='text-dark text-3xl font-medium dark:text-white'>
                                {enfermedad?.rate}
                            </h4>
                            <p className='text-sm text-dark/50 dark:text-white'>Nivel de gravedad</p>
                            <div className="absolute right-0 top-4 -z-[1]">
                                <Image src="/images/enfermedades/vector.svg" width={400} height={500} alt="vector" unoptimized={true} />
                            </div>
                        </div>
                        {/* Filtrar testimonios por enfermedad específica */}
                        {testimonials
                            .filter(testimonial => 
                                testimonial.diseases?.includes(enfermedad?.slug || '') || 
                                !testimonial.diseases
                            )
                            .slice(0, 1)
                            .map((testimonialItem, index) => (
                            <div key={index} className="border p-10 rounded-2xl border-dark/10 dark:border-white/20 mt-10 flex flex-col gap-6">
                                <Icon icon="ph:tooth" width={44} height={44} className="text-primary" />
                                <p className='text-xm text-dark dark:text-white'>{testimonialItem.review}</p>
                                <div className="flex items-center gap-6">
                                    <Image src={testimonialItem.image} alt={testimonialItem.name} width={400} height={500} className='w-20 h-20 rounded-2xl' unoptimized={true} />
                                    <div className="">
                                        <h3 className='text-xm text-dark dark:text-white'>{testimonialItem.name}</h3>
                                        <h4 className='text-base text-dark/50 dark:text-white/50'>{testimonialItem.position}</h4>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
