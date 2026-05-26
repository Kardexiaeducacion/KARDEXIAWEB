"use client";

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
  ShieldAlert,
  ClipboardList,
  GraduationCap,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const directorNavItems = [
  { name: "Dashboard General", href: "/director", icon: LayoutDashboard },
  { name: "Plantilla y Expedientes", href: "/director/maestros", icon: Contact },
  { name: "Directorio Escolar", href: "/director/alumnos", icon: GraduationCap },
  { name: "Finanzas Escolares", href: "/director/finanzas", icon: DollarSign },
  { name: "Agendar Citas", href: "/director/citas", icon: Contact },
  { name: "Evaluación Docente", href: "/director/evaluaciones", icon: ClipboardList },
  { name: "Agenda Escolar", href: "/director/agenda", icon: Calendar },
  { name: "Bitácora", href: "/bitacora", icon: ShieldAlert },
];

export function DirectorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logoutUser, activeTeacherId, setActiveTeacherId } = useAuth();

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const isSupervising = !!activeTeacherId;

  return (
    <div className="flex h-screen w-64 flex-col bg-indigo-950 border-r border-indigo-900 text-indigo-100">
      <div className="flex h-16 items-center px-6 border-b border-indigo-900 justify-between bg-indigo-950">
        <h1 className="text-xl font-bold text-white tracking-tight">DirectorPanel</h1>
      </div>
      
      {isSupervising && (
        <div className="p-4 border-b border-indigo-900 bg-indigo-900/50">
          <button 
            onClick={() => setActiveTeacherId(null)}
            className="w-full text-xs bg-amber-500 text-amber-950 hover:bg-amber-400 font-bold py-2 rounded-md transition-colors"
          >
            ← Terminar Supervisión
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-3">
          {directorNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-indigo-200" : "text-indigo-400"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-indigo-900 bg-indigo-950">
        <div className="flex flex-col gap-3">
          <div className="flex items-center overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center text-indigo-100 font-bold shrink-0 overflow-hidden border border-indigo-700">
              {currentUser?.photo ? (
                <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser?.name.charAt(0).toUpperCase() || "D"
              )}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-white truncate">{currentUser?.name || "Director"}</p>
              <p className="text-xs text-indigo-300 capitalize">Administrador</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full py-2 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-md transition-colors border border-red-400/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
