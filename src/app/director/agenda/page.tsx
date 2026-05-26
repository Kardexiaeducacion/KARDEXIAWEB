"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { useAppContext, EventRecord, SchoolCalendar } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Bell, Plus, Clock, AlignLeft, Trash2, Settings, CalendarIcon, Cake } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DirectorAgendaPage() {
  const { events, addEvent, updateEvent, deleteEvent, schoolCalendars, updateSchoolCalendar } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCycleOpen, setIsCycleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);

  const activeCalendar = schoolCalendars[0];
  const [newHoliday, setNewHoliday] = useState({ date: "", name: "" });

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00",
    description: "",
    alert: false,
    type: "event" as "event" | "birthday"
  });

  const activeEvents = events.filter(e => e.groupId === "director_global");

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
      groupId: "director_global",
      ...newEvent
    });
    
    setIsAddOpen(false);
    setNewEvent({ title: "", date: format(new Date(), "yyyy-MM-dd"), time: "10:00", description: "", alert: false, type: "event" });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editingEvent.title) return;
    
    updateEvent(editingEvent.id, {
      title: editingEvent.title,
      date: editingEvent.date,
      time: editingEvent.time,
      description: editingEvent.description,
      alert: editingEvent.alert,
      type: editingEvent.type
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Agenda Escolar</h2>
          <p className="text-slate-500 text-sm mt-1">Programa eventos institucionales y cumpleaños</p>
        </div>
        
        <div className="flex gap-2">
          {activeCalendar && (
            <Dialog open={isCycleOpen} onOpenChange={setIsCycleOpen}>
              <DialogTrigger render={<Button variant="outline" className="bg-white border-slate-200 text-slate-700" />}>
                <Settings className="mr-2 h-4 w-4" /> Configurar Ciclo
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
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
                <DialogTitle>Programar Evento o Cumpleaños</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Tipo de Registro</Label>
                  <Select value={newEvent.type} onValueChange={(v: "event" | "birthday") => setNewEvent({...newEvent, type: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="event">Evento / Reunión</SelectItem>
                      <SelectItem value="birthday">Cumpleaños</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">{newEvent.type === 'birthday' ? "Nombre del Cumpleañero" : "Título del Evento"}</Label>
                  <Input id="title" required value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} placeholder={newEvent.type === 'birthday' ? "Ej. Prof. Juan Pérez" : "Ej. Junta de Consejo"} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input id="date" type="date" required value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} />
                  </div>
                  {newEvent.type === 'event' && (
                    <div className="space-y-2">
                      <Label htmlFor="time">Hora</Label>
                      <Input id="time" type="time" required value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} />
                    </div>
                  )}
                </div>
                {newEvent.type === 'event' && (
                  <div className="space-y-2">
                    <Label htmlFor="desc">Descripción (Opcional)</Label>
                    <Textarea id="desc" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} />
                  </div>
                )}
                {newEvent.type === 'event' && (
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold text-slate-700">Activar Alerta</Label>
                      <p className="text-xs text-slate-500">Muestra un recordatorio visual destacado</p>
                    </div>
                    <Switch checked={newEvent.alert} onCheckedChange={(checked) => setNewEvent({...newEvent, alert: checked})} />
                  </div>
                )}
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Guardar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Modal de Edición */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent?.type === 'birthday' ? "Editar Cumpleaños" : "Detalles del Evento"}</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">{editingEvent.type === 'birthday' ? "Nombre" : "Título del Evento"}</Label>
                <Input id="edit-title" required value={editingEvent.title} onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Fecha</Label>
                  <Input id="edit-date" type="date" required value={editingEvent.date} onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})} />
                </div>
                {editingEvent.type === 'event' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-time">Hora</Label>
                    <Input id="edit-time" type="time" required value={editingEvent.time} onChange={(e) => setEditingEvent({...editingEvent, time: e.target.value})} />
                  </div>
                )}
              </div>
              {editingEvent.type === 'event' && (
                <>
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
                </>
              )}
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">Actualizar</Button>
                <Button type="button" variant="destructive" onClick={handleDelete} className="px-4"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white rounded-t-xl">
            <h3 className="text-lg font-bold text-slate-800 capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h3>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())} className="h-8">Hoy</Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 bg-slate-200 gap-[1px]">
            {blanks.map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[120px] bg-white p-2 opacity-50" />
            ))}
            
            {daysInMonth.map(date => {
              const dateStr = format(date, "yyyy-MM-dd");
              const dayEvents = activeEvents.filter(e => e.date === dateStr);
              const holiday = activeCalendar?.holidays.find(h => h.date === dateStr);
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, currentMonth);

              return (
                <div 
                  key={date.toString()} 
                  className={`min-h-[120px] bg-white p-2 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!isCurrentMonth ? 'opacity-50' : ''}`}
                  onClick={() => openAddModal(date)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${
                      isToday ? "bg-indigo-600 text-white" : "text-slate-700 group-hover:text-indigo-600"
                    }`}>
                      {format(date, "d")}
                    </span>
                    {holiday && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium truncate max-w-[70px]" title={holiday.name}>
                        {holiday.name}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div 
                        key={event.id}
                        onClick={(e) => openEditModal(event, e)}
                        className={`text-xs p-1.5 rounded-md truncate cursor-pointer transition-colors ${
                          event.type === 'birthday'
                            ? "bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200 border border-fuchsia-200 flex items-center gap-1 font-semibold"
                            : event.alert 
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200 font-medium" 
                              : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100"
                        }`}
                        title={event.title}
                      >
                        {event.type === 'birthday' ? <Cake className="w-3 h-3 shrink-0" /> : null}
                        {event.type === 'event' ? <span className="font-semibold mr-1">{event.time}</span> : null}
                        {event.title}
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
