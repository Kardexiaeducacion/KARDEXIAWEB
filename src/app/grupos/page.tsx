"use client";

import { useState } from "react";
import { useAppContext, Group } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, School, GraduationCap, Calendar, Plus, Edit2, Trash2 } from "lucide-react";

export default function Grupos() {
  const { groups, addGroup, updateGroup, deleteGroup, activeGroupId, setActiveGroupId } = useAppContext();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState("");
  
  const [formData, setFormData] = useState<Partial<Group>>({
    name: "",
    school: "",
    grade: "",
    groupName: "",
    academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
    subjects: []
  });

  const handleOpenDialog = (group?: Group) => {
    if (group) {
      setEditingGroupId(group.id);
      setFormData({ ...group });
    } else {
      setEditingGroupId(null);
      setFormData({
        name: "",
        school: "",
        grade: "",
        groupName: "",
        academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
        subjects: []
      });
    }
    setNewSubject("");
    setIsDialogOpen(true);
  };

  const handleAddSubject = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    const subjectName = newSubject.trim();
    if (!subjectName) return;
    setFormData(prev => ({
      ...prev,
      subjects: [...(prev.subjects || []), { id: Date.now().toString(), name: subjectName }]
    }));
    setNewSubject("");
  };

  const handleRemoveSubject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: (prev.subjects || []).filter(s => s.id !== id)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingGroupId) {
      updateGroup(editingGroupId, formData);
    } else {
      addGroup(formData as Omit<Group, "id">);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (groups.length <= 1) {
      alert("No puedes eliminar el único grupo existente.");
      return;
    }
    if (confirm("¿Estás seguro de que deseas eliminar este grupo? También se perderá el acceso a los alumnos asociados, aunque seguirán en la base de datos si no los eliminas.")) {
      deleteGroup(id);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Users className="mr-3 h-6 w-6 text-indigo-600" />
            Gestión de Grupos
          </h2>
          <p className="text-slate-500 mt-1">Configura y administra tus grupos escolares y su información.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={() => handleOpenDialog()} />}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Grupo
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingGroupId ? "Editar Grupo" : "Agregar Nuevo Grupo"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Corto del Grupo (Obligatorio)</Label>
                <Input 
                  id="name" required placeholder="Ej. 6to A, 3er Semestre..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">Escuela / Institución</Label>
                <Input 
                  id="school" placeholder="Nombre de la escuela"
                  value={formData.school || ""}
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grado</Label>
                  <Input 
                    id="grade" placeholder="Ej. 6to"
                    value={formData.grade || ""}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groupName">Sección / Letra</Label>
                  <Input 
                    id="groupName" placeholder="Ej. A"
                    value={formData.groupName || ""}
                    onChange={(e) => setFormData({...formData, groupName: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Ciclo Escolar</Label>
                <Input 
                  id="academicYear" placeholder="Ej. 2023-2024"
                  value={formData.academicYear || ""}
                  onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Label className="mb-2 block">Materias / Asignaturas (Opcional)</Label>
                <div className="flex gap-2 mb-3">
                  <Input 
                    placeholder="Ej. Matemáticas" 
                    value={newSubject} 
                    onChange={(e) => setNewSubject(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSubject(e); }}
                  />
                  <Button type="button" onClick={(e) => handleAddSubject(e)} variant="secondary">Agregar</Button>
                </div>
                <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2">
                  {(formData.subjects || []).length > 0 ? (
                    formData.subjects?.map(subject => (
                      <div key={subject.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-sm font-medium text-slate-700">{subject.name}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => handleRemoveSubject(subject.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No hay materias asignadas a este grupo.</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2">
                Guardar Grupo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <Card key={group.id} className={`overflow-hidden transition-all duration-200 hover:shadow-md ${activeGroupId === group.id ? 'ring-2 ring-indigo-500 border-transparent' : 'border-slate-200'}`}>
            <CardHeader className={`${activeGroupId === group.id ? 'bg-indigo-50/50' : 'bg-slate-50/50'} border-b border-slate-100 pb-4`}>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-slate-800">{group.name}</CardTitle>
                  {activeGroupId === group.id && (
                    <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Grupo Activo
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => handleOpenDialog(group)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDelete(group.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center text-sm text-slate-600">
                <School className="mr-3 h-4 w-4 text-slate-400" />
                <span className="font-medium mr-1">Escuela:</span> {group.school || "No especificada"}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <GraduationCap className="mr-3 h-4 w-4 text-slate-400" />
                <span className="font-medium mr-1">Grado y Grupo:</span> {group.grade || "-"} {group.groupName || "-"}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="mr-3 h-4 w-4 text-slate-400" />
                <span className="font-medium mr-1">Ciclo Escolar:</span> {group.academicYear || "No especificado"}
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3">
                {group.subjects && group.subjects.length > 0 ? (
                  group.subjects.map(subj => (
                    <span key={subj.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {subj.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Sin materias configuradas</span>
                )}
              </div>
              
              <div className="pt-4 mt-2 border-t border-slate-100">
                {activeGroupId !== group.id ? (
                  <Button 
                    variant="outline" 
                    className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    onClick={() => setActiveGroupId(group.id)}
                  >
                    Establecer como Activo
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    className="w-full bg-slate-100 text-slate-500 cursor-default hover:bg-slate-100"
                  >
                    Actualmente Viendo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
