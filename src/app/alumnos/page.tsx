"use client";

import { useState, useRef } from "react";
import { useAppContext, Student } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Camera, Search, UserCircle2, Edit2, Save, X } from "lucide-react";

export default function Alumnos() {
  const { students, groups, activeGroupId, addStudent, deleteStudent, updateStudent, attendanceHistory } = useAppContext();
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    name: "",
    avatar: "",
    imageUrl: "",
    tutorName: "",
    tutorPhone: "",
    tutorEmail: "",
    listNumber: 0,
    gender: "M" as "M" | "F" | "Otro"
  });

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    listNumber: 0,
    gender: "M" as "M" | "F" | "Otro",
    tutorName: "",
    tutorPhone: "",
    tutorEmail: "",
    subjectGrades: {} as Record<string, { exam: number; project: number; tasks: number }>
  });

  const getSubjectAbsences = (studentId: string, subjectId: string) => {
    return attendanceHistory.filter(a => a.studentId === studentId && a.subjectId === subjectId && a.status === "Ausente").length;
  };

  const activeStudents = students.filter(s => s.groupId === activeGroupId && 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, studentId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (studentId) {
          updateStudent(studentId, { imageUrl: base64String });
        } else {
          setNewStudent({ ...newStudent, imageUrl: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name) return;

    // Generate initials for avatar
    const initials = newStudent.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

    addStudent({
      groupId: activeGroupId,
      name: newStudent.name,
      avatar: initials,
      imageUrl: newStudent.imageUrl,
      tutor: {
        name: newStudent.tutorName,
        phone: newStudent.tutorPhone,
        email: newStudent.tutorEmail
      },
      grades: { exam: 0, project: 0, tasks: 0 },
      participation: 0,
      tasksCompleted: 0,
      tasksAssigned: 0,
      listNumber: newStudent.listNumber || students.filter(s => s.groupId === activeGroupId).length + 1,
      gender: newStudent.gender,
      subjectGrades: {},
      observations: { strengths: "", areasToImprove: "", suggestions: "" }
    });

    setIsAddOpen(false);
    setNewStudent({ name: "", avatar: "", imageUrl: "", tutorName: "", tutorPhone: "", tutorEmail: "", listNumber: 0, gender: "M" });
  };

  const startEditing = (student: Student) => {
    setEditingStudentId(student.id);
    setEditForm({
      name: student.name,
      listNumber: student.listNumber || 0,
      gender: student.gender || "M",
      tutorName: student.tutor.name,
      tutorPhone: student.tutor.phone,
      tutorEmail: student.tutor.email,
      subjectGrades: student.subjectGrades || {}
    });
  };

  const saveEditing = (studentId: string) => {
    updateStudent(studentId, {
      name: editForm.name,
      listNumber: editForm.listNumber,
      gender: editForm.gender,
      tutor: {
        name: editForm.tutorName,
        phone: editForm.tutorPhone,
        email: editForm.tutorEmail
      },
      subjectGrades: editForm.subjectGrades
    });
    setEditingStudentId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Directorio de Alumnos</h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona los miembros de la clase actual</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" />}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Alumno
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Alumno</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
                    {newStudent.imageUrl ? (
                      <img src={newStudent.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" id="photo-upload" onChange={(e) => handleImageUpload(e)} />
                  <label htmlFor="photo-upload" className="absolute bottom-0 right-0 h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-indigo-700 shadow-sm border-2 border-white">
                    <Plus className="h-4 w-4" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo del Alumno</Label>
                <Input id="name" required value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="Ej. Juan Pérez" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="listNumber">Número de Lista</Label>
                  <Input id="listNumber" type="number" min="1" value={newStudent.listNumber || ""} onChange={(e) => setNewStudent({...newStudent, listNumber: parseInt(e.target.value) || 0})} placeholder="Automático" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  <select 
                    id="gender" 
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newStudent.gender} 
                    onChange={(e) => setNewStudent({...newStudent, gender: e.target.value as any})}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold mb-3 text-slate-700">Datos del Tutor</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tutorName">Nombre del Padre/Tutor</Label>
                    <Input id="tutorName" required value={newStudent.tutorName} onChange={(e) => setNewStudent({...newStudent, tutorName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" value={newStudent.tutorPhone} onChange={(e) => setNewStudent({...newStudent, tutorPhone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={newStudent.tutorEmail} onChange={(e) => setNewStudent({...newStudent, tutorEmail: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 mt-4">Guardar Registro</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar alumno por nombre..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {activeStudents.map(student => (
          <Dialog key={student.id} onOpenChange={(open) => { if(!open) setEditingStudentId(null); }}>
            <DialogTrigger render={<button type="button" className="text-left w-full h-full focus:outline-none cursor-pointer" />}>
              <Card className="hover:shadow-md transition-shadow border-slate-200 group h-full">
                <CardContent className="p-6 flex flex-col items-center text-center relative">
                <div className="h-20 w-20 rounded-full bg-indigo-50 border border-indigo-100 mb-4 overflow-hidden flex items-center justify-center">
                  {student.imageUrl ? (
                    <img src={student.imageUrl} alt={student.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-indigo-600">{student.avatar}</span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-800 line-clamp-1">{student.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Tutor: {student.tutor.name.split(' ')[0]}</p>
                
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); deleteStudent(student.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              </Card>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex justify-between items-center pr-6">
                  <DialogTitle>{editingStudentId === student.id ? "Editar Alumno" : "Perfil del Alumno"}</DialogTitle>
                  {editingStudentId !== student.id && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600" onClick={() => startEditing(student)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </DialogHeader>

              {editingStudentId === student.id ? (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nombre Completo</Label>
                    <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nº Lista</Label>
                      <Input type="number" min="1" value={editForm.listNumber || ""} onChange={(e) => setEditForm({...editForm, listNumber: parseInt(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Género</Label>
                      <select 
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm"
                        value={editForm.gender} 
                        onChange={(e) => setEditForm({...editForm, gender: e.target.value as any})}
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <Label className="mb-2 block text-slate-700">Datos del Tutor</Label>
                    <div className="space-y-3">
                      <Input placeholder="Nombre" value={editForm.tutorName} onChange={(e) => setEditForm({...editForm, tutorName: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Teléfono" value={editForm.tutorPhone} onChange={(e) => setEditForm({...editForm, tutorPhone: e.target.value})} />
                        <Input placeholder="Email" type="email" value={editForm.tutorEmail} onChange={(e) => setEditForm({...editForm, tutorEmail: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  {/* Edición de Materias */}
                  {activeGroup?.subjects && activeGroup.subjects.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <Label className="mb-2 block text-slate-700">Calificaciones por Materia (0-10)</Label>
                      <div className="space-y-4">
                        {activeGroup.subjects.map(subj => {
                          const sg = editForm.subjectGrades[subj.id] || { exam: 0, project: 0, tasks: 0 };
                          return (
                            <div key={subj.id} className="bg-slate-50 p-3 rounded border border-slate-100">
                              <span className="font-semibold text-sm text-slate-700 block mb-2">{subj.name}</span>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <span className="text-xs text-slate-500 mb-1 block">Examen</span>
                                  <Input type="number" step="0.1" min="0" max="10" className="h-8 text-sm" value={sg.exam || ""} onChange={(e) => setEditForm({
                                    ...editForm,
                                    subjectGrades: { ...editForm.subjectGrades, [subj.id]: { ...sg, exam: parseFloat(e.target.value) || 0 } }
                                  })} />
                                </div>
                                <div>
                                  <span className="text-xs text-slate-500 mb-1 block">Proyecto</span>
                                  <Input type="number" step="0.1" min="0" max="10" className="h-8 text-sm" value={sg.project || ""} onChange={(e) => setEditForm({
                                    ...editForm,
                                    subjectGrades: { ...editForm.subjectGrades, [subj.id]: { ...sg, project: parseFloat(e.target.value) || 0 } }
                                  })} />
                                </div>
                                <div>
                                  <span className="text-xs text-slate-500 mb-1 block">Tareas</span>
                                  <Input type="number" step="0.1" min="0" max="10" className="h-8 text-sm" value={sg.tasks || ""} onChange={(e) => setEditForm({
                                    ...editForm,
                                    subjectGrades: { ...editForm.subjectGrades, [subj.id]: { ...sg, tasks: parseFloat(e.target.value) || 0 } }
                                  })} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="w-full" onClick={() => setEditingStudentId(null)}>Cancelar</Button>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => saveEditing(student.id)}>Guardar Cambios</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center py-4">
                    <div className="relative group/photo">
                      <div className="h-32 w-32 rounded-full border-4 border-slate-100 shadow-sm overflow-hidden bg-slate-50 flex items-center justify-center mb-4">
                        {student.imageUrl ? (
                          <img src={student.imageUrl} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          <UserCircle2 className="h-16 w-16 text-slate-300" />
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" id={`update-photo-${student.id}`} onChange={(e) => handleImageUpload(e, student.id)} />
                      <label htmlFor={`update-photo-${student.id}`} className="absolute bottom-4 right-0 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-indigo-700 shadow-md border-2 border-white opacity-0 group-hover/photo:opacity-100 transition-opacity">
                        <Camera className="h-5 w-5" />
                      </label>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                    <div className="flex gap-2 mt-1">
                      <span className="text-sm font-medium text-slate-500">Nº Lista: {student.listNumber || "-"}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm font-medium text-slate-500">Género: {student.gender === "M" ? "Masculino" : student.gender === "F" ? "Femenino" : student.gender || "Otro"}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">Promedio: {((student.grades.exam + student.grades.project + student.grades.tasks) / 3).toFixed(1)}</span>
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-semibold">Participaciones: {student.participation}</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3 text-sm">
                    <h4 className="font-semibold text-slate-700">Información de Contacto</h4>
                    <div className="grid grid-cols-[80px_1fr] gap-1">
                      <span className="text-slate-500">Tutor:</span>
                      <span className="font-medium text-slate-900">{student.tutor.name}</span>
                      <span className="text-slate-500">Teléfono:</span>
                      <span className="font-medium text-slate-900">{student.tutor.phone}</span>
                      <span className="text-slate-500">Email:</span>
                      <span className="font-medium text-slate-900">{student.tutor.email}</span>
                    </div>
                  </div>

                  {activeGroup?.subjects && activeGroup.subjects.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                      <h4 className="font-semibold text-slate-700">Rendimiento por Materia</h4>
                      <div className="space-y-3">
                        {activeGroup.subjects.map(subj => {
                          const sg = student.subjectGrades?.[subj.id] || { exam: 0, project: 0, tasks: 0 };
                          const average = ((sg.exam + sg.project + sg.tasks) / 3).toFixed(1);
                          const absences = getSubjectAbsences(student.id, subj.id);
                          return (
                            <div key={subj.id} className="bg-white p-3 rounded border border-slate-200">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-slate-800 text-sm">{subj.name}</span>
                                <div className="flex gap-2">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${parseFloat(average) >= 6 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    Promedio: {average}
                                  </span>
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${absences > 3 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                    Faltas: {absences}
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                                <div className="bg-slate-50 py-1 rounded">
                                  <span className="text-slate-500 block">Examen</span>
                                  <span className="font-medium text-slate-700">{sg.exam}</span>
                                </div>
                                <div className="bg-slate-50 py-1 rounded">
                                  <span className="text-slate-500 block">Proyecto</span>
                                  <span className="font-medium text-slate-700">{sg.project}</span>
                                </div>
                                <div className="bg-slate-50 py-1 rounded">
                                  <span className="text-slate-500 block">Tareas</span>
                                  <span className="font-medium text-slate-700">{sg.tasks}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(student.observations?.strengths || student.observations?.areasToImprove || student.observations?.suggestions) && (
                    <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 space-y-3">
                      <h4 className="font-semibold text-indigo-900">Observaciones del Trimestre</h4>
                      <div className="space-y-2 text-sm">
                        {student.observations.strengths && (
                          <div>
                            <span className="font-semibold text-emerald-700 block">Fortalezas:</span>
                            <span className="text-slate-700">{student.observations.strengths}</span>
                          </div>
                        )}
                        {student.observations.areasToImprove && (
                          <div>
                            <span className="font-semibold text-amber-700 block">Áreas de Oportunidad:</span>
                            <span className="text-slate-700">{student.observations.areasToImprove}</span>
                          </div>
                        )}
                        {student.observations.suggestions && (
                          <div>
                            <span className="font-semibold text-indigo-700 block">Sugerencias:</span>
                            <span className="text-slate-700">{student.observations.suggestions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <DialogFooter className="sm:justify-start pt-2">
                    <DialogClose render={
                      <Button type="button" variant="secondary">Cerrar</Button>
                    } />
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        ))}

        {activeStudents.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <UserCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No hay alumnos</h3>
            <p className="text-slate-500">Agrega alumnos a este grupo para comenzar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
