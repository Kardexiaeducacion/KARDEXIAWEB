"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Datos de demostración
const mockSubscriptions = [
  { id: "SUB-8091", usuario: "Yelle M", plan: "Anual", monto: "$1,490 MXN", fecha_pago: "15 May 2024", proximo_cobro: "15 May 2025", estado: "Activa" },
  { id: "SUB-8092", usuario: "Ana Sofía", plan: "Mensual", monto: "$149 MXN", fecha_pago: "20 May 2024", proximo_cobro: "20 Jun 2024", estado: "Activa" },
  { id: "SUB-8093", usuario: "Carlos Ramírez", plan: "Prueba 14 Días", monto: "$0 MXN", fecha_pago: "--", proximo_cobro: "01 Jun 2024", estado: "Prueba" },
  { id: "SUB-8094", usuario: "Laura Martínez", plan: "Anual", monto: "$1,490 MXN", fecha_pago: "10 Feb 2024", proximo_cobro: "10 Feb 2025", estado: "Activa" },
];

export default function AdminSuscripciones() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Suscripciones Globales</h2>
        <p className="text-slate-500">Historial de pagos y estado de las suscripciones de los usuarios.</p>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Últimos Movimientos</CardTitle>
          <CardDescription>Visualiza las suscripciones activas y en periodo de prueba.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>ID Suscripción</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha de Pago</TableHead>
                  <TableHead>Próximo Cobro</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium text-slate-700">{sub.id}</TableCell>
                    <TableCell className="font-medium text-slate-800">{sub.usuario}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                        {sub.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{sub.monto}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{sub.fecha_pago}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{sub.proximo_cobro}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        sub.estado === 'Activa' ? 'bg-emerald-100 text-emerald-700' :
                        sub.estado === 'Prueba' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {sub.estado}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
