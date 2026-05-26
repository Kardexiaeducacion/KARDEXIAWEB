"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ShieldCheck, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Login() {
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await loginUser(email, password);
    if (!success) {
      setError("Correo o contraseña incorrectos o sin internet.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Kardexia Logo" className="w-56 h-56 object-contain drop-shadow-2xl mix-blend-multiply scale-[1.2]" />
          </div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-800 uppercase">Kardexia</h1>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full transform -translate-y-2">Pro</span>
            </div>
            <p className="text-slate-500 font-medium italic">"Del caos al kárdex en 3 segundos"</p>
          </div>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-100">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="ejemplo@escuela.edu" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base">
                Entrar al Sistema
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              ¿No tienes una cuenta?{" "}
              <Link href="/registro" className="text-indigo-600 font-semibold hover:underline">
                Regístrate aquí
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="h-4 w-4" />
          Acceso Seguro Autorizado
        </div>
      </div>
    </div>
  );
}
