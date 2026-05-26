"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserCircle2, Download, Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileSpreadsheet, ArrowUp, ArrowDown, ArrowUpDown, PieChart as PieChartIcon, BarChart2, Settings2 } from "lucide-react";
import { startOfWeek, addDays, format, getDaysInMonth } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Status = "Presente" | "Ausente" | "Retardo" | "Justificado";

export default function Asistencia() {
  const { students, groups, activeGroupId, attendanceHistory, addOrUpdateAttendance, updateStudent } = useAppContext();
  const activeGroup = groups.find(g => g.id === activeGroupId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeSubjectId, setActiveSubjectId] = useState<string>("general");
  const [sortBy, setSortBy] = useState<"alphabetical" | "listNumber" | "gender" | "manual">("alphabetical");
  
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [chartColors, setChartColors] = useState({ presentes: "#10b981", ausentes: "#ef4444" });
  
  const activeStudents = students.filter(s => s.groupId === activeGroupId);

  // Sorting
  let sortedStudents = [...activeStudents];
  if (sortBy === "alphabetical") {
    sortedStudents.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "listNumber") {
    sortedStudents.sort((a, b) => (a.listNumber || 999) - (b.listNumber || 999));
  } else if (sortBy === "gender") {
    sortedStudents.sort((a, b) => (a.gender || "").localeCompare(b.gender || ""));
  } else if (sortBy === "manual") {
    sortedStudents.sort((a, b) => (a.manualOrder || 0) - (b.manualOrder || 0));
  }

  const moveStudent = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= sortedStudents.length) return;
    const newSorted = [...sortedStudents];
    const temp = newSorted[index];
    newSorted[index] = newSorted[index + direction];
    newSorted[index + direction] = temp;
    
    // Update manualOrder for all
    newSorted.forEach((s, i) => {
      updateStudent(s.id, { manualOrder: i });
    });
  };

  // Calculate week days (Monday to Friday)
  const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = [0, 1, 2, 3, 4].map(i => addDays(monday, i));

  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const getStudentStatus = (studentId: string, dateStr: string) => {
    const subjectQuery = activeSubjectId === "general" ? undefined : activeSubjectId;
    const record = attendanceHistory.find(r => 
      r.date === dateStr && 
      r.studentId === studentId && 
      r.subjectId === subjectQuery
    );
    return record ? record.status : null; // null if not recorded
  };

  const toggleStatus = (studentId: string, dateStr: string) => {
    const current = getStudentStatus(studentId, dateStr);
    let next: Status;
    switch (current) {
      case null: next = "Presente"; break;
      case "Presente": next = "Ausente"; break;
      case "Ausente": next = "Retardo"; break;
      case "Retardo": next = "Justificado"; break;
      case "Justificado": next = "Presente"; break;
      default: next = "Presente";
    }
    
    addOrUpdateAttendance({
      date: dateStr,
      studentId,
      status: next,
      subjectId: activeSubjectId === "general" ? undefined : activeSubjectId
    });
  };

  const getStatusDisplay = (status: string | null) => {
    switch (status) {
      case "Presente": return { char: "P", className: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "Ausente": return { char: "A", className: "bg-red-100 text-red-800 border-red-200" };
      case "Retardo": return { char: "R", className: "bg-amber-100 text-amber-800 border-amber-200" };
      case "Justificado": return { char: "J", className: "bg-blue-100 text-blue-800 border-blue-200" };
      default: return { char: "-", className: "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100" };
    }
  };

  const downloadCSV = (type: "week" | "month") => {
    if (activeStudents.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (type === "week") {
      csvContent += "ID,N.Lista,Nombre," + weekDays.map(d => format(d, "EEEE dd/MM", { locale: es })).join(",") + "\n";
      
      sortedStudents.forEach(student => {
        const row = [student.id, student.listNumber || "", `"${student.name}"`];
        weekDays.forEach(day => {
          const dateStr = format(day, "yyyy-MM-dd");
          row.push(getStudentStatus(student.id, dateStr) || "Sin registro");
        });
        csvContent += row.join(",") + "\n";
      });
      
      const fileName = `asistencia_semana_${format(monday, "dd-MM-yyyy")}.csv`;
      triggerDownload(csvContent, fileName);
    } else {
      // Month download
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = getDaysInMonth(currentDate);
      
      // Get all weekdays in month
      const monthDays: Date[] = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        if (d.getDay() !== 0 && d.getDay() !== 6) { // Monday to Friday
          monthDays.push(d);
        }
      }

      csvContent += "ID,N.Lista,Nombre," + monthDays.map(d => format(d, "dd/MM")).join(",") + "\n";
      
      sortedStudents.forEach(student => {
        const row = [student.id, student.listNumber || "", `"${student.name}"`];
        monthDays.forEach(day => {
          const dateStr = format(day, "yyyy-MM-dd");
          row.push(getStudentStatus(student.id, dateStr) || "Sin registro");
        });
        csvContent += row.join(",") + "\n";
      });
      
      const fileName = `asistencia_mes_${format(currentDate, "MMMM_yyyy", { locale: es })}.csv`;
      triggerDownload(csvContent, fileName);
    }
  };

  const triggerDownload = (content: string, fileName: string) => {
    const encodedUri = encodeURI(content);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart Data
  const chartData = weekDays.map(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    let presentes = 0;
    let ausentes = 0;
    activeStudents.forEach(s => {
      const status = getStudentStatus(s.id, dateStr);
      if (status === "Presente" || status === "Retardo" || status === null) presentes++;
      else if (status === "Ausente" || status === "Justificado") ausentes++;
    });
    return {
      name: format(day, "EEEE", { locale: es }).slice(0, 3).toUpperCase(),
      Presentes: presentes,
      Ausentes: ausentes
    };
  });

  const totalPresentes = chartData.reduce((acc, curr) => acc + curr.Presentes, 0);
  const totalAusentes = chartData.reduce((acc, curr) => acc + curr.Ausentes, 0);
  const pieData = [
    { name: "Presentes", value: totalPresentes, color: chartColors.presentes },
    { name: "Ausentes", value: totalAusentes, color: chartColors.ausentes }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Control de Asistencia</h2>
          <p className="text-slate-500 text-sm mt-1">
            Da clic en las celdas para cambiar el estado (P = Presente, A = Ausente, R = Retardo, J = Justificado)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeGroup?.subjects && activeGroup.subjects.length > 0 && (
            <Select value={activeSubjectId} onValueChange={setActiveSubjectId}>
              <SelectTrigger className="w-[180px] bg-white border-slate-200">
                <SelectValue placeholder="Materia...">
                  {activeSubjectId === "general" 
                    ? "Asistencia General" 
                    : activeGroup.subjects.find(s => s.id === activeSubjectId)?.name || "Materia..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Asistencia General</SelectItem>
                {activeGroup.subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-[180px] bg-white border-slate-200">
              <ArrowUpDown className="mr-2 h-4 w-4 text-slate-500" />
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alphabetical">Orden Alfabético</SelectItem>
              <SelectItem value="listNumber">Número de Lista</SelectItem>
              <SelectItem value="gender">Por Género</SelectItem>
              <SelectItem value="manual">Orden Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center bg-white border border-slate-200 rounded-md p-1 shadow-sm">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 text-sm font-medium text-slate-700 min-w-[140px] text-center">
              Semana del {format(monday, "d MMM", { locale: es })}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Dialog>
            <DialogTrigger render={<Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm" />}>
              <Download className="mr-2 h-4 w-4" /> Exportar
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Exportar Asistencia (CSV)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Button 
                  className="w-full justify-start bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200" 
                  variant="outline"
                  onClick={() => downloadCSV("week")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Semana Actual ({format(monday, "d MMM")} - {format(weekDays[4], "d MMM")})
                </Button>
                <Button 
                  className="w-full justify-start bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200" 
                  variant="outline"
                  onClick={() => downloadCSV("month")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Mes Completo ({format(currentDate, "MMMM yyyy", { locale: es })})
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {activeStudents.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6 pb-2 relative">
            
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600" onClick={() => setChartType(chartType === "bar" ? "pie" : "bar")}>
                {chartType === "bar" ? <PieChartIcon className="h-4 w-4" /> : <BarChart2 className="h-4 w-4" />}
              </Button>
              
              <Dialog>
                <DialogTrigger render={<Button variant="outline" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600" />}>
                  <Settings2 className="h-4 w-4" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[320px]">
                  <DialogHeader>
                    <DialogTitle>Personalizar Colores</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 pt-4">
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <Label className="text-slate-700">Presentes / Retardos</Label>
                      <input 
                        type="color" 
                        className="h-8 w-12 cursor-pointer bg-transparent border-0 p-0"
                        value={chartColors.presentes} 
                        onChange={(e) => setChartColors({...chartColors, presentes: e.target.value})} 
                      />
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <Label className="text-slate-700">Ausentes / Justific.</Label>
                      <input 
                        type="color" 
                        className="h-8 w-12 cursor-pointer bg-transparent border-0 p-0"
                        value={chartColors.ausentes} 
                        onChange={(e) => setChartColors({...chartColors, ausentes: e.target.value})} 
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Presentes" fill={chartColors.presentes} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Ausentes" fill={chartColors.ausentes} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold">
              <tr>
                {sortBy === "manual" && <th className="px-3 py-3 w-16 text-center">Orden</th>}
                <th className="px-4 py-3 uppercase">Alumno</th>
                {weekDays.map(day => (
                  <th key={day.toISOString()} className="px-2 py-3 text-center min-w-[80px]">
                    <div className="uppercase mb-1">{format(day, "EEEE", { locale: es }).slice(0,3)}</div>
                    <div className="text-slate-400 font-normal">{format(day, "dd/MM")}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedStudents.map((student, index) => {
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    {sortBy === "manual" && (
                      <td className="px-3 py-3 text-center">
                        <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => moveStudent(index, -1)} disabled={index === 0} className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30">
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button onClick={() => moveStudent(index, 1)} disabled={index === sortedStudents.length - 1} className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-30">
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                          {student.imageUrl ? (
                            <img src={student.imageUrl} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-slate-400">{student.avatar}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800 text-sm whitespace-nowrap block">{student.name}</span>
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <span>Nº</span>
                            <input 
                              type="number" 
                              className="w-10 h-5 px-1 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:bg-white rounded outline-none text-center transition-colors"
                              value={student.listNumber || ""}
                              onChange={(e) => updateStudent(student.id, { listNumber: parseInt(e.target.value) || 0 })}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span>| {student.gender === "M" ? "Masc" : student.gender === "F" ? "Fem" : "Otro"}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {weekDays.map(day => {
                      const dateStr = format(day, "yyyy-MM-dd");
                      const status = getStudentStatus(student.id, dateStr);
                      const display = getStatusDisplay(status);
                      return (
                        <td key={dateStr} className="px-2 py-3 text-center">
                          <button
                            onClick={() => toggleStatus(student.id, dateStr)}
                            className={`w-8 h-8 rounded border flex items-center justify-center mx-auto text-xs font-bold transition-colors ${display.className}`}
                            title={status || "Sin registro"}
                          >
                            {display.char}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {activeStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <UserCircle2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    No hay alumnos en este grupo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
