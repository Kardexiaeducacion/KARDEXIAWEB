"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, Download, Trash2, Edit, ChevronLeft, Users, GraduationCap, Filter } from "lucide-react";

type GlobalStudent = {
  id: string;
  name: string;
  groupName: string;
};

export default function FinanzasDirectorPage() {
  const { financeConcepts, addFinanceConcept, deleteFinanceConcept, financePayments, addOrUpdateFinancePayment } = useAppContext();
  const { users } = useAuth();
  
  // Extraer maestros
  const teachers = users.filter(u => u.role === "teacher");
  
  // Extraer todos los alumnos de los localStorage de los maestros
  const [allStudents, setAllStudents] = useState<GlobalStudent[]>([]);

  useEffect(() => {
    let aggregated: GlobalStudent[] = [];
    teachers.forEach(teacher => {
      try {
        const saved = localStorage.getItem(`eduPanelData_${teacher.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          const tGroups = parsed.groups || [];
          const tStudents = parsed.students || [];

          tStudents.forEach((student: any) => {
            const group = tGroups.find((g: any) => g.id === student.groupId);
            aggregated.push({
              id: student.id,
              name: student.name,
              groupName: group ? group.name : "Sin grupo"
            });
          });
        }
      } catch (e) {}
    });
    aggregated.sort((a, b) => a.name.localeCompare(b.name));
    setAllStudents(aggregated);
  }, [users]);

  // Extract unique groups for filter
  const uniqueGroups = Array.from(new Set(allStudents.map(s => s.groupName))).filter(Boolean).sort();

  // Conceptos del director
  const directorConcepts = financeConcepts.filter(c => c.groupId === "director_global");

  const [isAddConceptOpen, setIsAddConceptOpen] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [newConcept, setNewConcept] = useState({ title: "", amount: 0, targetType: "student" as "student" | "teacher", frequency: "Único" });
  const [paymentInputs, setPaymentInputs] = useState<Record<string, number>>({});
  const [filterGroup, setFilterGroup] = useState("all");

  const handleAddConcept = () => {
    if (newConcept.title && newConcept.amount > 0) {
      addFinanceConcept({
        groupId: "director_global",
        title: newConcept.title,
        amount: newConcept.amount,
        date: new Date().toISOString().split("T")[0],
        targetType: newConcept.targetType,
        frequency: newConcept.frequency
      });
      setIsAddConceptOpen(false);
      setNewConcept({ title: "", amount: 0, targetType: "student", frequency: "Único" });
    }
  };

  const handleSavePayment = (payerId: string, amountPaid: number) => {
    if (!selectedConcept) return;
    addOrUpdateFinancePayment({
      conceptId: selectedConcept,
      payerId: payerId,
      amountPaid: amountPaid,
      date: new Date().toISOString().split("T")[0]
    });
  };

  const getPaymentDetailsForPayer = (payerId: string, conceptId: string) => {
    return financePayments.find(p => p.conceptId === conceptId && p.payerId === payerId);
  };

  const activeConceptDetails = directorConcepts.find(c => c.id === selectedConcept);

  // Determinar la lista de "pagadores" (maestros o alumnos) según el tipo de concepto activo
  const basePayersList = activeConceptDetails?.targetType === "teacher" 
    ? teachers.map(t => ({ id: t.id, name: t.name, subtitle: "Maestro", group: "Maestros" })) 
    : allStudents.map(s => ({ id: s.id, name: s.name, subtitle: s.groupName, group: s.groupName }));

  const activePayersList = basePayersList.filter(p => {
    if (activeConceptDetails?.targetType !== "student") return true;
    if (filterGroup === "all") return true;
    return p.group === filterGroup;
  });

  const exportToCSV = (concept: any) => {
    let csv = `Nombre,Rol/Grupo,Monto Total,Monto Pagado,Monto Faltante,Estado,Frecuencia\n`;
    
    activePayersList.forEach(payer => {
      const payment = getPaymentDetailsForPayer(payer.id, concept.id);
      const paid = payment?.amountPaid || 0;
      const missing = concept.amount - paid;
      const status = missing <= 0 ? "Pagado" : (paid > 0 ? "Abonado" : "Pendiente");
      csv += `"${payer.name}","${payer.subtitle}",$${concept.amount},$${paid},$${missing},${status},${concept.frequency || "Único"}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `FinanzasEscolares_${concept.title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Finanzas Escolares</h2>
          <p className="text-slate-500 text-sm mt-1">Gestión de cobros globales a nivel institución</p>
        </div>
        
        {!selectedConcept && (
          <Dialog open={isAddConceptOpen} onOpenChange={setIsAddConceptOpen}>
            <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700 text-white" />}>
              <Plus className="w-4 h-4 mr-2" /> Nuevo Cobro Global
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Cobro Global</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>¿A quién va dirigido este cobro?</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg flex-1 hover:bg-slate-50">
                      <input 
                        type="radio" 
                        name="target" 
                        checked={newConcept.targetType === "student"} 
                        onChange={() => setNewConcept({...newConcept, targetType: "student"})} 
                      />
                      <GraduationCap className="w-4 h-4 text-slate-500" /> Alumnos
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-lg flex-1 hover:bg-slate-50">
                      <input 
                        type="radio" 
                        name="target" 
                        checked={newConcept.targetType === "teacher"} 
                        onChange={() => setNewConcept({...newConcept, targetType: "teacher"})} 
                      />
                      <Users className="w-4 h-4 text-slate-500" /> Maestros
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Título del Concepto</Label>
                  <Input value={newConcept.title} onChange={e => setNewConcept({...newConcept, title: e.target.value})} placeholder="Ej. Cuota Padres de Familia, Uniformes..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frecuencia de Pago</Label>
                    <Select value={newConcept.frequency} onValueChange={(v) => setNewConcept({...newConcept, frequency: v})}>
                      <SelectTrigger><SelectValue placeholder="Frecuencia" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Único">Único</SelectItem>
                        <SelectItem value="Mensual">Mensual</SelectItem>
                        <SelectItem value="Bimestral">Bimestral</SelectItem>
                        <SelectItem value="Semestral">Semestral</SelectItem>
                        <SelectItem value="Anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Monto por persona ($)</Label>
                    <Input type="number" min="0" step="0.5" value={newConcept.amount || ""} onChange={e => setNewConcept({...newConcept, amount: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleAddConcept} disabled={!newConcept.title || newConcept.amount <= 0}>
                  Crear Concepto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedConcept ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {directorConcepts.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-dashed border-slate-300 rounded-lg text-slate-500 bg-white">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No tienes ningún cobro global registrado.</p>
            </div>
          ) : (
            directorConcepts.map(concept => {
              const payers = concept.targetType === "teacher" ? teachers : allStudents;
              const totalExpected = concept.amount * payers.length;
              const totalCollected = payers.reduce((sum, p) => sum + (getPaymentDetailsForPayer(p.id, concept.id)?.amountPaid || 0), 0);
              const progress = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

              return (
                <Card key={concept.id} className="border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow hover:border-emerald-200" onClick={() => { setSelectedConcept(concept.id); setFilterGroup("all"); }}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{concept.title}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          {concept.targetType === "teacher" ? <Users className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                          Dirigido a: {concept.targetType === "teacher" ? "Maestros" : "Alumnos"}
                          <span className="mx-1">•</span> {concept.frequency || "Único"}
                        </p>
                      </div>
                      <div className="bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded text-sm">
                        ${concept.amount}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Recaudado:</span>
                        <span className="font-semibold text-emerald-600">${totalCollected.toFixed(2)} / ${totalExpected.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(100, progress)}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" className="text-slate-500 -ml-2 hover:bg-slate-100" onClick={() => setSelectedConcept(null)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Volver a Conceptos Generales
          </Button>

          {activeConceptDetails && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl text-slate-800">{activeConceptDetails.title}</CardTitle>
                  <CardDescription>Monto establecido: <strong className="text-slate-700">${activeConceptDetails.amount} ({activeConceptDetails.frequency || "Único"})</strong></CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-start sm:items-center">
                  {activeConceptDetails.targetType === "student" && (
                    <div className="flex items-center bg-white border border-slate-200 rounded-md px-2 w-full sm:w-auto">
                      <Filter className="w-4 h-4 text-slate-400 mr-2" />
                      <select 
                        className="h-9 outline-none text-sm bg-transparent flex-1"
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                      >
                        <option value="all">Todos los Grupos</option>
                        {uniqueGroups.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => exportToCSV(activeConceptDetails)} className="flex-1 sm:flex-none">
                    <Download className="w-4 h-4 mr-2" /> CSV
                  </Button>
                  <Button variant="destructive" onClick={() => { deleteFinanceConcept(selectedConcept); setSelectedConcept(null); }} className="flex-none">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[300px]">Nombre</TableHead>
                      <TableHead className="text-right">Monto Pagado</TableHead>
                      <TableHead className="text-right">Faltante</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activePayersList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">No hay registros para mostrar en esta categoría/grupo.</TableCell>
                      </TableRow>
                    ) : (
                      activePayersList.map(payer => {
                        const payment = getPaymentDetailsForPayer(payer.id, activeConceptDetails.id);
                        const paid = payment?.amountPaid || 0;
                        const missing = activeConceptDetails.amount - paid;
                        const isFullyPaid = missing <= 0;
                        const inputVal = paymentInputs[payer.id] !== undefined ? paymentInputs[payer.id] : paid;

                        return (
                          <TableRow key={payer.id} className={isFullyPaid ? "bg-emerald-50/30" : ""}>
                            <TableCell className="font-medium text-slate-700">
                              <div className="flex flex-col">
                                <span>{payer.name}</span>
                                <span className="text-xs text-slate-500">{payer.subtitle}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-slate-500">$</span>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max={activeConceptDetails.amount}
                                  step="0.5"
                                  className={`w-24 text-right h-8 ${isFullyPaid ? "border-emerald-200 bg-emerald-50" : ""}`}
                                  value={inputVal || ""}
                                  onChange={(e) => setPaymentInputs({...paymentInputs, [payer.id]: parseFloat(e.target.value) || 0})}
                                />
                              </div>
                              {paid > 0 && payment?.date && (
                                <div className="text-[10px] text-slate-400 mt-1 mr-1">Actualizado: {payment.date}</div>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-600">
                              ${missing.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {isFullyPaid ? (
                                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-semibold">Pagado</span>
                              ) : paid > 0 ? (
                                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-semibold">Abono</span>
                              ) : (
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-semibold">Pendiente</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                className={inputVal !== paid ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-200 text-slate-500 hover:bg-slate-300"}
                                onClick={() => handleSavePayment(payer.id, inputVal)}
                                disabled={inputVal === paid}
                              >
                                Guardar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
