"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfflineScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-end p-8 text-center text-white relative overflow-hidden min-h-[600px] shadow-inner bg-[#1f382a]">
      {/* Imagen de fondo (dibujo de tiza) */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/offline_chalkboard.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Gradiente oscuro en la parte inferior para hacer legible el texto */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#1b3023] via-[#1b3023]/80 to-transparent" />

      {/* Contenido de texto y botón al fondo */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full mb-4">
        <h3 className="text-3xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
          ¡Recreo inesperado! Sin conexión a Internet.
        </h3>
        
        <p className="text-slate-100 text-base leading-relaxed mb-8 drop-shadow font-medium">
          Para seguir gestionando calificaciones, asistencias y el panel de alumnos, necesitas conectar tu dispositivo a internet. Por favor, revisa tu Wi-Fi o datos móviles para continuar trabajando.
        </p>
        
        <Button 
          variant="outline" 
          className="bg-white text-[#1c3f2d] hover:bg-slate-50 border-none rounded-lg px-6 py-5 h-auto font-bold shadow-xl transition-all"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar conexión
        </Button>
      </div>
    </div>
  );
}
