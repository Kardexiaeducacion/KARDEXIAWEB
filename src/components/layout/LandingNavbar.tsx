"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { name: "Funciones", href: "/tutoriales" },
  { name: "Precios",   href: "/suscripcion" },
  { name: "Academia",  href: "/tutoriales" },
  { name: "Comunidad", href: "/comentarios" },
  { name: "Soporte",   href: "/soporte" },
];

export function LandingNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-black/5 shadow-[0_4px_32px_-4px_rgba(0,0,0,0.08)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-8 h-8">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect width="32" height="32" rx="8" fill="#0d0d0d"/>
                <path d="M8 10h6l4 6-4 6H8l4-6-4-6z" fill="#85d3c8"/>
                <path d="M16 10h8l-4 6 4 6h-8l4-6-4-6z" fill="white" opacity="0.6"/>
              </svg>
            </div>
            <span className="text-[15px] font-bold tracking-[-0.02em] text-[#0d0d0d] group-hover:opacity-80 transition-opacity">
              Kardexia
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-200",
                    isActive
                      ? "text-slate-800"
                      : "text-[#6b7280] hover:text-slate-800"
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-[#b19cd9]/15" />
                  )}
                  <span className="relative font-semibold">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <Link href="/dashboard" className="text-[14px] font-medium text-[#6b7280] hover:text-[#0d0d0d] transition-colors px-2">
                Mi Panel
              </Link>
            ) : (
              <Link href="/login" className="text-[14px] font-medium text-[#6b7280] hover:text-[#0d0d0d] transition-colors px-2">
                Iniciar sesión
              </Link>
            )}
            <Link href="/suscripcion" className="btn-primary text-[14px] py-2.5 px-5">
              Ver Precios
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 -mr-2 text-[#0d0d0d] rounded-lg"
            aria-label="Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={cn(
        "md:hidden absolute inset-x-0 top-full bg-white border-b border-black/5 transition-all duration-300 overflow-hidden",
        isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <nav className="px-6 py-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl text-[15px] font-medium text-[#0d0d0d] hover:bg-black/[0.04] transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-4 pt-4 border-t border-black/5 flex flex-col gap-3">
            {currentUser ? (
              <Link href="/dashboard" onClick={() => setIsOpen(false)} className="btn-ghost py-3 justify-center">
                Mi Panel
              </Link>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="btn-ghost py-3 justify-center">
                Iniciar sesión
              </Link>
            )}
            <Link href="/suscripcion" onClick={() => setIsOpen(false)} className="btn-primary py-3 justify-center">
              Ver Precios
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
