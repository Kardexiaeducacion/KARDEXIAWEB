import Link from "next/link";
import { CloudDownload, BookOpen, BarChart3, Radio } from "lucide-react";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <LandingNavbar />
      <main className="flex flex-col bg-white min-h-screen overflow-hidden pt-16">
        {/* Background Floating Orbs for movement */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#b19cd9]/10 rounded-full blur-[80px] animate-float-slow pointer-events-none" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-[#85d3c8]/10 rounded-full blur-[100px] animate-float pointer-events-none delay-300" />

        {/* Section 1: Hero */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-32 pb-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Left: Copy */}
          <div className="flex flex-col items-start animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-800 leading-[1.1] mb-6">
              Simplifica tu Vida Escolar con Kardexia
            </h1>
            
            <p className="text-lg text-slate-600 max-w-lg mb-8 leading-relaxed">
              La plataforma de gestión académica para escuelas modernas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/suscripcion"
                className="px-8 py-4 rounded-md bg-[#b19cd9] text-white font-bold text-lg hover:bg-[#9b84c8] transition-all flex items-center justify-center shadow-[0_8px_20px_-6px_rgba(177,156,217,0.6)] animate-pulse-soft hover:scale-105"
              >
                Ver Precios
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-md border-2 border-[#85d3c8] text-[#85d3c8] font-bold text-lg hover:bg-[#85d3c8]/10 transition-colors flex items-center justify-center gap-2 group"
              >
                Iniciar sesión
                <CloudDownload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right: Abstract Monitor Mockup with Movement */}
          <div className="relative animate-fade-in-up delay-200 flex justify-center w-full mt-10 lg:mt-0">
            <div className="w-[95%] max-w-[550px] relative">
              
              {/* Floating decorative elements around monitor */}
              <div className="absolute -left-8 top-10 bg-white p-3 rounded-lg shadow-xl border border-slate-100 flex items-center gap-3 animate-float z-20">
                <div className="w-8 h-8 rounded-full bg-[#85d3c8]/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#85d3c8]" />
                </div>
                <div>
                  <div className="w-16 h-2 bg-slate-200 rounded mb-1.5" />
                  <div className="w-10 h-2 bg-slate-100 rounded" />
                </div>
              </div>

              <div className="absolute -right-6 bottom-20 bg-white p-3 rounded-lg shadow-xl border border-slate-100 flex flex-col gap-2 animate-float-slow delay-300 z-20">
                <div className="flex items-end gap-1 h-8">
                  <div className="w-3 bg-[#b19cd9] h-full rounded-sm" />
                  <div className="w-3 bg-[#85d3c8] h-[60%] rounded-sm" />
                  <div className="w-3 bg-[#b19cd9] h-[80%] rounded-sm" />
                </div>
              </div>

              {/* Monitor Bezel */}
              <div className="bg-[#2c3e50] p-3.5 rounded-t-xl rounded-b-md border-b-[16px] border-slate-300 shadow-2xl relative z-10 animate-float">
                {/* Screen Content */}
                <div className="bg-[#f4f6f8] aspect-[16/10] flex flex-col overflow-hidden relative">
                  
                  {/* Top Bar inside Screen */}
                  <div className="bg-white h-10 w-full flex items-center justify-between px-4 border-b border-slate-200">
                    <div className="w-48 h-5 bg-slate-100 rounded-md flex items-center px-2">
                      <div className="w-3 h-3 rounded-full bg-slate-300" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-slate-200" />
                      <div className="w-16 h-2 bg-slate-300 rounded" />
                    </div>
                  </div>

                  <div className="flex flex-1">
                    {/* Sidebar */}
                    <div className="w-[25%] bg-white border-r border-slate-200 flex flex-col py-4 px-3">
                      <div className="flex items-center gap-2 mb-8">
                        <BookOpen className="w-6 h-6 text-[#85d3c8]" />
                        <div className="w-16 h-3 bg-slate-800 rounded" />
                      </div>
                      <div className="w-full h-8 bg-[#f4f6f8] rounded-md mb-2 flex items-center px-2 border-l-2 border-[#b19cd9]">
                        <div className="w-12 h-2 bg-slate-800 rounded" />
                      </div>
                      <div className="w-full h-8 bg-transparent rounded-md mb-2 flex items-center px-2">
                        <div className="w-16 h-2 bg-slate-400 rounded" />
                      </div>
                      <div className="w-full h-8 bg-transparent rounded-md mb-2 flex items-center px-2">
                        <div className="w-14 h-2 bg-slate-400 rounded" />
                      </div>
                    </div>
                    
                    {/* Main Content (Donut & Bars) */}
                    <div className="flex-1 p-6 flex flex-col bg-white m-2 rounded-lg border border-slate-200 shadow-sm">
                      <div className="w-32 h-4 bg-slate-800 rounded mb-8" />
                      
                      <div className="flex items-center justify-around flex-1">
                        {/* CSS Donut Chart */}
                        <div className="relative w-32 h-32 rounded-full border-[16px] border-[#85d3c8] border-r-[#b19cd9] flex items-center justify-center shadow-inner">
                          <div className="text-center">
                            <div className="text-sm font-bold text-slate-800">Asistencia</div>
                            <div className="text-lg font-extrabold text-[#b19cd9]">Hoy</div>
                          </div>
                        </div>
                        
                        {/* CSS Bar Chart */}
                        <div className="flex items-end gap-3 h-24 border-b-2 border-slate-100 pb-1">
                          <div className="w-6 bg-[#85d3c8] h-[40%] rounded-t-sm" />
                          <div className="w-6 bg-[#b19cd9] h-[70%] rounded-t-sm" />
                          <div className="w-6 bg-[#85d3c8] h-[100%] rounded-t-sm" />
                          <div className="w-6 bg-[#b19cd9] h-[60%] rounded-t-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Monitor Stand */}
              <div className="w-1/4 h-14 bg-gradient-to-b from-slate-300 to-slate-200 mx-auto" />
              <div className="w-1/2 h-3 bg-slate-300 mx-auto rounded-t-full shadow-md" />
            </div>
          </div>
        </section>

        {/* Section 2: Features with Visual UI Mockups */}
        <section className="w-full max-w-7xl mx-auto px-6 py-24 relative z-10">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-20 animate-fade-in-up">
            Características que lo Hacen Indispensable
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
            
            {/* Feature 1: Gestión Académica (Atom -> Mini Calendar/Grid Mockup) */}
            <div className="flex flex-col items-center group animate-fade-in-up delay-100">
              {/* Mini UI Mockup */}
              <div className="w-48 h-32 bg-white rounded-xl shadow-lg border border-slate-100 p-3 flex flex-col gap-2 mb-8 group-hover:-translate-y-2 transition-transform duration-300 relative">
                <div className="absolute -z-10 inset-0 bg-[#b19cd9]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-full h-4 bg-[#b19cd9]/20 rounded-md mb-2" />
                <div className="flex gap-2 flex-1">
                  <div className="w-1/3 bg-[#85d3c8]/30 rounded-md h-[80%]" />
                  <div className="w-1/3 bg-slate-100 rounded-md h-full" />
                  <div className="w-1/3 bg-[#b19cd9]/30 rounded-md h-[60%]" />
                </div>
                <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-[#b19cd9] rounded-full flex items-center justify-center shadow-lg animate-pulse-soft">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-center px-4">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Gestión Académica Intuitiva</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Organiza horarios y asignaciones en minutos con nuestra interfaz visual.
                </p>
              </div>
            </div>

            {/* Feature 2: Expedientes (Chart -> Mini Profile Mockup) */}
            <div className="flex flex-col items-center group animate-fade-in-up delay-200">
              {/* Mini UI Mockup */}
              <div className="w-48 h-32 bg-white rounded-xl shadow-lg border border-slate-100 p-4 flex flex-col mb-8 group-hover:-translate-y-2 transition-transform duration-300 relative">
                <div className="absolute -z-10 inset-0 bg-[#85d3c8]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="flex-1">
                    <div className="w-full h-2 bg-slate-800 rounded mb-1.5" />
                    <div className="w-2/3 h-2 bg-slate-300 rounded" />
                  </div>
                </div>
                <div className="flex items-end gap-2 flex-1 border-b border-slate-100 pb-1">
                  <div className="w-full bg-[#85d3c8] h-[30%] rounded-t-sm" />
                  <div className="w-full bg-[#85d3c8] h-[60%] rounded-t-sm" />
                  <div className="w-full bg-[#85d3c8] h-[90%] rounded-t-sm" />
                </div>
                <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-[#85d3c8] rounded-full flex items-center justify-center shadow-lg animate-pulse-soft delay-100">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-center px-4">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Expedientes Accesibles</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Todo el historial académico a un toque. Visualiza el progreso instantáneamente.
                </p>
              </div>
            </div>

            {/* Feature 3: Comunicación (Wifi -> Mini Chat Mockup) */}
            <div className="flex flex-col items-center group animate-fade-in-up delay-300">
              {/* Mini UI Mockup */}
              <div className="w-48 h-32 bg-white rounded-xl shadow-lg border border-slate-100 p-3 flex flex-col gap-3 mb-8 group-hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden">
                <div className="absolute -z-10 inset-0 bg-[#b19cd9]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#85d3c8] shrink-0" />
                  <div className="w-[80%] h-10 bg-slate-100 rounded-tr-lg rounded-br-lg rounded-bl-lg p-2" />
                </div>
                <div className="flex items-start gap-2 flex-row-reverse">
                  <div className="w-6 h-6 rounded-full bg-[#b19cd9] shrink-0" />
                  <div className="w-[60%] h-8 bg-[#b19cd9]/20 rounded-tl-lg rounded-bl-lg rounded-br-lg" />
                </div>
                <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shadow-lg animate-pulse-soft delay-200">
                  <Radio className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-center px-4">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Comunicación Fluida</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Conecta a toda tu comunidad escolar. Envía notificaciones al instante.
                </p>
              </div>
            </div>
            
          </div>
        </section>

        {/* Section 3: CTA */}
        <section className="w-full bg-[#f4f6f8] py-20 flex flex-col items-center justify-center px-6 text-center mt-auto border-t border-slate-200">
          <h2 className="text-2xl md:text-3xl font-medium text-slate-800 mb-8 animate-fade-in-up">
            Transforma tu administración hoy mismo.
          </h2>
          <Link
            href="/suscripcion"
            className="px-8 py-4 rounded-md bg-[#b19cd9] text-white font-bold text-lg hover:bg-[#9b84c8] transition-all shadow-[0_8px_20px_-6px_rgba(177,156,217,0.6)] animate-fade-in-up delay-100 hover:scale-105"
          >
            Adquirir Kardexia Ahora
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
