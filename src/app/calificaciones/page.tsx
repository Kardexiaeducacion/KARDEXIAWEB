"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, TrendingDown, Minus, Download, FileSpreadsheet, BookOpen } from "lucide-react";
import * as XLSX from 'xlsx';
import { useAuth } from "@/context/AuthContext";

export default function Calificaciones() {
  const { 
    students, 
    groups,
    activeGroupId, 
    tasks, 
    taskSubmissions, 
    exams, 
    examSubmissions,
    attendanceHistory,
    participationHistory,
    gradingCriteria, 
    updateGradingCriteria,
    participationGoalConfig,
    conductHistory
  } = useAppContext();

  const activeStudents = students.filter(s => s.groupId === activeGroupId).sort((a, b) => a.name.localeCompare(b.name));
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const [activeSubjectId, setActiveSubjectId] = useState<string>("general");
  
  // Export states
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportPeriod, setExportPeriod] = useState<"Mes" | "Bimestre" | "Trimestre" | "Semestre" | "Año">("Bimestre");
  const [exportStartDate, setExportStartDate] = useState<string>("");
  const [exportEndDate, setExportEndDate] = useState<string>("");

  const { addSchoolGrade, currentUser, activeTeacherId } = useAuth();
  const [isClosePeriodOpen, setIsClosePeriodOpen] = useState(false);
  const [periodType, setPeriodType] = useState<"Bimestre" | "Semestre" | "Año">("Bimestre");
  const [periodNumber, setPeriodNumber] = useState("1");
  const [isClosedSuccess, setIsClosedSuccess] = useState(false);

  const totalCriteria = gradingCriteria.tasks + gradingCriteria.exams + gradingCriteria.participation + gradingCriteria.conduct;

  // Filter activities by group and subject
  const currentTasks = tasks.filter(t => t.groupId === activeGroupId && (activeSubjectId === "general" ? !t.subjectId : t.subjectId === activeSubjectId));
  const currentExams = exams.filter(e => e.groupId === activeGroupId && (activeSubjectId === "general" ? !e.subjectId : e.subjectId === activeSubjectId));

  const calculateStudentGrades = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { tasks: 0, exams: 0, part: 0, conduct: 0, final: 0 };

    // 1. Tareas (Base 10)
    let tasksEarned = 0;
    let tasksPossible = 0;
    currentTasks.forEach(t => {
      if (t.weight) {
        tasksPossible += t.weight;
        const sub = taskSubmissions.find(s => s.taskId === t.id && s.studentId === studentId);
        if (sub && sub.status === "Entregada" && sub.grade !== undefined) {
          tasksEarned += t.weight * (sub.grade / 10);
        }
      }
    });
    const tasksGrade = tasksPossible === 0 ? 0 : (tasksEarned / tasksPossible) * 10;

    // 2. Exámenes (Base 10)
    let examsEarned = 0;
    let examsPossible = 0;
    currentExams.forEach(e => {
      examsPossible += e.weight;
      const sub = examSubmissions.find(s => s.examId === e.id && s.studentId === studentId);
      if (sub && sub.correctAnswers !== undefined) {
        const grade = (sub.correctAnswers / e.totalQuestions) * 10;
        examsEarned += e.weight * (grade / 10);
      }
    });
    const examsGrade = examsPossible === 0 ? 0 : (examsEarned / examsPossible) * 10;

    // 3. Participación (Base 10)
    const studentTotalPart = participationHistory.filter(p => p.studentId === studentId && (activeSubjectId === "general" ? !p.subjectId : p.subjectId === activeSubjectId)).reduce((sum, p) => sum + p.points, 0);
    const partGrade = Math.min(10, (studentTotalPart / participationGoalConfig.amount) * 10);

    // 4. Conducta (Base 10)
    const conductSum = conductHistory.filter(c => c.studentId === studentId && (activeSubjectId === "general" ? !c.subjectId : c.subjectId === activeSubjectId)).reduce((total, c) => total + c.points, 0);
    const conductGrade = Math.min(10, Math.max(0, 10 + conductSum));

    // Calificación Final (Ponderada)
    const finalGrade = (
      (tasksGrade * (gradingCriteria.tasks / 100)) +
      (examsGrade * (gradingCriteria.exams / 100)) +
      (partGrade * (gradingCriteria.participation / 100)) +
      (conductGrade * (gradingCriteria.conduct / 100))
    );

    return {
      tasks: tasksGrade,
      exams: examsGrade,
      part: partGrade,
      conduct: conductGrade,
      final: finalGrade
    };
  };

  const handleClosePeriod = () => {
    if (!activeTeacherId || !activeGroup || activeStudents.length === 0) return;

    let totalGrades = 0;
    let approved = 0;
    let failed = 0;

    activeStudents.forEach(student => {
      const grades = calculateStudentGrades(student.id);
      totalGrades += grades.final;
      if (grades.final >= 6) {
        approved++;
      } else {
        failed++;
      }
    });

    const averageGrade = totalGrades / activeStudents.length;
    const termName = periodType === "Año" ? "Ciclo Escolar Completo" : `${periodType} ${periodNumber}`;

    addSchoolGrade({
      teacherId: activeTeacherId,
      groupId: activeGroup.id,
      groupName: activeGroup.name,
      termType: periodType,
      termName,
      averageGrade,
      totalStudents: activeStudents.length,
      approvedStudents: approved,
      failedStudents: failed
    });

    setIsClosedSuccess(true);
    setTimeout(() => {
      setIsClosedSuccess(false);
      setIsClosePeriodOpen(false);
    }, 2000);
  };

  const handleExportExcel = () => {
    // 1. Filter dates if needed
    const filterByDate = (dateStr: string) => {
      if (!dateStr || !exportStartDate || !exportEndDate) return true;
      const date = new Date(dateStr);
      return date >= new Date(exportStartDate) && date <= new Date(exportEndDate);
    };

    const wb = XLSX.utils.book_new();

    // -- HOJA 1: Boleta Final --
    const generalData = activeStudents.map(student => {
      const grades = calculateStudentGrades(student.id);
      return {
        "Nombre del Alumno": student.name,
        [`Tareas (${gradingCriteria.tasks}%)`]: grades.tasks.toFixed(1),
        [`Exámenes (${gradingCriteria.exams}%)`]: grades.exams.toFixed(1),
        [`Participación (${gradingCriteria.participation}%)`]: grades.part.toFixed(1),
        [`Conducta (${gradingCriteria.conduct}%)`]: grades.conduct.toFixed(1),
        "Calificación Final": grades.final.toFixed(1)
      };
    });
    const wsGeneral = XLSX.utils.json_to_sheet(generalData);
    XLSX.utils.book_append_sheet(wb, wsGeneral, "Reporte General");

    // -- HOJA 2: Asistencia --
    const filteredAttendance = attendanceHistory.filter(a => a.groupId === activeGroupId && filterByDate(a.date));
    const uniqueDates = Array.from(new Set(filteredAttendance.map(a => a.date))).sort();
    const attendanceData = activeStudents.map(student => {
      const row: any = { "Nombre del Alumno": student.name };
      let presentCount = 0;
      let absentCount = 0;
      uniqueDates.forEach(date => {
        const record = filteredAttendance.find(a => a.studentId === student.id && a.date === date);
        row[date] = record ? record.status : "-";
        if (record?.status === "Presente") presentCount++;
        if (record?.status === "Ausente") absentCount++;
      });
      row["Total Presente"] = presentCount;
      row["Total Ausente"] = absentCount;
      return row;
    });
    if (attendanceData.length > 0 && uniqueDates.length > 0) {
      const wsAttendance = XLSX.utils.json_to_sheet(attendanceData);
      XLSX.utils.book_append_sheet(wb, wsAttendance, "Asistencia");
    }

    // -- HOJA 3: Tareas --
    const filteredTasks = currentTasks.filter(t => filterByDate(t.dueDate));
    const tasksData = activeStudents.map(student => {
      const row: any = { "Nombre del Alumno": student.name };
      filteredTasks.forEach(task => {
        const sub = taskSubmissions.find(s => s.taskId === task.id && s.studentId === student.id);
        row[task.title] = sub?.grade !== undefined ? sub.grade : "Sin calificar";
      });
      return row;
    });
    if (tasksData.length > 0 && filteredTasks.length > 0) {
      const wsTasks = XLSX.utils.json_to_sheet(tasksData);
      XLSX.utils.book_append_sheet(wb, wsTasks, "Tareas");
    }

    // -- HOJA 4: Exámenes --
    const filteredExams = currentExams.filter(e => filterByDate(e.date));
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
    if (examsData.length > 0 && filteredExams.length > 0) {
      const wsExams = XLSX.utils.json_to_sheet(examsData);
      XLSX.utils.book_append_sheet(wb, wsExams, "Exámenes");
    }

    // Generate file
    const periodName = exportStartDate && exportEndDate ? `${exportPeriod} (${exportStartDate} a ${exportEndDate})` : exportPeriod;
    const fileName = `Boleta_Calificaciones_${activeGroup?.name}_${exportPeriod}.xlsx`;
    XLSX.writeFile(wb, fileName);
    setIsExportOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reporte General Integrado</h2>
          <p className="text-slate-500 text-sm mt-1">Consolidado de todas las áreas evaluativas</p>
        </div>
        
        <div className="flex items-center gap-2">
          {currentUser?.role === "teacher" && (
            <Dialog open={isClosePeriodOpen} onOpenChange={setIsClosePeriodOpen}>
              <DialogTrigger render={
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                  <BookOpen className="mr-2 h-4 w-4" /> Cerrar Periodo
                </Button>
              } />
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Cierre de Periodo y Envío de Calificaciones</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-slate-500">
                    Al cerrar el periodo, se calculará el promedio general del grupo y se enviará un reporte congelado a la Dirección.
                  </p>
                  
                  <div className="space-y-2">
                    <Label>Tipo de Periodo</Label>
                    <Select value={periodType} onValueChange={(v: any) => setPeriodType(v)}>
                      <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bimestre">Bimestre</SelectItem>
                        <SelectItem value="Semestre">Semestre</SelectItem>
                        <SelectItem value="Año">Ciclo Escolar Completo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {periodType !== "Año" && (
                    <div className="space-y-2">
                      <Label>Número de {periodType}</Label>
                      <Select value={periodNumber} onValueChange={setPeriodNumber}>
                        <SelectTrigger><SelectValue placeholder="Número" /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map(n => (
                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button 
                    className={`w-full ${isClosedSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"}`} 
                    onClick={handleClosePeriod}
                    disabled={isClosedSuccess}
                  >
                    {isClosedSuccess ? "¡Periodo Cerrado con Éxito!" : "Confirmar Cierre de Periodo"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
            <DialogTrigger render={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar a Excel
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generar Boleta de Calificaciones</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-slate-500 mb-2">Simulación de boleta: Selecciona el tipo de periodo y las fechas que abarca para generar el reporte.</p>
                <div className="space-y-2">
                  <Label>Tipo de Periodo</Label>
                  <Select value={exportPeriod} onValueChange={(v: any) => setExportPeriod(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mes">Mes</SelectItem>
                      <SelectItem value="Bimestre">Bimestre</SelectItem>
                      <SelectItem value="Trimestre">Trimestre</SelectItem>
                      <SelectItem value="Semestre">Semestre</SelectItem>
                      <SelectItem value="Año">Año Escolar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de Inicio</Label>
                    <Input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Fin</Label>
                    <Input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} />
                  </div>
                </div>

                <Button onClick={handleExportExcel} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2">
                  <Download className="mr-2 h-4 w-4" /> Generar Boleta de Calificaciones
                </Button>
              </div>
            </DialogContent>
          </Dialog>

           {activeGroup?.subjects && activeGroup.subjects.length > 0 && (
            <Select value={activeSubjectId} onValueChange={setActiveSubjectId}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200">
                <SelectValue placeholder="Materia...">
                  {activeSubjectId === "general" ? "General" : activeGroup.subjects.find(s => s.id === activeSubjectId)?.name || "Materia..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Criterio General</SelectItem>
                {activeGroup.subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Configuración de Criterios */}
      <Card className="border-indigo-100 bg-indigo-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-2">
            Configuración de Ponderación (Total debe ser 100%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Tareas (%)</Label>
              <Input 
                type="text" 
                inputMode="numeric"
                value={gradingCriteria.tasks} 
                onFocus={(e) => e.target.select()}
                onChange={(e) => updateGradingCriteria({ tasks: parseInt(e.target.value.replace(/\D/g, '') || '0', 10) })}
                className="bg-white border-indigo-200 text-center font-bold text-indigo-600"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Exámenes (%)</Label>
              <Input 
                type="text" 
                inputMode="numeric"
                value={gradingCriteria.exams} 
                onFocus={(e) => e.target.select()}
                onChange={(e) => updateGradingCriteria({ exams: parseInt(e.target.value.replace(/\D/g, '') || '0', 10) })}
                className="bg-white border-indigo-200 text-center font-bold text-indigo-600"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Participación (%)</Label>
              <Input 
                type="text" 
                inputMode="numeric"
                value={gradingCriteria.participation} 
                onFocus={(e) => e.target.select()}
                onChange={(e) => updateGradingCriteria({ participation: parseInt(e.target.value.replace(/\D/g, '') || '0', 10) })}
                className="bg-white border-indigo-200 text-center font-bold text-indigo-600"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Conducta (%)</Label>
              <Input 
                type="text" 
                inputMode="numeric"
                value={gradingCriteria.conduct} 
                onFocus={(e) => e.target.select()}
                onChange={(e) => updateGradingCriteria({ conduct: parseInt(e.target.value.replace(/\D/g, '') || '0', 10) })}
                className="bg-white border-indigo-200 text-center font-bold text-indigo-600"
              />
            </div>
          </div>
          
          {totalCriteria !== 100 && (
            <div className="mt-4 flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-2 rounded border border-red-100">
              <AlertCircle className="h-4 w-4" />
              ¡Atención! La suma actual es de {totalCriteria}%. Debe ser exactamente 100%.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Calificaciones Consolidada */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[200px]">Alumno</TableHead>
              <TableHead className="text-center">Tareas ({gradingCriteria.tasks}%)</TableHead>
              <TableHead className="text-center">Exámenes ({gradingCriteria.exams}%)</TableHead>
              <TableHead className="text-center">Participación ({gradingCriteria.participation}%)</TableHead>
              <TableHead className="text-center">Conducta ({gradingCriteria.conduct}%)</TableHead>
              <TableHead className="text-center bg-indigo-50 font-bold text-indigo-700">Calificación Final</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeStudents.map((student) => {
              const res = calculateStudentGrades(student.id);

              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                        {student.imageUrl ? (
                          <img src={student.imageUrl} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">{student.avatar}</span>
                        )}
                      </div>
                      <span className="text-sm text-slate-800 line-clamp-1">{student.name}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-slate-600">{res.tasks.toFixed(1)}</span>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-slate-600">{res.exams.toFixed(1)}</span>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-slate-600">{res.part.toFixed(1)}</span>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-slate-600">{res.conduct.toFixed(1)}</span>
                  </TableCell>
                  
                  <TableCell className="text-center bg-indigo-50/50">
                    <span className={`text-base font-bold px-3 py-1 rounded-full ${
                      res.final >= 9 ? 'text-emerald-700 bg-emerald-100' :
                      res.final >= 6 ? 'text-indigo-700 bg-indigo-100' :
                      'text-red-700 bg-red-100'
                    }`}>
                      {res.final.toFixed(1)}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {activeStudents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
           <Minus className="h-10 w-10 text-slate-300 mx-auto mb-2" />
           <p className="text-slate-500">No hay datos para mostrar.</p>
        </div>
      )}
    </div>
  );
}
