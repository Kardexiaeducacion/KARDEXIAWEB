"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { DirectorSidebar } from "@/components/layout/DirectorSidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Header } from "@/components/layout/Header";

export const RootWrapper = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, activeTeacherId } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const isElectron = typeof window !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron');
    if (isElectron && pathname === "/") {
      router.replace("/login");
      return;
    }

    const isAuthRoute = pathname === "/login" || pathname === "/registro" || pathname === "/suscripcion" || pathname === "/";
    
    if (!currentUser && !isAuthRoute) {
      router.push("/login");
    } else if (currentUser && isAuthRoute) {
      if (currentUser.role === "superadmin") {
        router.push("/admin");
      } else if (currentUser.role === "director") {
        router.push("/director");
      } else {
        router.push("/dashboard");
      }
    } else if (currentUser && !isAuthRoute) {
      // Prevent normal users from accessing admin routes
      if (pathname.startsWith("/admin") && currentUser.role !== "superadmin") {
        router.push("/dashboard");
      }
      // Prevent superadmin from accessing non-admin routes
      if (!pathname.startsWith("/admin") && currentUser.role === "superadmin") {
        router.push("/admin");
      }
    }
  }, [currentUser, pathname, router, mounted]);

  if (!mounted) return null; // Avoid hydration mismatch

  const isAuthRoute = pathname === "/login" || pathname === "/registro" || pathname === "/suscripcion" || pathname === "/";

  // Si estamos en electron, la ruta "/" se redirige en el useEffect, pero evitamos renderizar la portada mientras tanto
  const isElectron = typeof window !== 'undefined' && navigator.userAgent.toLowerCase().includes('electron');
  if (isElectron && pathname === "/") return null;

  if (isAuthRoute) {
    return <main className="h-screen w-full overflow-y-auto bg-slate-50">{children}</main>;
  }

  if (!currentUser) return null; // Wait for redirect

  const isSuperAdmin = currentUser.role === "superadmin";
  const isDirectorNotSupervising = currentUser.role === "director" && !activeTeacherId;

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {isSuperAdmin ? <AdminSidebar /> : isDirectorNotSupervising ? <DirectorSidebar /> : <Sidebar />}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
