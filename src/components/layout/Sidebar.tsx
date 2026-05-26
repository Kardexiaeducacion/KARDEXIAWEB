"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Contact,
  Calendar,
  CheckSquare,
  Award,
  TableProperties,
  FileText,
  AlertTriangle,
  BookOpen,
  UsersRound,
  GraduationCap,
  Settings,
  ShieldAlert,
  DollarSign,
  Clock,
  Library,
  Palette,
  MessageCircle
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Mi Perfil", href: "/perfil", icon: Contact },
  { name: "Alumnos", href: "/alumnos", icon: GraduationCap },
  { name: "Asistencia", href: "/asistencia", icon: Users },
  { name: "Directorio", href: "/directorio", icon: Contact },
  { name: "Horario", href: "/horario", icon: Clock },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Tareas", href: "/tareas", icon: CheckSquare },
  { name: "Exámenes", href: "/examenes", icon: FileText },
  { name: "Participación", href: "/participacion", icon: Award },
  { name: "Conducta", href: "/conducta", icon: ShieldAlert },
  { name: "Calificaciones", href: "/calificaciones", icon: TableProperties },
  { name: "Material Didáctico", href: "/material", icon: Library },
  { name: "Canva", href: "/canva", icon: Palette },
  { name: "WhatsApp Web", href: "/whatsapp", icon: MessageCircle },
  { name: "Observaciones", href: "/observaciones", icon: FileText },
  { name: "Incidencias", href: "/incidencias", icon: AlertTriangle },
  { name: "Anecdotario", href: "/anecdotario", icon: BookOpen },
  { name: "Reuniones", href: "/reuniones", icon: UsersRound },
  { name: "Finanzas", href: "/finanzas", icon: DollarSign },
  { name: "Herramientas", href: "/sorteos", icon: Settings },
  { name: "Grupos", href: "/grupos", icon: Settings },
  { name: "Materias", href: "/materias", icon: BookOpen },
  { name: "Bitácora", href: "/bitacora", icon: ShieldAlert },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { groups, activeGroupId, setActiveGroupId } = useAppContext();
  const { currentUser, isReadOnly, logoutUser, setActiveTeacherId } = useAuth();
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.userAgent) {
      if (window.navigator.userAgent.toLowerCase().includes("electron")) {
        setIsElectron(true);
      }
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-slate-200">
      <div className="h-20 flex items-center px-6 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm gap-4 shrink-0 overflow-visible">
        <img src="/logo.png" alt="Kardexia Logo" className="w-20 h-20 object-contain mix-blend-multiply scale-[1.5] -ml-2" />
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight uppercase mt-1">Kardexia</h1>
      </div>
      
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Grupo Activo</p>
        <Select value={activeGroupId} onValueChange={setActiveGroupId}>
          <SelectTrigger className="bg-white border-slate-200 shadow-sm h-9">
            <SelectValue placeholder="Seleccionar grupo">
              {groups.find(g => g.id === activeGroupId)?.name || "Seleccionar grupo"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {groups.map(g => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {isReadOnly && (
          <button 
            onClick={() => {
              setActiveTeacherId(null);
              router.push("/director");
            }}
            className="w-full mt-3 text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 font-semibold py-2 rounded-md transition-colors border border-amber-200"
          >
            ← Volver al Panel Director
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            // Ocultar WhatsApp Web si NO estamos en Electron (solo escritorio)
            if (item.name === "WhatsApp Web" && !isElectron) {
              return null;
            }
            
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-indigo-600" : "text-slate-400"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex flex-col gap-3">
          <div className="flex items-center overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 overflow-hidden border border-slate-200">
              {currentUser?.photo ? (
                <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser?.name.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-slate-700 truncate">{currentUser?.name || "Usuario"}</p>
              <p className="text-xs text-slate-500 capitalize">{currentUser?.role === "teacher" ? "Maestro" : "Director"}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
