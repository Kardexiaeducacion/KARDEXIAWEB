"use client";

import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Plus, Download, Trash2, Edit, ChevronLeft } from "lucide-react";

export default function FinanzasMaestroPage() {
  const { activeGroupId, students, financeConcepts, addFinanceConcept, deleteFinanceConcept, financePayments, addOrUpdateFinancePayment } = useAppContext();
  
  const groupStudents = students.filter(s => s.groupId === activeGroupId);
  const groupConcepts = financeConcepts.filter(c => c.groupId === activeGroupId && c.targetType === "student");

  const [isAddConceptOpen, setIsAddConceptOpen] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);
  const [newConcept, setNewConcept] = useState({ title: "", amount: 0 });
  const [paymentInputs, setPaymentInputs] = useState<Record<string, number>>({});

  const handleAddConcept = () => {
    if (newConcept.title && newConcept.amount > 0) {
      addFinanceConcept({
        groupId: activeGroupId,
        title: newConcept.title,
        amount: newConcept.amount,
        date: new Date().toISOString().split("T")[0],
        targetType: "student"
      });
      setIsAddConceptOpen(false);
      setNewConcept({ title: "", amount: 0 });
    }
  };

  const handleSavePayment = (studentId: string, amountPaid: number) => {
    if (!selectedConcept) return;
    addOrUpdateFinancePayment({
      conceptId: selectedConcept,
      payerId: studentId,
      amountPaid: amountPaid,
      date: new Date().toISOString().split("T")[0]
    });
  };

  const getPaymentDetailsForStudent = (studentId: string, conceptId: string) => {
    return financePayments.find(p => p.conceptId === conceptId && p.payerId === studentId);
  };

  const exportToCSV = (concept: any) => {
    let csv = `Alumno,Monto Total,Monto Pagado,Monto Faltante,Estado\n`;
    groupStudents.forEach(student => {
      const payment = getPaymentDetailsForStudent(student.id, concept.id);
      const paid = payment?.amountPaid || 0;
      const missing = concept.amount - paid;
      const status = missing <= 0 ? "Pagado" : (paid > 0 ? "Abonado" : "Pendiente");
      csv += `"${student.name}",$${concept.amount},$${paid},$${missing},${status},${payment?.date || ""}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Finanzas_${concept.title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeConceptDetails = groupConcepts.find(c => c.id === selectedConcept);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Control Financiero</h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona cobros y aportaciones de los alumnos</p>
        </div>
        
        {!selectedConcept && (
          <Dialog open={isAddConceptOpen} onOpenChange={setIsAddConceptOpen}>
            <DialogTrigger render={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Nuevo Concepto de Cobro
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Concepto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Título (Ej. Convivio Día del Niño, Materiales)</Label>
                  <Input value={newConcept.title} onChange={e => setNewConcept({...newConcept, title: e.target.value})} placeholder="Nombre del cobro" />
                </div>
                <div className="space-y-2">
                  <Label>Monto a pagar por alumno ($)</Label>
                  <Input type="number" min="0" step="0.5" value={newConcept.amount || ""} onChange={e => setNewConcept({...newConcept, amount: parseFloat(e.target.value) || 0})} />
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
          {groupConcepts.length === 0 ? (
            <div className="col-span-full py-12 text-center border border-dashed border-slate-300 rounded-lg text-slate-500 bg-white">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p>No tienes ningún concepto de cobro registrado en este grupo.</p>
            </div>
          ) : (
            groupConcepts.map(concept => {
              const totalExpected = concept.amount * groupStudents.length;
              const totalCollected = groupStudents.reduce((sum, s) => sum + (getPaymentDetailsForStudent(s.id, concept.id)?.amountPaid || 0), 0);
              const progress = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

              return (
                <Card key={concept.id} className="border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow hover:border-emerald-200" onClick={() => setSelectedConcept(concept.id)}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{concept.title}</h3>
                        <p className="text-xs text-slate-500">{concept.date}</p>
                      </div>
                      <div className="bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded text-sm">
                        ${concept.amount} <span className="text-xs font-normal">c/u</span>
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
            <ChevronLeft className="w-4 h-4 mr-1" /> Volver a Conceptos
          </Button>

          {activeConceptDetails && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl text-slate-800">{activeConceptDetails.title}</CardTitle>
                  <CardDescription>Monto establecido: <strong className="text-slate-700">${activeConceptDetails.amount}</strong> por alumno</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={() => exportToCSV(activeConceptDetails)} className="flex-1 sm:flex-none">
                    <Download className="w-4 h-4 mr-2" /> Exportar CSV
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
                      <TableHead className="w-[300px]">Alumno</TableHead>
                      <TableHead className="text-right">Monto Pagado</TableHead>
                      <TableHead className="text-right">Faltante</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupStudents.map(student => {
                      const payment = getPaymentDetailsForStudent(student.id, activeConceptDetails.id);
                      const paid = payment?.amountPaid || 0;
                      const missing = activeConceptDetails.amount - paid;
                      const isFullyPaid = missing <= 0;
                      const inputVal = paymentInputs[student.id] !== undefined ? paymentInputs[student.id] : paid;

                      return (
                        <TableRow key={student.id} className={isFullyPaid ? "bg-emerald-50/30" : ""}>
                          <TableCell className="font-medium text-slate-700">
                            {student.name}
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
                                onChange={(e) => setPaymentInputs({...paymentInputs, [student.id]: parseFloat(e.target.value) || 0})}
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
                              onClick={() => handleSavePayment(student.id, inputVal)}
                              disabled={inputVal === paid}
                            >
                              Guardar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
