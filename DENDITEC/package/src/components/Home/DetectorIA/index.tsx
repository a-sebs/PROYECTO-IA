"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { detectorIA } from "@/app/api/detectorIA";
import { Icon } from "@iconify/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const DetectorIA: React.FC = () => {
  const [api, setApi] = React.useState<CarouselApi | undefined>(undefined);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  return (
    <section className="py-16 md:py-20">
      <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <Carousel
              setApi={setApi}
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {detectorIA.map((item, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={item.scr}
                      alt={item.alt}
                      width={680}
                      height={530}
                      className="rounded-2xl w-full h-auto aspect-[4/3] object-cover"
                      unoptimized={true}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="absolute left-1/2 transform -translate-x-1/2 bg-dark/50 rounded-full py-2.5 bottom-6 flex justify-center mt-4 gap-2.5 px-2.5">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2.5 h-2.5 rounded-full ${current === index + 1 ? "bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-8 lg:gap-10 order-1 lg:order-2">
            <div>
              <p className="text-dark/75 dark:text-white/75 text-base font-semibold flex gap-2">
                <Icon icon="ph:robot" className="text-2xl text-primary " />
                Detector de enfermedades orales con IA
              </p>
              <h2 className="lg:text-52 text-40 font-medium text-dark dark:text-white">
                Diagnóstico inteligente
              </h2>
              <div className="flex items-center gap-2.5">
                <Icon icon="ph:brain" width={28} height={26} className="text-dark/50 dark:text-white/50" />
                <p className="text-dark/50 dark:text-white/50 text-base">
                  Tecnología de IA avanzada
                </p>
              </div>
            </div>
            <p className="text-base text-dark/50 dark:text-white/50">
              Nuestro sistema de inteligencia artificial utiliza algoritmos avanzados de machine learning para detectar y diagnosticar 
              enfermedades orales con alta precisión. Analiza fotografías intraorales para proporcionar 
              diagnósticos rápidos, si tienes poca disponibilidad para ir a un dentista.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2.5 rounded-[6px]">
                  <Icon icon="ph:camera" width={24} height={24} className="text-primary" />
                </div>
                <h6 className="">Análisis visual</h6>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2.5 rounded-[6px]">
                  <Icon icon="ph:tooth" width={24} height={24} className="text-primary" />
                </div>
                <h6 className="">Detección oral</h6>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2.5 rounded-[6px]">
                  <Icon icon="ph:chart-line-up" width={24} height={24} className="text-primary" />
                </div>
                <h6 className="">Alta Precisión</h6>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-dark/5 dark:bg-white/5 p-2.5 rounded-[6px]">
                  <Icon icon="ph:clock" width={24} height={24} className="text-primary" />
                </div>
                <h6 className="">Diagnóstico rápido</h6>
              </div>
            </div>
            <div className="flex gap-10 justify-center items-center -ml-6">
                <Link href="/detectorIA" className="py-4 px-8 bg-primary hover:bg-dark duration-300 rounded-full text-white">
                    Probar detector
                </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetectorIA;
