"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { useAppContext, EventRecord, SchoolCalendar, ArchivedCycle } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Bell, Plus, Clock, AlignLeft, Trash2, Settings, CalendarIcon, Archive, Download } from "lucide-react";

export default function Agenda() {
  const { events, activeGroupId, addEvent, updateEvent, deleteEvent, schoolCalendars, updateSchoolCalendar, archivedCycles, maxArchivedCycles, setMaxArchivedCycles, archiveCurrentCycle, deleteArchivedCycle } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCycleOpen, setIsCycleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);

  const activeCalendar = schoolCalendars[0]; // Usar el primero por defecto
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "" });

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00",
    description: "",
    alert: false
  });

  const activeEvents = events.filter(e => e.groupId === activeGroupId);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const startingDayIndex = getDay(startOfMonth(currentMonth));
  const blanks = Array(startingDayIndex).fill(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    
    addEvent({
      groupId: activeGroupId,
      ...newEvent
    });
    
    setIsAddOpen(false);
    setNewEvent({ title: "", date: format(new Date(), "yyyy-MM-dd"), time: "10:00", description: "", alert: false });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editingEvent.title) return;
    
    updateEvent(editingEvent.id, {
      title: editingEvent.title,
      date: editingEvent.date,
      time: editingEvent.time,
      description: editingEvent.description,
      alert: editingEvent.alert
    });
    
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
      setIsEditOpen(false);
    }
  };

  const openAddModal = (date: Date) => {
    setNewEvent({ ...newEvent, date: format(date, "yyyy-MM-dd") });
    setIsAddOpen(true);
  };

  const openEditModal = (event: EventRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(event);
    setIsEditOpen(true);
  };

  const handleAddHoliday = () => {
    if (newHoliday.date && newHoliday.name && activeCalendar) {
      updateSchoolCalendar(activeCalendar.id, {
        holidays: [...activeCalendar.holidays, { ...newHoliday }].sort((a, b) => a.date.localeCompare(b.date))
      });
      setNewHoliday({ date: "", name: "" });
    }
  };

  const handleDeleteHoliday = (index: number) => {
    if (activeCalendar) {
      const newHolidays = [...activeCalendar.holidays];
      newHolidays.splice(index, 1);
      updateSchoolCalendar(activeCalendar.id, { holidays: newHolidays });
    }
  };

  const handleArchiveCurrent = () => {
    if (!activeCalendar) return;
    if (confirm(`⚠️ ATENCIÓN ⚠️\n¿Estás seguro de que deseas cerrar el ciclo "${activeCalendar.name}"?\nEsto empaquetará a todos tus alumnos, tareas, calificaciones y archivos actuales en el historial, y dejará los paneles COMPLETAMENTE EN BLANCO para empezar de nuevo.`)) {
      archiveCurrentCycle(activeCalendar.id, activeCalendar.name);
      alert("Ciclo archivado exitosamente. Tu panel ahora está en blanco.");
      setIsCycleOpen(false);
    }
  };

  const handleExportArchive = (archive: ArchivedCycle) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(archive.data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Respaldo_Ciclo_${archive.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Agenda Escolar</h2>
          <p className="text-slate-500 text-sm mt-1">Programa reuniones, eventos y recordatorios de tu clase</p>
        </div>
        
        <div className="flex gap-2">
          {activeCalendar && (
            <Dialog open={isCycleOpen} onOpenChange={setIsCycleOpen}>
              <DialogTrigger render={<Button variant="outline" className="bg-white border-slate-200 text-slate-700" />}>
                <Settings className="mr-2 h-4 w-4" /> Configurar Ciclo
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Configuración de Ciclo Escolar</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Nombre del Ciclo</Label>
                    <Input 
                      value={activeCalendar.name} 
                      onChange={(e) => updateSchoolCalendar(activeCalendar.id, { name: e.target.value })} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Inicio de Clases</Label>
                      <Input 
                        type="date" 
                        value={activeCalendar.startDate} 
                        onChange={(e) => updateSchoolCalendar(activeCalendar.id, { startDate: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fin de Clases</Label>
                      <Input 
                        type="date" 
                        value={activeCalendar.endDate} 
                        onChange={(e) => updateSchoolCalendar(activeCalendar.id, { endDate: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Color de Agenda (Días de Clases)</Label>
                    <div className="flex gap-3 items-center">
                      <Input 
                        type="color" 
                        className="w-14 h-10 p-1 cursor-pointer"
                        value={activeCalendar.cycleColor || "#eef2ff"} 
                        onChange={(e) => updateSchoolCalendar(activeCalendar.id, { cycleColor: e.target.value })} 
                      />
                      <span className="text-xs text-slate-500">Elige un tono pastel para iluminar los días de tu ciclo.</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <Label className="mb-2 block">Días Festivos / Vacaciones</Label>
                    <div className="flex gap-2 mb-4">
                      <Input 
                        type="date" 
                        className="w-[140px]" 
                        value={newHoliday.date} 
                        onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})} 
                      />
                      <Input 
                        placeholder="Motivo (ej. Consejo Técnico)" 
                        value={newHoliday.name} 
                        onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})} 
                        onKeyDown={(e) => e.key === 'Enter' && handleAddHoliday()}
                      />
                      <Button onClick={handleAddHoliday} variant="secondary">Add</Button>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                      {activeCalendar.holidays.map((h, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-sm font-medium text-slate-700">{h.date} - {h.name}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => handleDeleteHoliday(i)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <h3 className="text-md font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Archive className="w-5 h-5 text-indigo-500" />
                      Historial y Archivo
                    </h3>
                    
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg mb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm text-rose-800">
                          <p className="font-semibold mb-1">Cerrar Ciclo Actual</p>
                          <p className="text-xs opacity-90">Archivará toda la información y limpiará el panel para comenzar un ciclo nuevo.</p>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleArchiveCurrent} className="shrink-0">
                          Cerrar Ciclo
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">Ciclos a conservar (Máx.)</Label>
                      <Input 
                        type="number" 
                        min="1" max="10" 
                        className="w-20 text-center"
                        value={maxArchivedCycles} 
                        onChange={(e) => setMaxArchivedCycles(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2 mt-4 max-h-[150px] overflow-y-auto">
                      {archivedCycles.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4 italic">No hay ciclos archivados aún.</p>
                      ) : (
                        archivedCycles.map((arch) => (
                          <div key={arch.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50">
                            <div>
                              <p className="font-semibold text-sm text-slate-700">{arch.name}</p>
                              <p className="text-xs text-slate-500">Archivado el {new Date(arch.archiveDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="outline" size="sm" onClick={() => handleExportArchive(arch)} title="Exportar JSON">
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => { if(confirm("¿Eliminar este respaldo permanentemente?")) deleteArchivedCycle(arch.id); }}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-2 border-t border-slate-200 flex justify-end sticky bottom-0 bg-white z-10 py-2">
                    <Button onClick={() => setIsCycleOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">Guardar Cambios</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" />}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Programar Evento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título del Evento</Label>
                  <Input id="title" required value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} placeholder="Ej. Junta de Padres" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input id="date" type="date" required value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input id="time" type="time" required value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Descripción (Opcional)</Label>
                  <Textarea id="desc" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} />
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-slate-700">Activar Alerta</Label>
                    <p className="text-xs text-slate-500">Muestra un recordatorio visual destacado</p>
                  </div>
                  <Switch checked={newEvent.alert} onCheckedChange={(checked) => setNewEvent({...newEvent, alert: checked})} />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Guardar Evento</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Modal de Edición */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del Evento</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título del Evento</Label>
                <Input id="edit-title" required value={editingEvent.title} onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Fecha</Label>
                  <Input id="edit-date" type="date" required value={editingEvent.date} onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Hora</Label>
                  <Input id="edit-time" type="time" required value={editingEvent.time} onChange={(e) => setEditingEvent({...editingEvent, time: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">Descripción</Label>
                <Textarea id="edit-desc" value={editingEvent.description} onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})} />
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold text-slate-700">Activar Alerta</Label>
                </div>
                <Switch checked={editingEvent.alert} onCheckedChange={(checked) => setEditingEvent({...editingEvent, alert: checked})} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="destructive" className="w-full" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Actualizar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card className="shadow-sm border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800 capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h3>
          <div className="flex items-center gap-4">
            {activeCalendar && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium">
                <CalendarIcon className="h-4 w-4" />
                Ciclo Activo: {activeCalendar.name}
              </div>
            )}
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[120px] p-2 border-b border-r border-slate-100 bg-slate-50/30" />
            ))}
            {daysInMonth.map(date => {
              const dateStr = format(date, "yyyy-MM-dd");
              const dayEvents = activeEvents.filter(e => e.date === dateStr);
              const isToday = isSameDay(date, new Date());
              
              const isHoliday = activeCalendar?.holidays.find(h => h.date === dateStr);
              const isOutOfCycle = activeCalendar ? (dateStr < activeCalendar.startDate || dateStr > activeCalendar.endDate) : false;
              
              const inlineStyle = (!isOutOfCycle && !isHoliday && !isToday && activeCalendar?.cycleColor) 
                ? { backgroundColor: activeCalendar.cycleColor } 
                : {};

              return (
                <div 
                  key={dateStr} 
                  onClick={() => openAddModal(date)}
                  style={inlineStyle}
                  className={`min-h-[120px] p-2 border-b border-r border-slate-100 cursor-pointer transition-all relative group
                    ${isOutOfCycle ? 'bg-slate-100/50 opacity-60' : 'hover:brightness-95'}
                    ${isToday && !isOutOfCycle ? 'bg-white ring-2 ring-inset ring-indigo-500 shadow-sm z-10' : ''}
                    ${isHoliday ? 'bg-rose-50/80' : ''}
                    ${!isOutOfCycle && !isHoliday && !activeCalendar?.cycleColor ? 'hover:bg-indigo-50/30' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                      ${isToday && !isOutOfCycle ? 'bg-indigo-600 text-white shadow-sm' : isHoliday ? 'text-rose-600' : 'text-slate-600 group-hover:text-indigo-600'}
                    `}>
                      {format(date, "d")}
                    </span>
                    {!isOutOfCycle && <Plus className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </div>
                  
                  <div className="mt-2 flex flex-col gap-1">
                    {isHoliday && (
                      <div className="text-[10px] sm:text-xs px-2 py-1 rounded border bg-rose-100 text-rose-700 border-rose-200 font-semibold truncate" title={isHoliday.name}>
                        {isHoliday.name}
                      </div>
                    )}
                    
                    {dayEvents.map(event => (
                      <div 
                        key={event.id} 
                        onClick={(e) => openEditModal(event, e)}
                        className={`text-[10px] sm:text-xs px-2 py-1.5 rounded truncate transition-colors border
                          ${event.alert 
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                          }
                        `}
                        title={event.title}
                      >
                        <div className="flex items-center font-medium">
                          {event.alert && <Bell className="mr-1 h-3 w-3 inline" />}
                          {event.time} - {event.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
