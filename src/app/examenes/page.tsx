"use client";

import { useState } from "react";
import { useAppContext, ExamRecord, ExamSubmission } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Plus, Upload, CheckCircle, Clock, Trash2, Search, BookOpen, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

export default function Examenes() {
  const { students, groups, activeGroupId, exams, addExam, updateExam, deleteExam, examSubmissions, addOrUpdateExamSubmission } = useAppContext();
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const activeStudents = students.filter(s => s.groupId === activeGroupId).sort((a, b) => a.name.localeCompare(b.name));
  
  const [activeSubjectId, setActiveSubjectId] = useState<string>("general");
  const [activeMonth, setActiveMonth] = useState<string>(""); // "" means all dates
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeExam, setActiveExam] = useState<ExamRecord | null>(null);
  
  const [newExam, setNewExam] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    weight: 0,
    totalQuestions: 10
  });

  // Export states
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportType, setExportType] = useState<"todo" | "mes" | "semana">("todo");
  const [exportMonth, setExportMonth] = useState<string>(new Date().getMonth().toString());
  const [exportWeekStart, setExportWeekStart] = useState<string>("");
  const [exportWeekEnd, setExportWeekEnd] = useState<string>("");

  // Filter exams by active group, active subject and active month
  const activeExams = exams.filter(e => {
    if (e.groupId !== activeGroupId) return false;
    if (activeSubjectId !== "general" && e.subjectId !== activeSubjectId) return false;
    if (activeMonth && !e.date.startsWith(activeMonth)) return false;
    return true;
  });

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExam.title) return;
    
    addExam({
      groupId: activeGroupId,
      subjectId: activeSubjectId === "general" ? undefined : activeSubjectId,
      title: newExam.title,
      date: newExam.date,
      weight: newExam.weight,
      totalQuestions: newExam.totalQuestions
    });
    
    setIsAddOpen(false);
    setNewExam({ title: "", date: new Date().toISOString().split("T")[0], weight: 0, totalQuestions: 10 });
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

  const handleFileUpload = async (examId: string, studentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Data = await compressAndUploadFile(file);
      const existingSub = examSubmissions.find(s => s.examId === examId && s.studentId === studentId);
      
      addOrUpdateExamSubmission({
        examId,
        studentId,
        fileData: base64Data,
        fileName: file.name,
        correctAnswers: existingSub?.correctAnswers,
        comments: existingSub?.comments
      });
    } catch (err) {
      console.error("Error al comprimir archivo", err);
      alert("Hubo un error al procesar el archivo.");
    }
  };

  const updateSubmissionData = (examId: string, studentId: string, updates: Partial<ExamSubmission>) => {
    const existingSub = examSubmissions.find(s => s.examId === examId && s.studentId === studentId);
    addOrUpdateExamSubmission({
      examId,
      studentId,
      fileData: existingSub?.fileData,
      fileName: existingSub?.fileName,
      correctAnswers: existingSub?.correctAnswers,
      comments: existingSub?.comments,
      ...updates
    });
  };

  const handleExportExcel = () => {
    const filterByDate = (dateStr: string) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      if (exportType === "todo") return true;
      if (exportType === "mes") {
        return date.getMonth().toString() === exportMonth;
      }
      if (exportType === "semana" && exportWeekStart && exportWeekEnd) {
        return date >= new Date(exportWeekStart) && date <= new Date(exportWeekEnd);
      }
      return true;
    };

    const wb = XLSX.utils.book_new();
    const filteredExams = activeExams.filter(e => filterByDate(e.date));

    if (filteredExams.length === 0) {
      alert("No hay exámenes en el rango de fechas seleccionado.");
      return;
    }

    const examsData = activeStudents.map(student => {
      const row: any = { "Nombre del Alumno": student.name };
      filteredExams.forEach(exam => {
        const sub = examSubmissions.find(s => s.examId === exam.id && s.studentId === student.id);
        if (sub?.correctAnswers !== undefined) {
          row[exam.title] = `${((sub.correctAnswers / exam.totalQuestions) * 10).toFixed(1)} (${sub.correctAnswers}/${exam.totalQuestions})`;
        } else {
          row[exam.title] = "Sin calificar";
        }
      });
      return row;
    });

    const wsExams = XLSX.utils.json_to_sheet(examsData);
    XLSX.utils.book_append_sheet(wb, wsExams, "Exámenes");

    const fileName = `Examenes_${activeGroup?.name}_${exportType}.xlsx`;
    XLSX.writeFile(wb, fileName);
    setIsExportOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Evaluaciones y Exámenes</h2>
          <p className="text-slate-500 text-sm mt-1">Gestión de aciertos, calificaciones y evidencias</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {activeGroup?.subjects && activeGroup.subjects.length > 0 && (
            <Select value={activeSubjectId} onValueChange={setActiveSubjectId}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200">
                <SelectValue placeholder="Materia...">
                  {activeSubjectId === "general" ? "Exámenes Generales" : activeGroup.subjects.find(s => s.id === activeSubjectId)?.name || "Materia..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Exámenes Generales</SelectItem>
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

          <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
            <DialogTrigger render={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar a Excel
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Exportar Exámenes a Excel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Rango de Tiempo</Label>
                  <Select value={exportType} onValueChange={(v: any) => setExportType(v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona el rango" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Todo el ciclo escolar</SelectItem>
                      <SelectItem value="mes">Por Mes</SelectItem>
                      <SelectItem value="semana">Por Semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {exportType === "mes" && (
                  <div className="space-y-2">
                    <Label>Seleccionar Mes</Label>
                    <Select value={exportMonth} onValueChange={setExportMonth}>
                      <SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger>
                      <SelectContent>
                        {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => (
                          <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {exportType === "semana" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Desde</Label><Input type="date" value={exportWeekStart} onChange={(e) => setExportWeekStart(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Hasta</Label><Input type="date" value={exportWeekEnd} onChange={(e) => setExportWeekEnd(e.target.value)} /></div>
                  </div>
                )}

                <Button onClick={handleExportExcel} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2">
                  <Download className="mr-2 h-4 w-4" /> Generar Documento
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700" />}>
              <Plus className="h-4 w-4 mr-2" /> Nuevo Examen
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Evaluación</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateExam} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Título del Examen</Label>
                  <Input required placeholder="Ej. Examen de Medio Curso" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Aciertos Totales</Label>
                    <Input type="number" min="1" required value={newExam.totalQuestions || ""} onChange={e => setNewExam({...newExam, totalQuestions: parseInt(e.target.value) || 10})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor en %</Label>
                    <Input type="number" min="0" max="100" required placeholder="Ej. 50" value={newExam.weight || ""} onChange={e => setNewExam({...newExam, weight: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Aplicación</Label>
                  <Input type="date" required value={newExam.date} onChange={e => setNewExam({...newExam, date: e.target.value})} />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Guardar Examen</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Lista de Exámenes</CardTitle>
            </CardHeader>
            <CardContent>
              {activeExams.length > 0 ? (
                <div className="space-y-3">
                  {activeExams.map(exam => {
                    const examSubs = examSubmissions.filter(s => s.examId === exam.id && s.correctAnswers !== undefined);
                    const progress = activeStudents.length === 0 ? 0 : Math.round((examSubs.length / activeStudents.length) * 100);
                    
                    return (
                      <Dialog key={exam.id} onOpenChange={(open) => { if(open) setActiveExam(exam); else setActiveExam(null); }}>
                        <DialogTrigger render={<div role="button" tabIndex={0} className="w-full text-left border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors cursor-pointer group focus:outline-none" />}>
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="flex-1 text-left">
                              <h4 className="font-semibold text-slate-800">{exam.title}</h4>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {exam.date.split("-").reverse().join("/")}</span>
                                <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Aciertos: {exam.totalQuestions}</span>
                                <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Valor: {exam.weight}%</span>
                              </div>
                            </div>
                            
                            <div className="w-full sm:w-32 flex flex-col gap-1 items-end">
                              <span className="text-xs font-bold text-indigo-600">Calificados: {examSubs.length}/{activeStudents.length}</span>
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <div className="flex justify-between items-start pr-6">
                              <div>
                                <DialogTitle className="text-xl">{exam.title}</DialogTitle>
                                <div className="flex gap-2 mt-2">
                                  <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Base: {exam.totalQuestions} Aciertos</span>
                                  <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Peso: {exam.weight}% de Calificación</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => deleteExam(exam.id)}>
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </DialogHeader>
                          
                          <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader className="bg-slate-50">
                                <TableRow>
                                  <TableHead>Alumno</TableHead>
                                  <TableHead className="w-[120px] text-center">Aciertos</TableHead>
                                  <TableHead className="w-[100px] text-center">Calificación</TableHead>
                                  <TableHead className="w-[180px]">Evidencia (PDF/Foto)</TableHead>
                                  <TableHead>Notas</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {activeStudents.map(student => {
                                  const sub = examSubmissions.find(s => s.examId === exam.id && s.studentId === student.id);
                                  const isGraded = sub?.correctAnswers !== undefined;
                                  
                                  // Calcular calificación sobre 10
                                  let calcGrade = "-";
                                  if (isGraded) {
                                    calcGrade = ((sub.correctAnswers! / exam.totalQuestions) * 10).toFixed(1);
                                  }

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
                                        <div className="flex items-center justify-center gap-1">
                                          <Input 
                                            type="number" 
                                            min="0" max={exam.totalQuestions}
                                            placeholder="-"
                                            className={`h-8 w-16 text-center font-bold ${isGraded ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''}`}
                                            value={sub?.correctAnswers !== undefined ? sub.correctAnswers : ""}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              updateSubmissionData(exam.id, student.id, { correctAnswers: val ? parseInt(val) : undefined });
                                            }}
                                          />
                                          <span className="text-xs text-slate-400">/{exam.totalQuestions}</span>
                                        </div>
                                      </TableCell>
                                      
                                      <TableCell className="text-center">
                                        <span className={`font-bold ${parseFloat(calcGrade) >= 6 ? 'text-emerald-600' : parseFloat(calcGrade) < 6 ? 'text-red-600' : 'text-slate-400'}`}>
                                          {calcGrade}
                                        </span>
                                      </TableCell>

                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <div className="relative flex-1">
                                            <input 
                                              type="file" 
                                              id={`exam-file-${exam.id}-${student.id}`} 
                                              className="hidden" 
                                              accept="image/*,application/pdf"
                                              onChange={(e) => handleFileUpload(exam.id, student.id, e)}
                                            />
                                            <label 
                                              htmlFor={`exam-file-${exam.id}-${student.id}`}
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
                                                  <DialogTitle>Examen de {student.name}</DialogTitle>
                                                  <p className="text-sm text-slate-500">{sub.fileName} ({calcGrade}/10)</p>
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
                                          onChange={(e) => updateSubmissionData(exam.id, student.id, { comments: e.target.value })}
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
                  <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-slate-700">No hay exámenes registrados</h3>
                  <p className="text-sm text-slate-500 mt-1">Crea un nuevo examen para este grupo y materia.</p>
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
                  
                  activeExams.forEach(e => {
                    totalPossible += e.weight;
                    const sub = examSubmissions.find(s => s.examId === e.id && s.studentId === student.id);
                    if (sub && sub.correctAnswers !== undefined) {
                      const grade = (sub.correctAnswers / e.totalQuestions) * 10;
                      totalEarned += e.weight * (grade / 10);
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
        </div>
      </div>
    </div>
  );
}
