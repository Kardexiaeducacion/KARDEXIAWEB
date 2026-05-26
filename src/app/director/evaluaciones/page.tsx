"use client";

import { useState, useMemo } from "react";
import { useAppContext, TeacherEvaluationCriteria } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Star, Plus, UserCircle2, Calendar as CalendarIcon, Trash2, Settings, Download, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

export default function EvaluacionesDocentesPage() {
  const { 
    teacherEvaluations, 
    addTeacherEvaluation, 
    deleteTeacherEvaluation,
    teacherEvaluationCriteria,
    addTeacherEvaluationCriteria,
    updateTeacherEvaluationCriteria,
    deleteTeacherEvaluationCriteria
  } = useAppContext();
  const { users } = useAuth();
  
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isChartOpen, setIsChartOpen] = useState(false);

  const teachers = users.filter(u => u.role === "teacher");

  const initialScores: Record<string, number> = {};
  teacherEvaluationCriteria.forEach(c => initialScores[c.id] = c.maxScore);

  const [formData, setFormData] = useState({
    teacherId: "",
    period: "Bimestre 1",
    frequency: "Mensual",
    scores: { ...initialScores },
    comments: ""
  });

  const [newCriteriaName, setNewCriteriaName] = useState("");
  const [newCriteriaMax, setNewCriteriaMax] = useState(10);

  const handleSaveEval = () => {
    if (!formData.teacherId) return;
    addTeacherEvaluation({
      teacherId: formData.teacherId,
      date: new Date().toISOString().split('T')[0],
      period: formData.period,
      frequency: formData.frequency,
      scores: formData.scores,
      comments: formData.comments
    });
    setIsEvalOpen(false);
    setFormData({
      teacherId: "",
      period: "Bimestre 1",
      frequency: "Mensual",
      scores: { ...initialScores },
      comments: ""
    });
  };

  const handleAddCriteria = () => {
    if (!newCriteriaName) return;
    addTeacherEvaluationCriteria({ name: newCriteriaName, maxScore: newCriteriaMax });
    setNewCriteriaName("");
    setNewCriteriaMax(10);
  };

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || "Maestro Desconocido";

  const calculateTotal = (scores: Record<string, number>) => {
    const keys = Object.keys(scores);
    if (keys.length === 0) return 0;
    
    let totalScore = 0;
    let totalMax = 0;

    keys.forEach(k => {
      const criteria = teacherEvaluationCriteria.find(c => c.id === k);
      if (criteria) {
        totalScore += scores[k] || 0;
        totalMax += criteria.maxScore;
      } else {
        // Para evaluaciones antiguas
        totalScore += scores[k] || 0;
        totalMax += 5; // Asumimos 5 para antiguas si no existe el criterio
      }
    });

    if (totalMax === 0) return 0;
    // Retornamos promedio en escala de 10
    return (totalScore / totalMax) * 10;
  };

  const exportToExcel = () => {
    const dataToExport = teacherEvaluations.map(ev => {
      const row: any = {
        "Maestro": getTeacherName(ev.teacherId),
        "Fecha": ev.date,
        "Periodo": ev.period,
        "Frecuencia": ev.frequency || "N/A",
        "Calificación Total (base 10)": calculateTotal(ev.scores).toFixed(2),
        "Comentarios": ev.comments
      };
      
      Object.keys(ev.scores).forEach(key => {
        const criteria = teacherEvaluationCriteria.find(c => c.id === key);
        const name = criteria ? criteria.name : `Antiguo: ${key}`;
        row[name] = ev.scores[key];
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluaciones");
    XLSX.writeFile(workbook, `Evaluaciones_Docentes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Data for chart
  const chartData = useMemo(() => {
    const teacherAverages: Record<string, { total: number, count: number }> = {};
    teacherEvaluations.forEach(ev => {
      if (!teacherAverages[ev.teacherId]) {
        teacherAverages[ev.teacherId] = { total: 0, count: 0 };
      }
      teacherAverages[ev.teacherId].total += calculateTotal(ev.scores);
      teacherAverages[ev.teacherId].count += 1;
    });

    return Object.keys(teacherAverages).map(id => ({
      name: getTeacherName(id),
      promedio: Number((teacherAverages[id].total / teacherAverages[id].count).toFixed(2))
    }));
  }, [teacherEvaluations, teacherEvaluationCriteria]);

  // History for selected teacher
  const selectedTeacherHistory = useMemo(() => {
    if (!formData.teacherId) return [];
    return teacherEvaluations.filter(e => e.teacherId === formData.teacherId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [formData.teacherId, teacherEvaluations]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Evaluación Docente</h2>
          <p className="text-slate-500 text-sm mt-1">Rúbricas de desempeño del profesorado</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="bg-white" onClick={() => setIsChartOpen(true)}>
            <BarChart2 className="w-4 h-4 mr-2 text-indigo-600" /> Promedios
          </Button>
          <Button variant="outline" className="bg-white" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2 text-green-600" /> Exportar
          </Button>
          <Button variant="outline" className="bg-white" onClick={() => setIsConfigOpen(true)}>
            <Settings className="w-4 h-4 mr-2 text-slate-600" /> Configurar Criterios
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsEvalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nueva Evaluación
          </Button>
        </div>
      </div>

      {/* Modal: Configurar Criterios */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar Criterios de Evaluación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label>Nombre del Criterio</Label>
                <Input value={newCriteriaName} onChange={e => setNewCriteriaName(e.target.value)} placeholder="Ej. Planeación" />
              </div>
              <div className="w-24 space-y-1">
                <Label>Puntaje Max</Label>
                <Input type="number" value={newCriteriaMax} onChange={e => setNewCriteriaMax(Number(e.target.value))} />
              </div>
              <Button onClick={handleAddCriteria} className="bg-indigo-600 hover:bg-indigo-700 text-white">Añadir</Button>
            </div>
            
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {teacherEvaluationCriteria.map(crit => (
                <div key={crit.id} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                  <div>
                    <p className="font-medium text-sm">{crit.name}</p>
                    <p className="text-xs text-slate-500">Máximo: {crit.maxScore} pts</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteTeacherEvaluationCriteria(crit.id)} className="text-red-500 h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {teacherEvaluationCriteria.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No hay criterios definidos.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Gráfica Promedios */}
      <Dialog open={isChartOpen} onOpenChange={setIsChartOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Promedio Histórico por Docente</DialogTitle>
          </DialogHeader>
          <div className="h-80 mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 10]} />
                  <RechartsTooltip />
                  <Bar dataKey="promedio" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No hay suficientes datos para graficar.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Nueva Evaluación */}
      <Dialog open={isEvalOpen} onOpenChange={setIsEvalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rúbrica de Desempeño</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4 flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Seleccionar Maestro</Label>
                  <Select value={formData.teacherId} onValueChange={(v) => {
                    setFormData({...formData, teacherId: v});
                  }}>
                    <SelectTrigger><SelectValue placeholder="Elige un docente" /></SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frecuencia</Label>
                  <Select value={formData.frequency} onValueChange={(v) => setFormData({...formData, frequency: v})}>
                    <SelectTrigger><SelectValue placeholder="Frecuencia" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensual">Mensual</SelectItem>
                      <SelectItem value="Bimestral">Bimestral</SelectItem>
                      <SelectItem value="Semestral">Semestral</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Periodo / Etiqueta</Label>
                  <Input value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-700 text-sm border-b pb-2 flex justify-between">
                  <span>Criterios de Evaluación</span>
                </h4>
                
                {teacherEvaluationCriteria.map((crit) => (
                  <div key={crit.id} className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <Label className="text-sm text-slate-600">{crit.name}</Label>
                      <span className="text-xs font-medium text-indigo-600">{formData.scores[crit.id] || 0} / {crit.maxScore}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max={crit.maxScore} 
                      value={formData.scores[crit.id] || 0} 
                      onChange={(e) => setFormData({
                        ...formData,
                        scores: { ...formData.scores, [crit.id]: Number(e.target.value) }
                      })}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                ))}
                {teacherEvaluationCriteria.length === 0 && (
                  <p className="text-sm text-slate-500 py-2">Configura primero los criterios en el menú principal.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Comentarios / Observaciones</Label>
                <Textarea 
                  value={formData.comments} 
                  onChange={e => setFormData({...formData, comments: e.target.value})} 
                  placeholder="Áreas de mejora, felicitaciones, notas..."
                  rows={3}
                />
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveEval} disabled={!formData.teacherId}>
                Guardar Evaluación
              </Button>
            </div>

            {/* Historial previo del maestro seleccionado */}
            {formData.teacherId && (
              <div className="w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-y-auto max-h-96">
                <h4 className="font-semibold text-slate-700 text-sm border-b pb-2 mb-3">Historial Previas</h4>
                {selectedTeacherHistory.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTeacherHistory.map(ev => (
                      <div key={ev.id} className="bg-white p-3 rounded shadow-sm border border-slate-100 text-xs">
                        <div className="flex justify-between font-semibold mb-1 text-slate-800">
                          <span>{ev.period}</span>
                          <span className="text-indigo-600">{(calculateTotal(ev.scores)).toFixed(1)}/10</span>
                        </div>
                        <div className="text-slate-500 mb-2">{ev.frequency} - {ev.date}</div>
                        {ev.comments && <p className="text-slate-600 italic line-clamp-2">"{ev.comments}"</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Sin historial registrado.</p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de Evaluaciones Registradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teacherEvaluations.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
            <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p>No hay evaluaciones registradas aún.</p>
          </div>
        ) : (
          teacherEvaluations.map(evalu => {
            const total = calculateTotal(evalu.scores);
            return (
              <Card key={evalu.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold shrink-0">
                      <UserCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 truncate max-w-[140px]">{getTeacherName(evalu.teacherId)}</h3>
                      <div className="flex items-center text-xs text-slate-500 mt-1">
                        <CalendarIcon className="w-3 h-3 mr-1" /> {evalu.date} ({evalu.frequency || "Mensual"})
                      </div>
                    </div>
                  </div>
                  <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-current" /> {total.toFixed(1)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2 text-xs font-semibold text-slate-700">
                    Periodo: {evalu.period}
                  </div>
                  <div className="grid grid-cols-1 gap-y-1 text-xs mb-4">
                    {Object.keys(evalu.scores).map(key => {
                      const criteria = teacherEvaluationCriteria.find(c => c.id === key);
                      const name = criteria ? criteria.name : `Antiguo: ${key}`;
                      const max = criteria ? criteria.maxScore : 5;
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-slate-500 truncate mr-2">{name}:</span>
                          <span className="font-medium shrink-0">{evalu.scores[key]}/{max}</span>
                        </div>
                      )
                    })}
                  </div>
                  {evalu.comments && (
                    <div className="bg-slate-50 p-3 rounded text-xs text-slate-600 border border-slate-100">
                      <span className="font-semibold block mb-1">Observaciones:</span>
                      {evalu.comments}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-8" onClick={() => deleteTeacherEvaluation(evalu.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
