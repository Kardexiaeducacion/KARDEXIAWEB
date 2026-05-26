"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, ShieldAlert, FileSpreadsheet, Download, Calendar as CalendarIcon } from "lucide-react";
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Conducta() {
  const { 
    students, 
    groups,
    activeGroupId, 
    updateStudent,
    conductHistory,
    addConductRecord,
    removeConductRecord
  } = useAppContext();
  
  const activeStudents = students.filter(s => s.groupId === activeGroupId).sort((a, b) => a.name.localeCompare(b.name));
  const activeGroup = groups.find(g => g.id === activeGroupId);

  const [activeDate, setActiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeSubjectId, setActiveSubjectId] = useState<string>("general");
  
  // Export states
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportType, setExportType] = useState<"todo" | "mes" | "semana">("todo");
  const [exportMonth, setExportMonth] = useState<string>(new Date().getMonth().toString());
  const [exportWeekStart, setExportWeekStart] = useState<string>("");
  const [exportWeekEnd, setExportWeekEnd] = useState<string>("");

  const getStudentTotalConduct = (studentId: string) => {
    // Start at 10, add all history points
    const sum = conductHistory.filter(c => c.studentId === studentId && (activeSubjectId === "general" ? !c.subjectId : c.subjectId === activeSubjectId)).reduce((total, c) => total + c.points, 0);
    return Math.min(10, Math.max(0, 10 + sum));
  };

  const getStudentConductChangesForDate = (studentId: string, date: string) => {
    return conductHistory.filter(c => c.studentId === studentId && c.date === date && (activeSubjectId === "general" ? !c.subjectId : c.subjectId === activeSubjectId)).reduce((total, c) => total + c.points, 0);
  };

  const handleUpdate = (id: string, delta: number) => {
    const currentScore = getStudentTotalConduct(id);
    if ((delta > 0 && currentScore >= 10) || (delta < 0 && currentScore <= 0)) {
      return; // Cannot go above 10 or below 0
    }

    const subjId = activeSubjectId === "general" ? undefined : activeSubjectId;

    if (delta > 0 || currentScore > 0) { // delta is already positive or negative 0.5
      addConductRecord({
        studentId: id,
        groupId: activeGroupId,
        date: activeDate,
        points: delta,
        subjectId: subjId
      });
      
      // Fallback update for legacy code compatibility
      const student = students.find(s => s.id === id);
      if (student && activeSubjectId === "general") {
        updateStudent(id, { conductScore: Math.min(10, Math.max(0, (student.conductScore ?? 10) + delta)) });
      }
    }
  };

  // Generate data for the weekly graph (showing number of interactions / modifications)
  const getWeeklyData = () => {
    const today = new Date(activeDate);
    const data = [];
    // Last 7 days including active date
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Count total modifications (positive or negative)
      const count = conductHistory.filter(c => c.groupId === activeGroupId && c.date === dateStr && (activeSubjectId === "general" ? !c.subjectId : c.subjectId === activeSubjectId)).length;
      
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      data.push({
        name: `${days[d.getDay()]} ${d.getDate()}`,
        total: count,
        fullDate: dateStr
      });
    }
    return data;
  };
  const chartData = getWeeklyData();

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

    // -- HOJA 1: Resumen de Conducta --
    const summaryData = activeStudents.map(student => {
      const filteredHistory = conductHistory.filter(c => c.studentId === student.id && (activeSubjectId === "general" ? !c.subjectId : c.subjectId === activeSubjectId) && filterByDate(c.date));
      const totalPointsChange = filteredHistory.reduce((sum, c) => sum + c.points, 0);
      return {
        "Nombre del Alumno": student.name,
        "Ajuste en el Periodo": totalPointsChange > 0 ? `+${totalPointsChange}` : totalPointsChange,
        "Conducta Actual": getStudentTotalConduct(student.id)
      };
    });
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen de Conducta");

    // -- HOJA 2: Desglose por Fechas --
    const filteredHistoryAll = conductHistory.filter(c => c.groupId === activeGroupId && (activeSubjectId === "general" ? !c.subjectId : c.subjectId === activeSubjectId) && filterByDate(c.date));
    const uniqueDates = Array.from(new Set(filteredHistoryAll.map(c => c.date))).sort();
    
    if (uniqueDates.length > 0) {
      const breakdownData = activeStudents.map(student => {
        const row: any = { "Nombre del Alumno": student.name };
        uniqueDates.forEach(date => {
          const change = getStudentConductChangesForDate(student.id, date);
          row[date] = change !== 0 ? (change > 0 ? `+${change}` : change) : "-";
        });
        return row;
      });
      const wsBreakdown = XLSX.utils.json_to_sheet(breakdownData);
      XLSX.utils.book_append_sheet(wb, wsBreakdown, "Desglose por Día");
    }

    const fileName = `Conducta_${activeGroup?.name}_${exportType}.xlsx`;
    XLSX.writeFile(wb, fileName);
    setIsExportOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Control de Buena Conducta</h2>
          <p className="text-slate-500 text-sm mt-1">Suma o resta puntos de la calificación de conducta (Base 10)</p>
        </div>
        
        <div className="flex items-center gap-3">
          {activeGroup?.subjects && activeGroup.subjects.length > 0 && (
            <Select value={activeSubjectId} onValueChange={setActiveSubjectId}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200">
                <SelectValue placeholder="Materia...">
                  {activeSubjectId === "general" 
                    ? "Conducta General" 
                    : activeGroup.subjects.find(s => s.id === activeSubjectId)?.name || "Materia..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Conducta General</SelectItem>
                {activeGroup.subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
             <CalendarIcon className="h-4 w-4 text-slate-400 ml-2 mr-1" />
             <input 
              type="date" 
              className="border-none bg-transparent text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer p-1"
              value={activeDate}
              onChange={(e) => setActiveDate(e.target.value)}
             />
          </div>

          <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
            <DialogTrigger render={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Exportar Conducta a Excel</DialogTitle>
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
                  <Download className="mr-2 h-4 w-4" /> Descargar Documento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {activeStudents.map((student) => {
              const score = getStudentTotalConduct(student.id);
              const todayChange = getStudentConductChangesForDate(student.id, activeDate);
              
              return (
                <Card key={student.id} className={`overflow-hidden transition-all hover:shadow-md ${todayChange !== 0 ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden border shrink-0 ${todayChange < 0 ? 'border-red-300 bg-red-100 text-red-700' : todayChange > 0 ? 'border-emerald-300 bg-emerald-100 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                          {student.imageUrl ? (
                            <img src={student.imageUrl} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <span>{student.avatar}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 line-clamp-1">{student.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                style={{ width: `${score * 10}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-bold ${score >= 8 ? 'text-emerald-600' : score >= 6 ? 'text-amber-600' : 'text-red-600'}`}>
                              {score}/10
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleUpdate(student.id, -0.5)}
                          disabled={score <= 0}
                          title="Restar 0.5 puntos en el día seleccionado"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="w-8 flex flex-col items-center justify-center">
                          <span className="text-sm font-bold text-slate-700 leading-none">{todayChange !== 0 ? (todayChange > 0 ? `+${todayChange}` : todayChange) : "-"}</span>
                          <span className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Hoy</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                          onClick={() => handleUpdate(student.id, 0.5)}
                          disabled={score >= 10}
                          title="Sumar 0.5 puntos en el día seleccionado"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {activeStudents.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
               <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-3" />
               <p className="text-slate-500">No hay alumnos en este grupo.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700">Ajustes disciplinarios (Últimos 7 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748B' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#1E293B', marginBottom: '4px' }}
                    />
                    <Bar 
                      dataKey="total" 
                      fill="#6366F1" 
                      radius={[4, 4, 0, 0]} 
                      name="Intervenciones" 
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
