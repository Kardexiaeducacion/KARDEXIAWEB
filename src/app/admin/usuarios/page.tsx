"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ShieldCheck, Edit2, Ban, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  escuela: string;
  estado_suscripcion: string;
  fecha_registro: string;
};

export default function AdminUsuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from Supabase using RLS
  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .order("fecha_registro", { ascending: false });

        if (error) throw error;
        setUsuarios(data || []);
      } catch (err: any) {
        console.error("Error al cargar usuarios:", err);
        setError("No se pudieron cargar los usuarios. Verifica tus permisos RLS en Supabase.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ estado_suscripcion: newStatus })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, estado_suscripcion: newStatus } : u))
      );
      
      alert(`Estado actualizado a ${newStatus} exitosamente.`);
    } catch (err: any) {
      console.error("Error al actualizar estado:", err);
      alert("Hubo un error al actualizar el estado. ¿Tienes los permisos de Administrador?");
    }
  };

  const filteredUsers = usuarios.filter((u) =>
    (u.nombre?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.escuela?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Seguridad RLS Activada</h4>
          <p className="text-sm mt-1">
            Estás consultando los datos reales. Supabase (Row Level Security) está protegiendo esta vista. Solo podrás visualizar y modificar la información si tienes el rol adecuado.
          </p>
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
          {error && (
            <div className="p-4 mb-4 text-rose-700 bg-rose-50 rounded-md border border-rose-200">
              {error}
            </div>
          )}

          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo / Rol</TableHead>
                  <TableHead>Escuela</TableHead>
                  <TableHead>Estado de Suscripción</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                      <p className="mt-2 text-slate-500">Cargando base de datos...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No se encontraron usuarios o el RLS bloqueó la consulta.
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
                        <Select 
                          value={user.estado_suscripcion || "Prueba"} 
                          onValueChange={(val) => handleStatusChange(user.id, val)}
                        >
                          <SelectTrigger className="w-36 h-8 text-xs font-semibold">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Activa">
                              <span className="flex items-center gap-2 text-emerald-700">
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Activa
                              </span>
                            </SelectItem>
                            <SelectItem value="Desactivada">
                              <span className="flex items-center gap-2 text-rose-700">
                                <span className="h-2 w-2 rounded-full bg-rose-500"></span> Desactivada
                              </span>
                            </SelectItem>
                            <SelectItem value="Prueba">
                              <span className="flex items-center gap-2 text-amber-700">
                                <span className="h-2 w-2 rounded-full bg-amber-500"></span> Prueba
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
