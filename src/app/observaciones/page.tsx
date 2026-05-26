"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, FileText, Sparkles, Download, FileSpreadsheet, Calendar as CalendarIcon } from "lucide-react";
import * as XLSX from 'xlsx';

export default function Observaciones() {
  const { students, activeGroupId, updateStudent, observationHistory, addOrUpdateObservation } = useAppContext();
  const activeStudents = students.filter(s => s.groupId === activeGroupId).sort((a, b) => a.name.localeCompare(b.name));

  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [activeDate, setActiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Export states
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportType, setExportType] = useState<"todo" | "mes" | "semana" | "semestre">("todo");
  const [exportMonth, setExportMonth] = useState<string>(new Date().getMonth().toString());
  const [exportWeekStart, setExportWeekStart] = useState<string>("");
  const [exportWeekEnd, setExportWeekEnd] = useState<string>("");
  const [exportSemester, setExportSemester] = useState<"1" | "2">("1"); // 1: Ene-Jun, 2: Jul-Dic

  const [reportData, setReportData] = useState({
    strengths: "",
    areasToImprove: "",
    suggestions: ""
  });
  
  const [isGenerated, setIsGenerated] = useState(false);

  const selectedStudent = activeStudents.find(s => s.id === selectedStudentId);

  // Load data when student or date changes
  useEffect(() => {
    if (selectedStudentId) {
      const record = observationHistory.find(o => o.studentId === selectedStudentId && o.date === activeDate);
      if (record) {
        setReportData({
          strengths: record.strengths,
          areasToImprove: record.areasToImprove,
          suggestions: record.suggestions
        });
      } else {
        setReportData({ strengths: "", areasToImprove: "", suggestions: "" });
      }
      setIsGenerated(false);
    }
  }, [selectedStudentId, activeDate, observationHistory]);

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
  };

  const handleGenerate = () => {
    if (selectedStudentId) {
      // 1. Save to History
      addOrUpdateObservation({
        studentId: selectedStudentId,
        groupId: activeGroupId,
        date: activeDate,
        strengths: reportData.strengths,
        areasToImprove: reportData.areasToImprove,
        suggestions: reportData.suggestions
      });
      
      // 2. Fallback to keep the student profile updated with the latest
      updateStudent(selectedStudentId, {
        observations: {
          strengths: reportData.strengths,
          areasToImprove: reportData.areasToImprove,
          suggestions: reportData.suggestions
        }
      });
      
      setIsGenerated(true);
    }
  };

  const generateAIContent = () => {
    if (!selectedStudent) return;
    
    const avg = parseFloat(((selectedStudent.grades.exam + selectedStudent.grades.project + selectedStudent.grades.tasks) / 3).toFixed(1));
    
    if (avg >= 9) {
      setReportData({
        strengths: `${selectedStudent.name} demuestra un excelente compromiso académico. Participa activamente en clase y sus trabajos reflejan un alto nivel de comprensión y dedicación.`,
        areasToImprove: "Continuar manteniendo este ritmo de trabajo y liderazgo positivo dentro del grupo.",
        suggestions: "Se recomienda seguir fomentando el hábito de la lectura técnica y la investigación independiente en casa."
      });
    } else if (avg >= 7) {
      setReportData({
        strengths: `${selectedStudent.name} cumple satisfactoriamente con sus actividades. Tiene buena disposición para el trabajo en equipo y entrega sus tareas a tiempo.`,
        areasToImprove: "Reforzar la atención a los detalles en los exámenes y participar con mayor frecuencia en discusiones grupales.",
        suggestions: "Se sugiere practicar ejercicios de repaso diarios para consolidar los temas vistos en clase."
      });
    } else {
      setReportData({
        strengths: `${selectedStudent.name} es un alumno con potencial que muestra una actitud respetuosa. Tiene habilidades para el trabajo manual y creativo.`,
        areasToImprove: "Es necesario mejorar la constancia en la entrega de tareas y el repaso para las evaluaciones escritas.",
        suggestions: "Es fundamental establecer un horario de estudio supervisado en casa para fortalecer los aprendizajes básicos."
      });
    }
    setIsGenerated(false);
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
      if (exportType === "semestre") {
        const month = date.getMonth();
        if (exportSemester === "1") return month >= 0 && month <= 5; // Jan-Jun
        if (exportSemester === "2") return month >= 6 && month <= 11; // Jul-Dec
      }
      return true;
    };

    const wb = XLSX.utils.book_new();
    const filteredHistory = observationHistory.filter(o => o.groupId === activeGroupId && filterByDate(o.date));

    if (filteredHistory.length === 0) {
      alert("No hay observaciones en el rango de fechas seleccionado.");
      return;
    }

    // Sort by date (descending)
    filteredHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const exportData = filteredHistory.map(obs => {
      const student = activeStudents.find(s => s.id === obs.studentId);
      return {
        "Fecha": obs.date.split('-').reverse().join('/'),
        "Alumno": student?.name || "Desconocido",
        "Fortalezas y Logros": obs.strengths,
        "Áreas de Oportunidad": obs.areasToImprove,
        "Sugerencias al Tutor": obs.suggestions
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    // Adjust column widths
    ws['!cols'] = [{wch: 12}, {wch: 30}, {wch: 50}, {wch: 50}, {wch: 50}];
    
    XLSX.utils.book_append_sheet(wb, ws, "Observaciones");

    const fileName = `Observaciones_${exportType}.xlsx`;
    XLSX.writeFile(wb, fileName);
    setIsExportOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Generador de Boletas y Observaciones</h2>
          <p className="text-slate-500 text-sm mt-1">Redacta y guarda el expediente trimestral</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
            <DialogTrigger render={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Exportar Observaciones a Excel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Rango de Tiempo</Label>
                  <Select value={exportType} onValueChange={(v: any) => setExportType(v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona el rango" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Todo el ciclo escolar</SelectItem>
                      <SelectItem value="semestre">Cada 6 Meses (Semestral)</SelectItem>
                      <SelectItem value="mes">Por Mes</SelectItem>
                      <SelectItem value="semana">Por Semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {exportType === "semestre" && (
                  <div className="space-y-2">
                    <Label>Seleccionar Semestre</Label>
                    <Select value={exportSemester} onValueChange={(v: any) => setExportSemester(v)}>
                      <SelectTrigger><SelectValue placeholder="Semestre" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1er Semestre (Ene - Jun)</SelectItem>
                        <SelectItem value="2">2do Semestre (Jul - Dic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

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
                  <Download className="mr-2 h-4 w-4" /> Descargar Documento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seleccionar Alumno</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedStudentId} onValueChange={handleStudentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige un alumno...">
                    {selectedStudent ? selectedStudent.name : "Elige un alumno..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {activeStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedStudent && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 overflow-hidden shrink-0">
                      {selectedStudent.imageUrl ? (
                        <img src={selectedStudent.imageUrl} alt={selectedStudent.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{selectedStudent.avatar}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{selectedStudent.name}</p>
                      <p className="text-xs text-slate-500">Promedio general: {
                        ((selectedStudent.grades.exam + selectedStudent.grades.project + selectedStudent.grades.tasks) / 3).toFixed(1)
                      }</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full text-xs font-medium text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
                    onClick={generateAIContent}
                  >
                    <Sparkles className="h-3 w-3 mr-2" />
                    Generar ideas con IA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className={!selectedStudent ? "opacity-50 pointer-events-none" : ""}>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center pb-2">
              <div>
                <CardTitle className="text-lg">Redacción de Observaciones</CardTitle>
                <CardDescription>
                  Completa los campos para generar el reporte final que se entregará al tutor.
                </CardDescription>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <CalendarIcon className="h-4 w-4 text-slate-400 ml-2 mr-1" />
                <input 
                  type="date" 
                  className="border-none bg-transparent text-sm font-medium text-indigo-700 focus:ring-0 cursor-pointer p-1"
                  value={activeDate}
                  onChange={(e) => setActiveDate(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-700 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  Fortalezas y Logros
                </label>
                <Textarea 
                  value={reportData.strengths}
                  onChange={(e) => setReportData({...reportData, strengths: e.target.value})}
                  placeholder="Ej. El alumno muestra gran interés en..."
                  className="min-h-[100px] border-emerald-100 focus-visible:ring-emerald-500 bg-emerald-50/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-700 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                  Áreas de Oportunidad
                </label>
                <Textarea 
                  value={reportData.areasToImprove}
                  onChange={(e) => setReportData({...reportData, areasToImprove: e.target.value})}
                  placeholder="Ej. Se le dificulta concentrarse durante..."
                  className="min-h-[100px] border-amber-100 focus-visible:ring-amber-500 bg-amber-50/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-indigo-700 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                  Sugerencias para el Padre/Tutor
                </label>
                <Textarea 
                  value={reportData.suggestions}
                  onChange={(e) => setReportData({...reportData, suggestions: e.target.value})}
                  placeholder="Ej. Se recomienda establecer horarios de lectura..."
                  className="min-h-[100px] border-indigo-100 focus-visible:ring-indigo-500 bg-indigo-50/30"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button 
                  onClick={handleGenerate} 
                  disabled={!selectedStudent || (!reportData.strengths && !reportData.areasToImprove && !reportData.suggestions)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Guardar Observación
                </Button>
              </div>
            </CardContent>
          </Card>

          {isGenerated && selectedStudent && (
            <Card className="mt-6 border-indigo-200 bg-indigo-50/30">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-indigo-900">Vista Previa del Reporte</CardTitle>
                  <CardDescription>Listo para imprimir o copiar.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="bg-white">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-sm space-y-4">
                  <div className="text-center border-b border-slate-100 pb-4 mb-4">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800">Reporte de Desempeño Escolar</h2>
                    <p className="text-slate-500 mt-1">Alumno: <span className="font-semibold text-slate-700">{selectedStudent.name}</span></p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Fortalezas:</h3>
                    <p className="text-slate-600">{reportData.strengths || "No se registraron fortalezas."}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Áreas de Mejora:</h3>
                    <p className="text-slate-600">{reportData.areasToImprove || "No se registraron áreas de oportunidad."}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-1">Recomendaciones en Casa:</h3>
                    <p className="text-slate-600">{reportData.suggestions || "No se emitieron recomendaciones particulares."}</p>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                    <div className="w-48 border-b border-slate-800 mx-auto mb-2"></div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Firma del Maestro</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
