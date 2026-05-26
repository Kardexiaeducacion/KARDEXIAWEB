"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LifeBuoy, MessageSquare, CheckCircle2, Clock } from "lucide-react";

// Datos de demostración
const mockTickets = [
  { id: "T-1042", usuario: "Ana Sofía", email: "ana.profe@yahoo.com", asunto: "Problema con inicio de sesión", fecha: "Hoy, 10:30 AM", estado: "Pendiente", prioridad: "Alta" },
  { id: "T-1041", usuario: "Yelle M", email: "yelle@kardexia.com", asunto: "Duda sobre cómo cambiar foto de perfil", fecha: "Ayer, 04:15 PM", estado: "En Proceso", prioridad: "Baja" },
  { id: "T-1040", usuario: "Carlos Ramírez", email: "carlos.r@gmail.com", asunto: "Fallo en la sincronización del horario", fecha: "19 May 2024", estado: "Resuelto", prioridad: "Media" },
];

export default function AdminSoporte() {
  const [activeTab, setActiveTab] = useState("Todos");

  const filteredTickets = activeTab === "Todos" 
    ? mockTickets 
    : mockTickets.filter(t => t.estado === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Centro de Soporte</h2>
          <p className="text-slate-500">Administra y responde los reportes de los usuarios.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {["Todos", "Pendiente", "En Proceso", "Resuelto"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTickets.map(ticket => (
          <Card key={ticket.id} className="bg-white border-slate-200 hover:border-indigo-200 transition-colors cursor-pointer group shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full shrink-0 ${
                    ticket.estado === 'Resuelto' ? 'bg-emerald-50 text-emerald-500' :
                    ticket.estado === 'En Proceso' ? 'bg-amber-50 text-amber-500' :
                    'bg-indigo-50 text-indigo-500'
                  }`}>
                    {ticket.estado === 'Resuelto' ? <CheckCircle2 className="h-5 w-5" /> : 
                     ticket.estado === 'En Proceso' ? <Clock className="h-5 w-5" /> : 
                     <LifeBuoy className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-800">{ticket.id}</span>
                      <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${
                        ticket.prioridad === 'Alta' ? 'border-rose-200 text-rose-600 bg-rose-50' :
                        ticket.prioridad === 'Media' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                        'border-slate-200 text-slate-600 bg-slate-50'
                      }`}>
                        Prioridad {ticket.prioridad}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{ticket.asunto}</h3>
                    <p className="text-sm text-slate-500 mt-1">Reportado por <span className="font-medium text-slate-700">{ticket.usuario}</span> ({ticket.email})</p>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">{ticket.fecha}</span>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 shrink-0">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Responder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
    </div>
  );
}
