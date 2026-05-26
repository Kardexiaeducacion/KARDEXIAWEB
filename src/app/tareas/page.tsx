"use client";

import { useState } from "react";
import { useAppContext, TaskRecord, TaskSubmission } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Plus, Upload, FileText, CheckCircle, Clock, Trash2, Search, Edit2 } from "lucide-react";

export default function Tareas() {
  const { students, groups, activeGroupId, tasks, addTask, updateTask, deleteTask, taskSubmissions, addOrUpdateSubmission } = useAppContext();
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const activeStudents = students.filter(s => s.groupId === activeGroupId).sort((a, b) => a.name.localeCompare(b.name));
  
  const [activeSubjectId, setActiveSubjectId] = useState<string>("general");
  const [activeMonth, setActiveMonth] = useState<string>(""); // "" means all dates
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskRecord | null>(null);
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    weight: 0,
    subjectId: ""
  });

  // Filter tasks by active group, active subject and active month
  const activeTasks = tasks.filter(t => {
    if (t.groupId !== activeGroupId) return false;
    if (activeSubjectId !== "general" && t.subjectId !== activeSubjectId) return false;
    if (activeMonth && !t.dueDate.startsWith(activeMonth)) return false;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || (!newTask.subjectId && activeGroup?.subjects?.length)) {
      alert("Por favor, asigna una materia a la tarea.");
      return;
    }
    
    addTask({
      groupId: activeGroupId,
      subjectId: newTask.subjectId || undefined,
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      status: "Activa",
      weight: newTask.weight
    });
    
    setIsAddOpen(false);
    setNewTask({ title: "", description: "", dueDate: new Date().toISOString().split("T")[0], weight: 0, subjectId: "" });
  };

  const compressAndUploadFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
        if (file.type === "application/pdf") {
          resolve(event.target?.result as string);
          return;
        }
        
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = error => reject(error);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (taskId: string, studentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Data = await compressAndUploadFile(file);
      const existingSub = taskSubmissions.find(s => s.taskId === taskId && s.studentId === studentId);
      
      addOrUpdateSubmission({
        taskId,
        studentId,
        fileData: base64Data,
        fileName: file.name,
        status: "Entregada",
        grade: existingSub?.grade,
        comments: existingSub?.comments
      });
    } catch (err) {
      console.error("Error al comprimir archivo", err);
      alert("Hubo un error al procesar el archivo. Intenta con uno más pequeño.");
    }
  };

  const updateSubmissionData = (taskId: string, studentId: string, updates: Partial<TaskSubmission>) => {
    const existingSub = taskSubmissions.find(s => s.taskId === taskId && s.studentId === studentId);
    addOrUpdateSubmission({
      taskId,
      studentId,
      status: existingSub?.status || "Pendiente",
      fileData: existingSub?.fileData,
      fileName: existingSub?.fileName,
      grade: existingSub?.grade,
      comments: existingSub?.comments,
      ...updates
    });
  };

  // Calculate statistics
  const totalPossibleSubmissions = activeTasks.length * activeStudents.length;
  const completedSubmissions = taskSubmissions.filter(s => activeTasks.some(t => t.id === s.taskId) && s.status === "Entregada").length;
  const globalRate = totalPossibleSubmissions === 0 ? 0 : Math.round((completedSubmissions / totalPossibleSubmissions) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tareas y Actividades</h2>
          <p className="text-slate-500 text-sm mt-1">Gestor de entregas y expedientes de evidencia</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {activeGroup?.subjects && activeGroup.subjects.length > 0 && (
            <Select value={activeSubjectId} onValueChange={setActiveSubjectId}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200">
                <SelectValue placeholder="Materia...">
                  {activeSubjectId === "general" ? "Tareas Generales" : activeGroup.subjects.find(s => s.id === activeSubjectId)?.name || "Materia..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Tareas Generales</SelectItem>
                {activeGroup.subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
             <Clock className="h-4 w-4 text-slate-400 ml-2 mr-1" />
             <input 
              type="month" 
              className="border-none bg-transparent text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer p-1 outline-none"
              value={activeMonth}
              onChange={(e) => setActiveMonth(e.target.value)}
              title="Filtrar por mes"
             />
             {activeMonth && (
               <button onClick={() => setActiveMonth("")} className="mr-2 text-slate-400 hover:text-red-500">
                 <Trash2 className="h-3 w-3" />
               </button>
             )}
          </div>

          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (open) setNewTask(prev => ({...prev, subjectId: activeSubjectId !== "general" ? activeSubjectId : ""}));
          }}>
            <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" /> Nueva Tarea
            </Button>} />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Asignar Nueva Tarea</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Título de la Actividad</Label>
                  <Input required placeholder="Ej. Ensayo sobre la Revolución" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                </div>
                {activeGroup?.subjects && activeGroup.subjects.length > 0 && (
                  <div className="space-y-2">
                    <Label>Materia</Label>
                    <Select value={newTask.subjectId || ""} onValueChange={(v) => setNewTask({...newTask, subjectId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una materia" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeGroup.subjects.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Descripción / Instrucciones</Label>
                  <Textarea placeholder="Detalles de lo que el alumno debe entregar..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Valor en Porcentaje (%)</Label>
                  <Input type="number" min="0" max="100" required placeholder="Ej. 20" value={newTask.weight || ""} onChange={e => setNewTask({...newTask, weight: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Entrega</Label>
                  <Input type="date" required value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Crear Tarea</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Lista de Tareas</CardTitle>
            </CardHeader>
            <CardContent>
              {activeTasks.length > 0 ? (
                <div className="space-y-3">
                  {activeTasks.map(task => {
                    const taskSubs = taskSubmissions.filter(s => s.taskId === task.id && s.status === "Entregada");
                    const progress = activeStudents.length === 0 ? 0 : Math.round((taskSubs.length / activeStudents.length) * 100);
                    
                    return (
                      <Dialog key={task.id} onOpenChange={(open) => { if(open) setActiveTask(task); else setActiveTask(null); }}>
                        <DialogTrigger render={<div role="button" tabIndex={0} className="w-full text-left border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer group focus:outline-none" />}>
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-800">{task.title}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  task.status === 'Activa' ? 'bg-emerald-100 text-emerald-700' :
                                  task.status === 'Revisión' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {task.status}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500 line-clamp-1">{task.description || "Sin descripción"}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> Vence: {task.dueDate.split("-").reverse().join("/")}</span>
                                {task.weight !== undefined && (
                                  <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Valor: {task.weight}%</span>
                                )}
                                <span className="flex items-center"><FileText className="h-3 w-3 mr-1" /> Entregas: {taskSubs.length}/{activeStudents.length}</span>
                              </div>
                            </div>
                            
                            <div className="w-full sm:w-32 flex flex-col gap-1 items-end">
                              <span className="text-xs font-bold text-indigo-600">{progress}% Completado</span>
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <div className="flex justify-between items-start pr-6">
                              <div>
                                <DialogTitle className="text-xl">{task.title}</DialogTitle>
                                <p className="text-sm text-slate-500 mt-1">Gestor de entregas y evidencias</p>
                              </div>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => deleteTask(task.id)}>
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </DialogHeader>
                          
                          <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader className="bg-slate-50">
                                <TableRow>
                                  <TableHead>Alumno</TableHead>
                                  <TableHead className="w-[140px]">Estado</TableHead>
                                  <TableHead className="w-[120px]">Calificación</TableHead>
                                  <TableHead className="w-[180px]">Evidencia (PDF/Foto)</TableHead>
                                  <TableHead>Observaciones</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {activeStudents.map(student => {
                                  const sub = taskSubmissions.find(s => s.taskId === task.id && s.studentId === student.id);
                                  const isDelivered = sub?.status === "Entregada";
                                  
                                  return (
                                    <TableRow key={student.id}>
                                      <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                                            {student.imageUrl ? (
                                              <img src={student.imageUrl} alt={student.name} className="h-full w-full object-cover" />
                                            ) : (
                                              <span className="text-xs font-bold text-slate-400">{student.avatar}</span>
                                            )}
                                          </div>
                                          <span className="text-sm text-slate-800 line-clamp-1">{student.name}</span>
                                        </div>
                                      </TableCell>
                                      
                                      <TableCell>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className={`w-full justify-start ${isDelivered ? 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
                                          onClick={() => updateSubmissionData(task.id, student.id, { status: isDelivered ? "Pendiente" : "Entregada" })}
                                        >
                                          <CheckCircle className={`h-4 w-4 mr-2 ${isDelivered ? 'fill-emerald-200' : ''}`} />
                                          {isDelivered ? 'Entregado' : 'Pendiente'}
                                        </Button>
                                      </TableCell>
                                      
                                      <TableCell>
                                        <Input 
                                          type="number" 
                                          min="0" max="10" step="0.1"
                                          placeholder="-"
                                          className="h-8 w-full text-center"
                                          value={sub?.grade || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            updateSubmissionData(task.id, student.id, { grade: val ? parseFloat(val) : undefined, status: "Entregada" });
                                          }}
                                        />
                                      </TableCell>

                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <div className="relative flex-1">
                                            <input 
                                              type="file" 
                                              id={`file-${task.id}-${student.id}`} 
                                              className="hidden" 
                                              accept="image/*,application/pdf"
                                              onChange={(e) => handleFileUpload(task.id, student.id, e)}
                                            />
                                            <label 
                                              htmlFor={`file-${task.id}-${student.id}`}
                                              className="flex items-center justify-center h-8 px-2 w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded text-slate-600 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                            >
                                              <Upload className="h-3 w-3 mr-1" /> 
                                              {sub?.fileName ? 'Reemplazar' : 'Subir'}
                                            </label>
                                          </div>
                                          
                                          {sub?.fileData && (
                                            <Dialog>
                                              <DialogTrigger render={<Button size="icon" variant="outline" className="h-8 w-8 shrink-0 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100" />}>
                                                <Search className="h-4 w-4" />
                                              </DialogTrigger>
                                              <DialogContent className="sm:max-w-[800px]">
                                                <DialogHeader>
                                                  <DialogTitle>Evidencia: {student.name}</DialogTitle>
                                                  <p className="text-sm text-slate-500">{sub.fileName}</p>
                                                </DialogHeader>
                                                <div className="mt-4 flex justify-center bg-slate-100 rounded-lg p-2 min-h-[400px]">
                                                  {sub.fileData.startsWith("data:application/pdf") ? (
                                                    <iframe src={sub.fileData} className="w-full h-[60vh] rounded" />
                                                  ) : (
                                                    <img src={sub.fileData} alt="Evidencia" className="max-w-full max-h-[70vh] object-contain rounded" />
                                                  )}
                                                </div>
                                              </DialogContent>
                                            </Dialog>
                                          )}
                                        </div>
                                      </TableCell>

                                      <TableCell>
                                        <Input 
                                          placeholder="Nota opcional..."
                                          className="h-8 w-full text-xs"
                                          value={sub?.comments || ""}
                                          onChange={(e) => updateSubmissionData(task.id, student.id, { comments: e.target.value })}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                                {activeStudents.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                      No hay alumnos en este grupo.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </DialogContent>
                      </Dialog>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <CheckSquareIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-700">No hay tareas asignadas</h3>
                  <p className="text-sm text-slate-500 mt-1">Crea una nueva tarea para este grupo y materia.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acumulado del Alumno (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {activeStudents.map(student => {
                  let totalEarned = 0;
                  let totalPossible = 0;
                  
                  activeTasks.forEach(t => {
                    if (t.weight) {
                      totalPossible += t.weight;
                      const sub = taskSubmissions.find(s => s.taskId === t.id && s.studentId === student.id);
                      if (sub && sub.status === "Entregada" && sub.grade !== undefined) {
                        totalEarned += t.weight * (sub.grade / 10);
                      }
                    }
                  });
                  
                  const displayEarned = totalEarned.toFixed(1);

                  return (
                    <div key={student.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {student.imageUrl ? (
                            <img src={student.imageUrl} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">{student.avatar}</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-700 line-clamp-1">{student.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-indigo-700">{displayEarned}%</span>
                        <p className="text-[10px] text-slate-400">de {totalPossible}% posibles</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progreso General (Materia)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 border border-slate-100 rounded-xl bg-slate-50">
                <div className="text-5xl font-bold text-indigo-600 mb-2">
                  {globalRate}%
                </div>
                <p className="text-sm font-medium text-slate-600">Tasa de entrega global</p>
                <p className="text-xs text-slate-400 mt-1">{completedSubmissions} de {totalPossibleSubmissions} entregas</p>
              </div>
              
              <div className="mt-6 space-y-4 max-h-[300px] overflow-y-auto pr-2">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Top Alumnos Cumplidos</h4>
                {activeStudents.map(student => {
                  const studentSubs = taskSubmissions.filter(s => s.studentId === student.id && s.status === "Entregada" && activeTasks.some(t => t.id === s.taskId));
                  const percent = activeTasks.length === 0 ? 0 : Math.round((studentSubs.length / activeTasks.length) * 100);
                  
                  return (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {student.imageUrl ? (
                            <img src={student.imageUrl} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">{student.avatar}</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-700 line-clamp-1">{student.name}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${percent >= 80 ? 'bg-emerald-100 text-emerald-700' : percent >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CheckSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}
