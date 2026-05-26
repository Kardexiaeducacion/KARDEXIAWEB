"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Clock, Palette } from "lucide-react";

const DAYS = [
  { id: "lunes", label: "Lunes" },
  { id: "martes", label: "Martes" },
  { id: "miercoles", label: "Miércoles" },
  { id: "jueves", label: "Jueves" },
  { id: "viernes", label: "Viernes" }
];

const COLORS = [
  { id: "blue", class: "bg-blue-100 border-blue-400 text-blue-800" },
  { id: "emerald", class: "bg-emerald-100 border-emerald-400 text-emerald-800" },
  { id: "amber", class: "bg-amber-100 border-amber-400 text-amber-800" },
  { id: "rose", class: "bg-rose-100 border-rose-400 text-rose-800" },
  { id: "purple", class: "bg-purple-100 border-purple-400 text-purple-800" },
  { id: "indigo", class: "bg-indigo-100 border-indigo-400 text-indigo-800" },
  { id: "slate", class: "bg-slate-100 border-slate-400 text-slate-800" },
  { id: "teal", class: "bg-teal-100 border-teal-400 text-teal-800" },
];

export default function HorarioPage() {
  const { groups, activeGroupId, scheduleBlocks, addScheduleBlock, deleteScheduleBlock } = useAppContext();
  
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const groupBlocks = scheduleBlocks.filter(sb => sb.groupId === activeGroupId);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({
    title: "",
    startTime: "08:00",
    endTime: "08:50",
    days: ["lunes"] as string[],
    color: COLORS[0].class
  });

  const handleAddBlock = () => {
    if (newBlock.title && newBlock.startTime && newBlock.endTime && newBlock.days.length > 0) {
      addScheduleBlock({
        groupId: activeGroupId,
        title: newBlock.title,
        startTime: newBlock.startTime,
        endTime: newBlock.endTime,
        days: newBlock.days,
        color: newBlock.color
      });
      setIsAddOpen(false);
      
      // Auto-increment the start time for consecutive blocks
      setNewBlock({
        title: "",
        startTime: newBlock.endTime,
        endTime: "",
        days: newBlock.days,
        color: COLORS[Math.floor(Math.random() * COLORS.length)].class
      });
    }
  };

  const toggleDay = (dayId: string) => {
    setNewBlock(prev => {
      if (prev.days.includes(dayId)) {
        return { ...prev, days: prev.days.filter(d => d !== dayId) };
      } else {
        return { ...prev, days: [...prev.days, dayId] };
      }
    });
  };

  // Helper to format block for a specific day column
  const getBlocksForDay = (dayId: string) => {
    return groupBlocks
      .filter(block => (block.days || []).includes(dayId))
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Horario de Clases</h2>
          <p className="text-slate-500 text-sm mt-1">Configura el horario visual para {activeGroup?.name}</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Agregar Nueva Clase / Bloque
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nuevo Bloque de Tiempo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nombre de la Materia o Actividad</Label>
                <Input 
                  value={newBlock.title} 
                  onChange={e => setNewBlock({...newBlock, title: e.target.value})} 
                  placeholder="Ej. Matemáticas, Receso, Honores..." 
                  className="font-medium"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora de Inicio</Label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input type="time" className="pl-9" value={newBlock.startTime} onChange={e => setNewBlock({...newBlock, startTime: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Hora de Fin</Label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input type="time" className="pl-9" value={newBlock.endTime} onChange={e => setNewBlock({...newBlock, endTime: e.target.value})} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>¿Qué días se imparte a esta hora?</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <Button 
                      key={day.id}
                      type="button"
                      variant={newBlock.days.includes(day.id) ? "default" : "outline"}
                      className={newBlock.days.includes(day.id) ? "bg-indigo-600 hover:bg-indigo-700" : "text-slate-600 hover:bg-slate-100"}
                      onClick={() => toggleDay(day.id)}
                      size="sm"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Palette className="w-4 h-4" /> Color del Bloque</Label>
                <div className="flex flex-wrap gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {COLORS.map(color => (
                    <button
                      key={color.id}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color.class.split(' ')[0]} ${newBlock.color === color.class ? 'border-indigo-600 shadow-md scale-110 ring-2 ring-indigo-200' : 'border-transparent'}`}
                      onClick={() => setNewBlock({...newBlock, color: color.class})}
                      type="button"
                      aria-label={color.id}
                    />
                  ))}
                </div>
              </div>

              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2" 
                onClick={handleAddBlock} 
                disabled={!newBlock.title || !newBlock.startTime || !newBlock.endTime || newBlock.days.length === 0}
              >
                Guardar Bloque
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200 overflow-x-auto">
        <div className="min-w-[1000px] grid grid-cols-5 gap-4">
          {DAYS.map(day => (
            <div key={day.id} className="flex flex-col gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-center font-bold text-slate-700 sticky top-0 z-10">
                {day.label}
              </div>
              
              <div className="flex flex-col gap-2 min-h-[400px] p-1">
                {getBlocksForDay(day.id).map(block => (
                  <div 
                    key={block.id} 
                    className={`relative group p-3 rounded-xl border shadow-sm transition-all hover:shadow-md ${block.color}`}
                  >
                    <div className="font-bold text-sm leading-tight pr-6">
                      {block.title}
                    </div>
                    <div className="text-xs mt-1.5 opacity-80 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {block.startTime} - {block.endTime}
                    </div>
                    
                    <button 
                      onClick={() => deleteScheduleBlock(block.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 hover:bg-white text-slate-700 hover:text-red-600"
                      title="Eliminar este bloque"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                {getBlocksForDay(day.id).length === 0 && (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm italic py-8 bg-slate-50/50">
                    Día Libre
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
