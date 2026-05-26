"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Edit3, CheckCircle, XCircle } from "lucide-react";

export default function Reuniones() {
  const { students, activeGroupId, meetings, addMeeting, updateMeeting } = useAppContext();
  const activeStudents = students.filter(s => s.groupId === activeGroupId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    tutor: "",
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
    reason: "",
    status: "Programada",
    agreements: ""
  });

  const [activeTab, setActiveTab] = useState<"Programada" | "Completada" | "Cancelada">("Programada");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.tutor || !newMeeting.reason) return;
    
    addMeeting({
      groupId: activeGroupId,
      ...newMeeting
    });
    
    setIsDialogOpen(false);
    setNewMeeting({
      tutor: "",
      date: new Date().toISOString().split("T")[0],
      time: "12:00",
      reason: "",
      status: "Programada",
      agreements: ""
    });
  };

  const handleStatusChange = (id: string, status: "Programada" | "Completada" | "Cancelada") => {
    updateMeeting(id, { status });
  };

  const handleAgreementsChange = (id: string, agreements: string) => {
    updateMeeting(id, { agreements });
  };

  const activeMeetings = meetings.filter(m => m.groupId === activeGroupId);
  const filteredMeetings = activeMeetings.filter(m => m.status === activeTab);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-slate-500">Gestión de citas y acuerdos con padres de familia</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" />}>
            Programar Reunión
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Cita con Tutor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Padre o Tutor</Label>
                <Select required value={newMeeting.tutor} onValueChange={(val) => setNewMeeting({...newMeeting, tutor: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tutor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeStudents.map(s => (
                      <SelectItem key={s.id} value={s.tutor.name}>{s.tutor.name} (Tutor de {s.name})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input 
                    type="date" required
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora</Label>
                  <Input 
                    type="time" required
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Motivo de la Reunión</Label>
                <Textarea 
                  required placeholder="Ej. Bajo rendimiento, comportamiento..."
                  value={newMeeting.reason}
                  onChange={(e) => setNewMeeting({...newMeeting, reason: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Guardar Cita</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-full sm:w-fit">
        {(["Programada", "Completada", "Cancelada"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab 
                ? "bg-white text-indigo-700 shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab}
            <span className="ml-2 bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-xs">
              {activeMeetings.filter(m => m.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map(meeting => (
            <Card key={meeting.id} className="overflow-hidden border-slate-200 shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="bg-slate-50 p-4 md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="flex items-center text-slate-700 font-medium mb-2">
                      <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                      {meeting.date.split("-").reverse().join("/")}
                    </div>
                    <div className="flex items-center text-slate-600 text-sm mb-4">
                      <Clock className="mr-2 h-4 w-4 text-slate-400" />
                      {meeting.time} Hrs.
                    </div>
                    
                    {meeting.status === "Programada" && (
                      <div className="flex flex-col gap-2 mt-4">
                        <Button size="sm" variant="outline" className="w-full text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" onClick={() => handleStatusChange(meeting.id, "Completada")}>
                          <CheckCircle className="mr-2 h-3 w-3" /> Marcar Completada
                        </Button>
                        <Button size="sm" variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleStatusChange(meeting.id, "Cancelada")}>
                          <XCircle className="mr-2 h-3 w-3" /> Cancelar Cita
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">{meeting.tutor}</h3>
                    <p className="text-slate-600 mt-2"><span className="font-medium">Motivo:</span> {meeting.reason}</p>
                    
                    {meeting.status !== "Cancelada" && (
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-slate-700 flex items-center mb-3">
                          <Edit3 className="mr-2 h-4 w-4" /> Acuerdos Tomados
                        </h4>
                        <Textarea 
                          placeholder="Documenta aquí los compromisos después de la reunión..."
                          className="bg-slate-50 min-h-[100px]"
                          value={meeting.agreements}
                          onChange={(e) => handleAgreementsChange(meeting.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No hay reuniones en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  );
}
