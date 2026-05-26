"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lock, BookOpen, Clock, ShieldCheck } from "lucide-react";

import { useAppContext } from "@/context/AppContext";

export default function Anecdotario() {
  const { anecdotes, activeGroupId, addAnecdote } = useAppContext();
  const activeAnecdotes = anecdotes.filter(a => a.groupId === activeGroupId);
  
  const [newContent, setNewContent] = useState("");

  const handleSave = () => {
    if (!newContent.trim()) return;
    
    addAnecdote({
      groupId: activeGroupId,
      date: new Date().toISOString(),
      content: newContent
    });
    
    setNewContent("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-indigo-600" />
            Diario de Clase
          </h2>
          <p className="text-sm text-slate-500 mt-1">Registro personal, inmutable y protegido para respaldo profesional.</p>
        </div>
        <div className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="mr-1.5 h-4 w-4" />
          Registros Encriptados
        </div>
      </div>

      <Card className="border-indigo-100 shadow-md">
        <CardHeader className="bg-indigo-50/50 border-b border-indigo-50 pb-4">
          <CardTitle className="text-lg text-indigo-900">Nueva Entrada</CardTitle>
          <CardDescription>
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Textarea 
            placeholder="Escribe aquí los sucesos relevantes del día..."
            className="min-h-[150px] resize-none text-slate-700 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-slate-50/50 rounded-b-xl border-t border-slate-100 pt-4 pb-4">
          <p className="text-xs text-slate-500 flex items-center">
            <Lock className="mr-1.5 h-3 w-3" />
            Una vez guardada, la entrada no podrá modificarse ni eliminarse.
          </p>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700" 
            onClick={handleSave}
            disabled={!newContent.trim()}
          >
            Sellar Registro
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-6 pt-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-2 border-l-4 border-slate-300">
          Registros Anteriores
        </h3>
        
        {activeAnecdotes.map((entry) => (
          <div key={entry.id} className="relative pl-8 pb-4">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />
            <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-slate-400 ring-4 ring-white" />
            
            <Card className="border-slate-200 shadow-sm opacity-95">
              <CardHeader className="py-3 px-4 bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between">
                <div className="flex items-center text-sm font-medium text-slate-700">
                  <Clock className="mr-2 h-4 w-4 text-slate-400" />
                  {format(new Date(entry.date), "dd MMM yyyy, HH:mm", { locale: es })}
                </div>
                <div className="flex items-center text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                  <Lock className="mr-1 h-3 w-3" /> Inmutable
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-serif">
                  {entry.content}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
