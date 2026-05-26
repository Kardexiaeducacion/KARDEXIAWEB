"use client";

import { useEffect, useState } from "react";
import { ExternalLink, MessageCircle, Sparkles, Users, FileText, Bell, AlertCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfflineScreen } from "@/components/ui/OfflineScreen";

export default function WhatsApp() {
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

  const openWhatsApp = () => {
    window.open('https://web.whatsapp.com', '_blank');
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto space-y-8 py-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <MessageCircle className="mr-3 h-6 w-6 text-green-600" />
          Comunicaciones (WhatsApp Web)
        </h2>
        <p className="text-slate-500 mt-1">
          Mantén contacto con padres de familia y alumnos sin salir de Kardexia.
        </p>
      </div>

      {isElectron ? (
        <div className="flex-1 w-full bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[600px] flex flex-col">
          {!isOnline ? (
            <OfflineScreen />
          ) : (
            <>
              <div className="bg-green-50 border-b border-green-200 p-2 text-xs text-green-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Has iniciado el visor web interno de WhatsApp. Para salir, haz clic en otro apartado del menú.</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-green-700 hover:bg-green-100" onClick={openWhatsApp}>
                  <ExternalLink className="h-3 w-3 mr-1" /> Pop-up
                </Button>
              </div>
              {/* WebView Element for Electron bypasses X-Frame-Options */}
              {/* @ts-ignore - Webview is a valid electron tag */}
              <webview 
                src="https://web.whatsapp.com/" 
                className="w-full h-full flex-1"
                style={{ display: 'flex', width: '100%', height: '100%' }}
                useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                allowpopups="true"
              />
            </>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
            <MessageCircle className="w-64 h-64" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 text-emerald-200" />
              <span>Integración Externa</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Comunicación directa y eficaz.
            </h1>
            
            <p className="text-lg text-white/90 mb-8 max-w-xl">
              Por motivos de seguridad de tu navegador web, WhatsApp Web requiere iniciarse en su propia ventana para poder cifrar tus mensajes de extremo a extremo.
            </p>
            
            <Button 
              onClick={openWhatsApp}
              size="lg"
              className="bg-white text-green-700 hover:bg-slate-50 border-0 font-bold text-base h-14 px-8 shadow-lg hover:shadow-xl transition-all"
            >
              <ExternalLink className="mr-3 h-5 w-5" />
              Vincular y Abrir WhatsApp
            </Button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-6 mt-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Grupos de Padres</h3>
          <p className="text-slate-500 text-sm">Organiza la comunicación del salón con mensajes grupales o listas de difusión.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-12 w-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Envío de Tareas</h3>
          <p className="text-slate-500 text-sm">Comparte documentos, pdfs o imágenes de las tareas directamente desde tu computadora.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">Avisos Urgentes</h3>
          <p className="text-slate-500 text-sm">Notifica rápidamente sobre cambios de horario, materiales olvidados o comportamiento.</p>
        </div>
      </div>
    </div>
  );
}
