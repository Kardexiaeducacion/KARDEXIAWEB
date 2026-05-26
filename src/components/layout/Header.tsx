"use client";

import { usePathname } from "next/navigation";
import { Bell, Eye, MessageSquarePlus, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const routeNames: Record<string, string> = {
  "/": "Dashboard Principal",
  "/asistencia": "Registro de Asistencia",
  "/directorio": "Directorio de Padres",
  "/agenda": "Agenda Escolar",
  "/tareas": "Actividades y Tareas",
  "/participacion": "Participación en Clase",
  "/calificaciones": "Integrador de Calificaciones",
  "/observaciones": "Generador de Observaciones",
  "/incidencias": "Bitácora de Incidencias",
  "/anecdotario": "Anecdotario del Maestro",
  "/reuniones": "Control de Reuniones",
  "/director": "Panel de Dirección",
  "/director/maestros": "Plantilla y Expedientes",
  "/director/padres": "Directorio de Padres",
  "/director/evaluaciones": "Evaluación Docente",
  "/director/citas": "Citas Directivas",
  "/director/agenda": "Agenda Escolar",
  "/director/alumnos": "Directorio Escolar",
  "/director/finanzas": "Finanzas Escolares",
  "/sorteos": "Herramientas de Clase",
  "/finanzas": "Control Financiero",
  "/horario": "Horario Escolar",
  "/admin": "Panel de Super Administrador",
  "/admin/usuarios": "Gestión de Usuarios",
  "/admin/suscripciones": "Suscripciones Globales",
  "/admin/soporte": "Centro de Soporte Técnico",
  "/admin/configuracion": "Configuración del Sistema",
};

export function Header() {
  const pathname = usePathname();
  const title = routeNames[pathname] || "Dashboard";

  const { currentUser, isReadOnly, activeTeacherId, notes, addNote, markNoteAsRead, users } = useAuth();
  const [noteContent, setNoteContent] = useState("");
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isReadNoteOpen, setIsReadNoteOpen] = useState(false);

  const activeTeacher = users.find(u => u.id === activeTeacherId);
  
  // Notes addressed to the current teacher
  const teacherNotes = notes.filter(n => n.teacherId === currentUser?.id);
  const unreadNotes = teacherNotes.filter(n => !n.read);

  const handleAddNote = () => {
    if (activeTeacherId && noteContent) {
      addNote(activeTeacherId, noteContent);
      setNoteContent("");
      setIsNoteOpen(false);
    }
  };

  return (
    <div className="flex flex-col">
      {isReadOnly && (
        <div className="bg-amber-100 text-amber-800 px-8 py-2 text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Estás visualizando el panel de: {activeTeacher?.name || "Maestro"}. Los cambios no se guardarán permanentemente.
          </div>
          <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
            <DialogTrigger render={
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white h-7 text-xs">
                <MessageSquarePlus className="h-3 w-3 mr-1" /> Dejar Nota
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dejar una nota para {activeTeacher?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea 
                  placeholder="Escribe una recomendación o comentario..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleAddNote} className="w-full bg-indigo-600 hover:bg-indigo-700">Guardar Nota</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <header className="flex h-16 items-center justify-between px-8 bg-white border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
        </div>
        <div className="flex items-center space-x-4">
          {currentUser?.role === "teacher" && (
            <Dialog open={isReadNoteOpen} onOpenChange={setIsReadNoteOpen}>
              <DialogTrigger render={
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-indigo-600">
                  <Bell className="h-5 w-5" />
                  {unreadNotes.length > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                  )}
                </Button>
              } />
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Mensajes de Dirección</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-4 max-h-[300px] overflow-y-auto">
                  {teacherNotes.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No tienes mensajes nuevos.</p>
                  ) : (
                    teacherNotes.map(note => (
                      <div key={note.id} className={`p-3 rounded-lg border ${!note.read ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 bg-slate-50'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-semibold text-slate-700">{note.directorName}</p>
                          <span className="text-[10px] text-slate-500">{new Date(note.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{note.content}</p>
                        {!note.read && (
                          <Button variant="outline" size="sm" className="h-6 text-xs w-full mt-2" onClick={() => markNoteAsRead(note.id)}>
                            Marcar como leído
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>
    </div>
  );
}
