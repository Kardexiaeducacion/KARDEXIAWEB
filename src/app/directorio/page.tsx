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
import { Input } from "@/components/ui/input";
import { Search, Phone, Mail } from "lucide-react";

export default function Directorio() {
  const { students, activeGroupId } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  const activeStudents = students.filter(s => s.groupId === activeGroupId);

  const filteredStudents = activeStudents.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(term) ||
      student.tutor.name.toLowerCase().includes(term) ||
      student.tutor.phone.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por alumno, tutor o teléfono..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-slate-500">
          Mostrando {filteredStudents.length} resultados
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Alumno</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const phoneNumeric = student.tutor.phone.replace(/\D/g, "");
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 overflow-hidden border border-slate-200">
                          {student.imageUrl ? (
                            <img src={student.imageUrl} alt={student.name} className="h-full w-full object-cover" />
                          ) : (
                            <span>{student.avatar}</span>
                          )}
                        </div>
                        {student.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {student.tutor.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-3 w-3" />
                          {student.tutor.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Mail className="h-3 w-3" />
                          {student.tutor.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <a
                        href={`https://wa.me/${phoneNumeric}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                      >
                        WhatsApp
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
