"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Star, FileSpreadsheet, Download, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Participacion() {
  const { 
    students, 
    groups,
    activeGroupId, 
    updateStudent, 
    participationGoalConfig, 
    setParticipationGoalConfig,
    participationHistory,
    addParticipation,
    removeParticipation
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

  const getStudentTotalParticipation = (studentId: string) => {
    return participationHistory.filter(p => p.studentId === studentId && (activeSubjectId === "general" ? !p.subjectId : p.subjectId === activeSubjectId)).reduce((sum, p) => sum + p.points, 0);
  };

  const getStudentParticipationForDate = (studentId: string, date: string) => {
    return participationHistory.filter(p => p.studentId === studentId && p.date === date && (activeSubjectId === "general" ? !p.subjectId : p.subjectId === activeSubjectId)).reduce((sum, p) => sum + p.points, 0);
  };

  const handleUpdate = (id: string, delta: number) => {
    const subjId = activeSubjectId === "general" ? undefined : activeSubjectId;
    if (delta > 0) {
      addParticipation({
        studentId: id,
        groupId: activeGroupId,
        date: activeDate,
        points: 1,
        subjectId: subjId
      });
      // Fallback update for legacy code compatibility
      const student = students.find(s => s.id === id);
      if (student && activeSubjectId === "general") updateStudent(id, { participation: student.participation + 1 });
    } else {
      removeParticipation(id, activeDate, subjId);
      const student = students.find(s => s.id === id);
      if (student && activeSubjectId === "general") updateStudent(id, { participation: Math.max(0, student.participation - 1) });
    }
  };

  // Generate data for the weekly graph
  const getWeeklyData = () => {
    const today = new Date(activeDate);
    const data = [];
    // Last 7 days including active date
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const count = participationHistory.filter(p => p.groupId === activeGroupId && p.date === dateStr && (activeSubjectId === "general" ? !p.subjectId : p.subjectId === activeSubjectId)).length;
      
      // format to short date e.g. "Lun 12"
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

    // -- HOJA 1: Resumen Participación --
    const summaryData = activeStudents.map(student => {
      const filteredHistory = participationHistory.filter(p => p.studentId === student.id && (activeSubjectId === "general" ? !p.subjectId : p.subjectId === activeSubjectId) && filterByDate(p.date));
      const totalInRange = filteredHistory.reduce((sum, p) => sum + p.points, 0);
      return {
        "Nombre del Alumno": student.name,
        "Total Periodo": totalInRange,
        [`Meta (${participationGoalConfig.timeframe})`]: participationGoalConfig.amount,
        "Cumplimiento (%)": Math.min(100, (totalInRange / participationGoalConfig.amount) * 100).toFixed(1) + "%"
      };
    });
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen Participaciones");

    // -- HOJA 2: Desglose por Fechas --
    const filteredHistoryAll = participationHistory.filter(p => p.groupId === activeGroupId && (activeSubjectId === "general" ? !p.subjectId : p.subjectId === activeSubjectId) && filterByDate(p.date));
    const uniqueDates = Array.from(new Set(filteredHistoryAll.map(p => p.date))).sort();
    
    if (uniqueDates.length > 0) {
      const breakdownData = activeStudents.map(student => {
        const row: any = { "Nombre del Alumno": student.name };
        uniqueDates.forEach(date => {
          row[date] = getStudentParticipationForDate(student.id, date);
        });
        return row;
      });
      const wsBreakdown = XLSX.utils.json_to_sheet(breakdownData);
      XLSX.utils.book_append_sheet(wb, wsBreakdown, "Desglose por Día");
    }

    const fileName = `Participaciones_${activeGroup?.name}_${exportType}.xlsx`;
    XLSX.writeFile(wb, fileName);
    setIsExportOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Control de Participación</h2>
          <p className="text-slate-500 text-sm mt-1">Registra intervenciones y evalúa el desempeño activo</p>
        </div>
        
        <div className="flex items-center gap-3">
          {activeGroup?.subjects && activeGroup.subjects.length > 0 && (
            <Select value={activeSubjectId} onValueChange={setActiveSubjectId}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200">
                <SelectValue placeholder="Materia...">
                  {activeSubjectId === "general" 
                    ? "Participación General" 
                    : activeGroup.subjects.find(s => s.id === activeSubjectId)?.name || "Materia..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Participación General</SelectItem>
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
                <DialogTitle>Exportar Participaciones a Excel</DialogTitle>
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
              const total = getStudentTotalParticipation(student.id);
              const todayCount = getStudentParticipationForDate(student.id, activeDate);
              
              return (
                <Card key={student.id} className={`overflow-hidden transition-all hover:shadow-md ${todayCount > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden border shrink-0 ${todayCount > 0 ? 'border-amber-300 bg-amber-100 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                          {student.imageUrl ? (
                            <img src={student.imageUrl} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <span>{student.avatar}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 line-clamp-1">{student.name}</h3>
                          <div className="flex items-center gap-1 text-amber-500 mt-1">
                            {Array.from({ length: Math.min(5, total) }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-current" />
                            ))}
                            {total > 5 && (
                              <span className="text-xs font-medium ml-1">+{total - 5}</span>
                            )}
                            {total === 0 && (
                              <span className="text-xs text-slate-400">Sin participaciones</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleUpdate(student.id, -1)}
                          disabled={todayCount === 0}
                          title="Restar participación del día seleccionado"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="w-8 flex flex-col items-center justify-center">
                          <span className="text-sm font-bold text-slate-700 leading-none">{todayCount}</span>
                          <span className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">Hoy</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                          onClick={() => handleUpdate(student.id, 1)}
                          title="Sumar participación al día seleccionado"
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
        </div>

        <div className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-50">
              <CardTitle className="text-sm font-bold text-indigo-800 uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Meta</span>
                  <Select 
                    value={participationGoalConfig.timeframe} 
                    onValueChange={(v) => setParticipationGoalConfig({...participationGoalConfig, timeframe: v})}
                  >
                    <SelectTrigger className="h-6 text-xs bg-transparent border-none p-0 focus:ring-0 w-auto font-bold text-indigo-800 shadow-none uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensual">Mensual</SelectItem>
                      <SelectItem value="Bimestral">Bimestral</SelectItem>
                      <SelectItem value="Semestral">Semestral</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <TrendingUp className="h-4 w-4 text-indigo-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <input 
                    type="number" 
                    min="1"
                    className="w-20 h-12 text-2xl text-center border-b-2 border-indigo-200 bg-transparent font-bold text-indigo-700 focus:outline-none focus:border-indigo-500 transition-colors"
                    value={participationGoalConfig.amount}
                    onChange={(e) => setParticipationGoalConfig({...participationGoalConfig, amount: parseInt(e.target.value) || 1})}
                  />
                  <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wide">Participaciones = 100%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-700">Actividad de los últimos 7 días</CardTitle>
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
                      fill="#F59E0B" 
                      radius={[4, 4, 0, 0]} 
                      name="Participaciones" 
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
