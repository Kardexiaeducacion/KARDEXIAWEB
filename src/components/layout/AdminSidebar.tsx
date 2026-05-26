"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  LifeBuoy,
  CreditCard,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Usuarios Registrados", href: "/admin/usuarios", icon: Users },
  { name: "Suscripciones", href: "/admin/suscripciones", icon: CreditCard },
  { name: "Soporte Técnico", href: "/admin/soporte", icon: LifeBuoy },
  { name: "Configuración", href: "/admin/configuracion", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-slate-100 border-r border-slate-800">
      <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-4 shrink-0">
        <img src="/logo.png" alt="Kardexia Logo" className="w-12 h-12 object-contain brightness-0 invert" />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">Kardexia</h1>
          <span className="text-xs text-emerald-400 font-semibold tracking-wider">Super Admin</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-emerald-400" : "text-slate-500")} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
