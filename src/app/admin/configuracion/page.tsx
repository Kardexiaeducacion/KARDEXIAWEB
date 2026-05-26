"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminConfiguracion() {
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    precioMensual: "149",
    precioAnual: "1490",
    diasPrueba: "14",
    avisoMantenimiento: ""
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Simular guardado exitoso
      window.dispatchEvent(new CustomEvent('edu_sync_update'));
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 max-w-4xl">
      
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configuración Global</h2>
        <p className="text-slate-500">Ajusta los parámetros generales de la plataforma Kardexia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800">Precios de Suscripción</CardTitle>
            <CardDescription>
              Configura los precios que se mostrarán a los usuarios. (Aún no conectado a pasarela de pago).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mensual">Suscripción Mensual (MXN)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <Input 
                  id="mensual" 
                  type="number" 
                  className="pl-7" 
                  value={config.precioMensual}
                  onChange={(e) => setConfig({...config, precioMensual: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="anual">Suscripción Anual (MXN)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <Input 
                  id="anual" 
                  type="number" 
                  className="pl-7" 
                  value={config.precioAnual}
                  onChange={(e) => setConfig({...config, precioAnual: e.target.value})}
                />
              </div>
              <p className="text-xs text-slate-500">Normalmente se ofrece un descuento equivalente a 2 meses.</p>
            </div>
            
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label htmlFor="prueba">Días de Prueba Gratuita</Label>
              <Input 
                id="prueba" 
                type="number" 
                value={config.diasPrueba}
                onChange={(e) => setConfig({...config, diasPrueba: e.target.value})}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 rounded-b-xl py-3">
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Aviso a Usuarios
            </CardTitle>
            <CardDescription>
              Muestra un mensaje de advertencia o mantenimiento a todos los usuarios en su dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Mensaje Global</Label>
              <Input 
                placeholder="Ej. Realizaremos mantenimiento a las 11:00 PM..." 
                value={config.avisoMantenimiento}
                onChange={(e) => setConfig({...config, avisoMantenimiento: e.target.value})}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 rounded-b-xl py-3">
            <Button variant="outline" className="w-full text-slate-700 hover:bg-slate-100" onClick={handleSave}>
              Actualizar Aviso
            </Button>
          </CardFooter>
        </Card>
      </div>
      
    </div>
  );
}
