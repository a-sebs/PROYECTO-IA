import React from "react";
import { Metadata } from "next";
import HeroSub from "@/components/shared/HeroSub";
import EnfermedadesListing from "@/components/EnfermedadesList/EnfermedadList";

export const metadata: Metadata = {
    title: "Lista de Enfermedades | Portal Médico",
    description: "Información médica completa sobre las enfermedades que pueden estar afectando tu salud oral."
};

const EnfermedadesPage = () => {
    return (
        <>
            <HeroSub
                title="Conoce las principales enfermedades orales que nuestra IA detecta"
                description="Información médica completa sobre las enfermedades que pueden estar afectando tu salud oral."
                badge="Enfermedades Orales"
            />
            <EnfermedadesListing />
        </>
    );
};

export default EnfermedadesPage;