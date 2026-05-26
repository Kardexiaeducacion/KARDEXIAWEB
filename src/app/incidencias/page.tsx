"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, AlertOctagon } from "lucide-react";

export default function Incidencias() {
  const { students, activeGroupId, incidents, addIncident } = useAppContext();
  const activeStudents = students.filter(s => s.groupId === activeGroupId);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    studentId: "",
    description: "",
    actionsTaken: "",
    witnesses: ""
  });

  const activeIncidents = incidents.filter(inc => inc.groupId === activeGroupId);

  const filteredIncidents = activeIncidents.filter(inc => {
    const student = activeStudents.find(s => s.id === inc.studentId);
    return (
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student && student.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.studentId || !newIncident.description) return;
    
    addIncident({
      groupId: activeGroupId,
      ...newIncident
    });
    
    setIsDialogOpen(false);
    setNewIncident({
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      studentId: "",
      description: "",
      actionsTaken: "",
      witnesses: ""
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-slate-500">Registro y seguimiento de incidencias de conducta o accidentes</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-red-600 hover:bg-red-700 text-white shadow-sm" />}>
            <Plus className="mr-2 h-4 w-4" /> Registrar Incidencia
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <AlertOctagon className="mr-2 h-5 w-5" /> Nueva Incidencia
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input 
                    id="date" type="date" required
                    value={newIncident.date}
                    onChange={(e) => setNewIncident({...newIncident, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input 
                    id="time" type="time" required
                    value={newIncident.time}
                    onChange={(e) => setNewIncident({...newIncident, time: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Alumno Involucrado</Label>
                <Select required value={newIncident.studentId} onValueChange={(val) => setNewIncident({...newIncident, studentId: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar alumno..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeStudents.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Descripción Detallada</Label>
                <Textarea 
                  id="desc" required placeholder="¿Qué sucedió?"
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actions">Acciones Tomadas</Label>
                <Textarea 
                  id="actions" placeholder="¿Qué medidas se aplicaron?"
                  value={newIncident.actionsTaken}
                  onChange={(e) => setNewIncident({...newIncident, actionsTaken: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="witnesses">Testigos (Opcional)</Label>
                <Input 
                  id="witnesses" placeholder="Maestros, prefectos o alumnos..."
                  value={newIncident.witnesses}
                  onChange={(e) => setNewIncident({...newIncident, witnesses: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Guardar Registro</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por alumno o descripción..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map(incident => {
            const student = activeStudents.find(s => s.id === incident.studentId);
            return (
              <Card key={incident.id} className="border-l-4 border-l-red-500 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-slate-50 p-4 md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
                      <p className="font-bold text-slate-700">{incident.date.split("-").reverse().join("/")}</p>
                      <p className="text-sm text-slate-500 mb-2">{incident.time}</p>
                      <div className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded mt-auto w-fit">
                        Incidencia
                      </div>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-700 overflow-hidden border border-slate-300">
                          {student?.imageUrl ? (
                            <img src={student.imageUrl} alt={student?.name} className="h-full w-full object-cover" />
                          ) : (
                            <span>{student?.avatar}</span>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-800">{student?.name}</h4>
                      </div>
                      <p className="text-slate-700 text-sm mb-4 leading-relaxed">{incident.description}</p>
                      
                      <div className="bg-slate-50 p-3 rounded-md text-sm border border-slate-100">
                        <span className="font-semibold text-slate-800">Acciones Tomadas:</span>
                        <p className="text-slate-600 mt-1">{incident.actionsTaken || "Ninguna especificada."}</p>
                      </div>
                      
                      {incident.witnesses && (
                        <p className="text-xs text-slate-500 mt-3 flex items-center">
                          <span className="font-semibold mr-1">Testigos:</span> {incident.witnesses}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <AlertOctagon className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No se encontraron incidencias.</p>
          </div>
        )}
      </div>
    </div>
  );
}
