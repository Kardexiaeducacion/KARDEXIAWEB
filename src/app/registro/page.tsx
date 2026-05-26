"use client";

import { useState } from "react";
import { useAuth, Role } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, ShieldCheck, Mail, Lock, User, Building, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Registro() {
  const { registerUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "teacher" as Role,
    school: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    const result = await registerUser(formData);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || "Ocurrió un error al registrarte.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Kardexia Logo" className="w-48 h-48 object-contain drop-shadow-xl mix-blend-multiply scale-[1.2]" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 uppercase">Kardexia</h1>
            <p className="text-base text-slate-500 font-medium italic mt-2">Del caos al kárdex en 3 segundos</p>
          </div>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Crear Cuenta</CardTitle>
            <CardDescription className="text-center">
              Regístrate para empezar a usar la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">Rol en la Institución</Label>
                <Select value={formData.role} onValueChange={(v: Role) => setFormData({...formData, role: v})}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona tu rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Profesor(a) / Docente</SelectItem>
                    <SelectItem value="director">Director(a) / Coordinador(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Ej. Juan Pérez" 
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">Institución Educativa (Opcional)</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="school" 
                    type="text" 
                    placeholder="Ej. Primaria Benito Juárez" 
                    className="pl-10"
                    value={formData.school}
                    onChange={(e) => setFormData({...formData, school: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="ejemplo@escuela.edu" 
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required 
                  />
                </div>
                <p className="text-xs text-slate-500">Mínimo 6 caracteres</p>
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base mt-2">
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                Inicia sesión aquí
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="h-4 w-4" />
          Tus datos se guardan de forma local y segura
        </div>
      </div>
    </div>
  );
}
