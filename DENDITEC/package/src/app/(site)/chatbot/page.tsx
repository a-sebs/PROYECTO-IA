import { Metadata } from "next";
import ChatbotFull from "@/components/Home/ChatbotFull";
import HeroSub from "@/components/shared/HeroSub";

export const metadata: Metadata = {
  title: "Chatbot DenDi | Asistente de Salud Dental",
  description: "Pregunta a nuestro asistente inteligente DenDi sobre salud dental y obtén respuestas inmediatas.",
};

const ChatbotPage = () => {
  return (
    <>
      <HeroSub
        title="Chatbot DenDi"
        description="Pregunta a nuestro asistente inteligente sobre salud dental y obtén respuestas inmediatas."
        badge="Asistente IA"
      />
      <ChatbotFull />
    </>
  );
};

export default ChatbotPage;
