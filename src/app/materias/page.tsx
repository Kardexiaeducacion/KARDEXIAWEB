"use client";

import { useState } from "react";
import { useAppContext, Group } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Trash2, Library } from "lucide-react";

export default function Materias() {
  const { groups, activeGroupId, updateGroup } = useAppContext();
  const activeGroup = groups.find(g => g.id === activeGroupId);

  const [newSubject, setNewSubject] = useState("");

  const handleAddSubject = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    const subjectName = newSubject.trim();
    if (!subjectName || !activeGroup) return;

    const currentSubjects = activeGroup.subjects || [];
    if (currentSubjects.some(s => s.name.toLowerCase() === subjectName.toLowerCase())) {
      alert("Ya existe una materia con este nombre.");
      return;
    }

    const updatedSubjects = [...currentSubjects, { id: Date.now().toString(), name: subjectName }];
    updateGroup(activeGroupId, { subjects: updatedSubjects });
    setNewSubject("");
  };

  const handleRemoveSubject = (id: string) => {
    if (!activeGroup) return;
    if (confirm("¿Estás seguro de que deseas eliminar esta materia? No afectará a las calificaciones ya guardadas, pero ya no aparecerá en el menú.")) {
      const updatedSubjects = (activeGroup.subjects || []).filter(s => s.id !== id);
      updateGroup(activeGroupId, { subjects: updatedSubjects });
    }
  };

  if (!activeGroup) return null;

  const currentSubjects = activeGroup.subjects || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <BookOpen className="mr-3 h-6 w-6 text-indigo-600" />
          Materias y Asignaturas
        </h2>
        <p className="text-slate-500 mt-1">
          Gestiona las materias para el grupo activo: <span className="font-bold text-indigo-600">{activeGroup.name}</span>.
          Cada materia que agregues se habilitará automáticamente en Tareas, Asistencia, Exámenes, Participación, Conducta y Calificaciones.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg text-slate-800">Agregar Nueva Materia</CardTitle>
          <CardDescription>
            Escribe el nombre de la materia y presiona Enter o haz clic en Agregar.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Library className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Ej. Matemáticas, Español, Historia..." 
                className="pl-10"
                value={newSubject} 
                onChange={(e) => setNewSubject(e.target.value)} 
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubject(e) }}
              />
            </div>
            <Button type="button" onClick={(e) => handleAddSubject(e)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="mr-2 h-4 w-4" /> Agregar Materia
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSubjects.length > 0 ? (
          currentSubjects.map(subject => (
            <Card key={subject.id} className="border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all group">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-slate-700 line-clamp-1">{subject.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveSubject(subject.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Library className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-800 mb-1">Sin materias agregadas</h3>
            <p className="text-slate-500">
              Usa el formulario de arriba para agregar las materias de {activeGroup.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
