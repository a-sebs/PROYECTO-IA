import HeroSub from "@/components/shared/HeroSub";
import EnfermedadList from "@/components/EnfermedadesList/EnfermedadList";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Lista de Enfermedades | DenDiTec",
};

const page = () => {
    return (
        <>
            <HeroSub
                title="Enfermedades Orales."
                description="Información detallada sobre las principales enfermedades orales y sus tratamientos."
                badge="Enfermedades"
            />
            <EnfermedadList />
        </>
    );
};

export default page;