"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Search, Filter, BookOpen, Download, HeartPulse } from "lucide-react";
import * as XLSX from "xlsx";

type GlobalStudent = {
  id: string;
  name: string;
  tutor: { name: string; phone: string; email: string };
  teacherId: string;
  teacherName: string;
  groupId: string;
  groupName: string;
  grade: string;
  medicalNote?: { bloodType: string; illnesses: string; allergies: string; other: string };
};

export default function DirectorAlumnosPage() {
  const { users } = useAuth();
  const [allStudents, setAllStudents] = useState<GlobalStudent[]>([]);
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  
  const [selectedStudent, setSelectedStudent] = useState<GlobalStudent | null>(null);
  const [isMedicalOpen, setIsMedicalOpen] = useState(false);
  const [medicalForm, setMedicalForm] = useState({ bloodType: "", illnesses: "", allergies: "", other: "" });

  const loadStudents = () => {
    const teachers = users.filter(u => u.role === "teacher");
    let aggregated: GlobalStudent[] = [];

    teachers.forEach(teacher => {
      try {
        const saved = localStorage.getItem(`eduPanelData_${teacher.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          const teacherGroups = parsed.groups || [];
          const teacherStudents = parsed.students || [];

          teacherStudents.forEach((student: any) => {
            const group = teacherGroups.find((g: any) => g.id === student.groupId);
            if (group) {
              aggregated.push({
                id: student.id,
                name: student.name,
                tutor: student.tutor || { name: "N/A", phone: "N/A", email: "" },
                teacherId: teacher.id,
                teacherName: teacher.name,
                groupId: group.id,
                groupName: group.name || group.grade || "Sin Grupo",
                grade: group.grade || "Sin Grado",
                medicalNote: student.medicalNote || { bloodType: "", illnesses: "", allergies: "", other: "" }
              });
            }
          });
        }
      } catch (e) {
        console.error(`Error loading data for teacher ${teacher.name}`, e);
      }
    });

    aggregated.sort((a, b) => a.name.localeCompare(b.name));
    setAllStudents(aggregated);
  };

  useEffect(() => {
    loadStudents();
  }, [users]);

  const uniqueGroups = Array.from(new Set(allStudents.map(s => s.groupName))).filter(Boolean).sort();

  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                          student.groupName.toLowerCase().includes(search.toLowerCase()) ||
                          student.teacherName.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = filterGroup === "all" || student.groupName === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const exportToExcel = () => {
    const dataToExport = filteredStudents.map(s => ({
      "Alumno": s.name,
      "Grupo": s.groupName,
      "Grado": s.grade,
      "Maestro": s.teacherName,
      "Tutor": s.tutor.name,
      "Teléfono Tutor": s.tutor.phone,
      "Tipo de Sangre": s.medicalNote?.bloodType || "N/A",
      "Enfermedades": s.medicalNote?.illnesses || "N/A",
      "Alergias": s.medicalNote?.allergies || "N/A",
      "Notas Médicas": s.medicalNote?.other || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Directorio");
    XLSX.writeFile(workbook, `Directorio_Escolar_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleOpenMedical = (student: GlobalStudent) => {
    setSelectedStudent(student);
    setMedicalForm(student.medicalNote || { bloodType: "", illnesses: "", allergies: "", other: "" });
    setIsMedicalOpen(true);
  };

  const handleSaveMedical = () => {
    if (!selectedStudent) return;
    
    // We must read the teacher's data, update the student, and save it back
    try {
      const storageKey = `eduPanelData_${selectedStudent.teacherId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const studentIndex = parsed.students.findIndex((s: any) => s.id === selectedStudent.id);
        if (studentIndex >= 0) {
          parsed.students[studentIndex].medicalNote = medicalForm;
          localStorage.setItem(storageKey, JSON.stringify(parsed));
          
          // Refresh global state
          setAllStudents(prev => prev.map(s => 
            s.id === selectedStudent.id ? { ...s, medicalNote: medicalForm } : s
          ));
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    setIsMedicalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Directorio Escolar</h2>
          <p className="text-slate-500 text-sm mt-1">
            Vista global de todos los alumnos inscritos en la institución ({allStudents.length} en total)
          </p>
        </div>
        <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white">
          <Download className="w-4 h-4 mr-2" /> Exportar (Semestre/Año)
        </Button>
      </div>

      <Dialog open={isMedicalOpen} onOpenChange={setIsMedicalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nota Médica: {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Sangre</Label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                value={medicalForm.bloodType}
                onChange={e => setMedicalForm({...medicalForm, bloodType: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Desconocido"].map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Enfermedades Crónicas</Label>
              <Textarea value={medicalForm.illnesses} onChange={e => setMedicalForm({...medicalForm, illnesses: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Alergias</Label>
              <Textarea value={medicalForm.allergies} onChange={e => setMedicalForm({...medicalForm, allergies: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Otras Notas / Contacto de Emergencia</Label>
              <Textarea value={medicalForm.other} onChange={e => setMedicalForm({...medicalForm, other: e.target.value})} />
            </div>
            <Button onClick={handleSaveMedical} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Guardar Nota Médica</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-slate-200 shadow-sm">
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por alumno, grupo o maestro..." 
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select 
              className="h-10 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm min-w-[150px]"
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
            >
              <option value="all">Todos los grupos</option>
              {uniqueGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>
        
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Tutor (Contacto)</TableHead>
                <TableHead>Maestro</TableHead>
                <TableHead>Nota Médica</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    <GraduationCap className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    No se encontraron alumnos con esos criterios.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map(student => (
                  <TableRow key={`${student.teacherId}_${student.id}`} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-800 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 text-xs">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      {student.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{student.groupName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="text-slate-700">{student.tutor.name}</span>
                        <span className="text-xs text-slate-500">{student.tutor.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                        <BookOpen className="w-3 h-3 mr-1 text-slate-400" />
                        {student.teacherName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenMedical(student)} className="text-indigo-600 hover:bg-indigo-50">
                        <HeartPulse className={`w-4 h-4 mr-2 ${student.medicalNote?.bloodType ? "text-red-500" : "text-slate-400"}`} />
                        {student.medicalNote?.bloodType ? "Ver / Editar" : "Añadir"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
