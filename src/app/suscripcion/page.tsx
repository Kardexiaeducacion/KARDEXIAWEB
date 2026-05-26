"use client";

import { Lock, ShieldAlert, ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function SuscripcionPage() {
  const { logoutUser } = useAuth();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 p-[2px] mb-6">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white text-center tracking-tight mb-2">
            Acceso Restringido
          </h1>
          <p className="text-slate-400 text-center text-sm">
            Tu suscripción a Kardexia se encuentra inactiva o expirada. 
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleRefresh}
            className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
          >
            Verificar Estado <ArrowRight className="w-5 h-5" />
          </Button>
          
          <Button 
            onClick={logoutUser}
            variant="outline"
            className="w-full py-6 rounded-xl border-white/20 text-slate-300 hover:text-white hover:bg-white/10 font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Este software opera bajo la arquitectura Local-First. Si acabas de renovar tu suscripción en la página web principal, asegúrate de estar conectado a internet y haz clic en "Verificar Estado".
          </p>
        </div>
      </div>
    </div>
  );
}
