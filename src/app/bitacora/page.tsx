"use client";

import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ShieldAlert, User, ShieldCheck } from "lucide-react";

export default function BitacoraPage() {
  const { activityLogs } = useAppContext();
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Bitácora de Movimientos</h2>
        <p className="text-slate-500 text-sm mt-1">
          Registro de auditoría de todas las acciones realizadas en el sistema.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-600" />
            Historial de Acciones
          </CardTitle>
          <CardDescription>Consulta quién realizó modificaciones en los datos.</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLogs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No hay registros en la bitácora</p>
              <p className="text-sm text-slate-400">Los movimientos que se hagan aparecerán aquí.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium text-slate-600 text-xs">
                        {format(new Date(log.date), "dd MMM yyyy, HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800">
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">{log.details}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${log.userType === 'director' ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                            {log.userType === 'director' ? 'D' : 'M'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-800">{log.userName}</span>
                            <span className="text-[10px] text-slate-500 capitalize">{log.userType}</span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
