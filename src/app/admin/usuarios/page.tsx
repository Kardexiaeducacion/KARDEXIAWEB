"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ShieldAlert, Edit2, Ban, MoreVertical } from "lucide-react";

// Datos de demostración ya que el RLS de Supabase bloquea lectura pública
const mockUsers = [
  { id: "1", nombre: "Yelle M", email: "yelle@kardexia.com", rol: "Maestro", escuela: "Instituto Benito Juárez", estado: "Activo", fecha_registro: "2024-05-15" },
  { id: "2", nombre: "Carlos Ramírez", email: "carlos.r@gmail.com", rol: "Director", escuela: "Secundaria Técnica 45", estado: "Inactivo", fecha_registro: "2024-05-18" },
  { id: "3", nombre: "Ana Sofía", email: "ana.profe@yahoo.com", rol: "Maestro", escuela: "Primaria Héroes", estado: "Activo", fecha_registro: "2024-05-20" },
  { id: "4", nombre: "Roberto Gómez", email: "roberto.g@hotmail.com", rol: "Maestro", escuela: "Colegio Cervantes", estado: "Prueba", fecha_registro: "2024-05-21" },
  { id: "5", nombre: "Laura Martínez", email: "laura.mtz@gmail.com", rol: "Maestro", escuela: "Primaria Benito Juárez", estado: "Activo", fecha_registro: "2024-05-22" },
];

export default function AdminUsuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredUsers = mockUsers.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.escuela.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      <div className="bg-amber-100 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Aviso de Privacidad (RLS)</h4>
          <p className="text-sm mt-1">Actualmente la base de datos de Supabase está protegiendo la información de los usuarios. Para ver la lista de usuarios reales de la base de datos, es necesario crear una clave de "Service Role" o actualizar las políticas de seguridad de la tabla "perfiles". Por el momento, estás viendo datos de demostración.</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">Directorio de Usuarios Registrados</CardTitle>
              <CardDescription>Visualiza y administra todos los maestros y directores de la plataforma.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar usuario o escuela..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo / Rol</TableHead>
                  <TableHead>Escuela</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-slate-800">{user.nombre}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600">{user.email}</span>
                          <span className="text-xs font-semibold text-indigo-500">{user.rol}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">{user.escuela}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          user.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700' :
                          user.estado === 'Prueba' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {user.estado}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">{user.fecha_registro}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600">
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
