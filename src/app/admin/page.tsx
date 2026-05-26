"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Download, Eye, DollarSign, Activity, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 142,
    activeSubscriptions: 89,
    monthlyRevenue: 8900,
    pageViews: 12540,
    appDownloads: 3450,
  });

  // Simular incremento en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        pageViews: prev.pageViews + Math.floor(Math.random() * 5),
        appDownloads: prev.appDownloads + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Usuarios Registrados</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.totalUsers}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Suscripciones Activas</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.activeSubscriptions}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> Ingreso estimado: ${stats.monthlyRevenue.toLocaleString()} MXN
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Vistas de la Página</CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Eye className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.pageViews.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Visitas únicas totales (Contador Interno)</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Descargas App Escritorio</CardTitle>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Download className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{stats.appDownloads.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Descargas para Windows/Mac (Contador Interno)</p>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800 shadow-sm md:col-span-2 lg:col-span-2 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Estado del Sistema</CardTitle>
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400 mb-2">Óptimo</div>
            <p className="text-sm text-slate-400">La sincronización Local-First bidireccional y los servicios de base de datos están operando al 100%.</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
