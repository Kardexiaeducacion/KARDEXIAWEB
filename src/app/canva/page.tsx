"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Palette, Sparkles, LayoutTemplate, Image as ImageIcon, AlertCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfflineScreen } from "@/components/ui/OfflineScreen";

export default function Canva() {
  const [isElectron, setIsElectron] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Detectar si estamos conectados a internet
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    // Detectar si estamos corriendo dentro de Electron
    if (typeof window !== "undefined" && window.navigator && window.navigator.userAgent) {
      if (window.navigator.userAgent.toLowerCase().includes("electron")) {
        setIsElectron(true);
      }
    }
  }, []);

  const openCanva = () => {
    window.open('https://www.canva.com', '_blank');
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto space-y-8 py-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <Palette className="mr-3 h-6 w-6 text-indigo-600" />
          Estudio de Diseño Integrado
        </h2>
        <p className="text-slate-500 mt-1">
          Kardexia utiliza Canva como motor principal de diseño para tus recursos educativos.
        </p>
      </div>

      {isElectron ? (
        <div className="flex-1 w-full bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[600px] flex flex-col">
          {!isOnline ? (
            <OfflineScreen />
          ) : (
            <>
              <div className="bg-amber-50 border-b border-amber-200 p-2 text-xs text-amber-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Has iniciado el visor web interno de Canva. Para salir, haz clic en otro apartado del menú.</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-amber-700 hover:bg-amber-100" onClick={openCanva}>
                  <ExternalLink className="h-3 w-3 mr-1" /> Pop-up
                </Button>
              </div>
              {/* WebView Element for Electron bypasses X-Frame-Options */}
              {/* @ts-ignore - Webview is a valid electron tag */}
              <webview 
                src="https://www.canva.com/" 
                className="w-full h-full flex-1"
                style={{ display: 'flex', width: '100%', height: '100%' }}
                allowpopups="true"
              />
            </>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
            <Palette className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Integración Externa</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Crea material didáctico que inspire.
            </h1>
            
            <p className="text-lg text-white/80 mb-8 max-w-xl">
              Por motivos de seguridad de tu navegador web, Canva requiere iniciarse en su propia ventana. Haz clic abajo para abrir el estudio y comenzar a diseñar.
            </p>
            
            <Button 
              onClick={openCanva}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-slate-50 border-0 font-bold text-base h-14 px-8 shadow-lg hover:shadow-xl transition-all"
            >
              <ExternalLink className="mr-3 h-5 w-5" />
              Iniciar Sesión y Abrir Canva
            </Button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-6 mt-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <LayoutTemplate className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Presentaciones</h3>
          <p className="text-slate-500 text-sm">Crea diapositivas atractivas para tus clases usando plantillas educativas.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-12 w-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4">
            <ImageIcon className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Infografías</h3>
          <p className="text-slate-500 text-sm">Resume temas complejos en gráficos visuales fáciles de entender para los alumnos.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Palette className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Material Imprimible</h3>
          <p className="text-slate-500 text-sm">Diseña exámenes, diplomas y hojas de trabajo listas para descargar y compartir.</p>
        </div>
      </div>
    </div>
  );
}
