"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, User } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Phone, Mail, GraduationCap, Plus, Edit, FileText, Upload, Calendar as CalendarIcon, ArrowRight, Eye, Trash2, HeartPulse, Send, Settings } from "lucide-react";

export default function DirectorMaestrosPage() {
  const { users, currentUser, setActiveTeacherId, registerUser, updateUserProfile, schoolProfile, updateSchoolProfile, addNote } = useAuth();
  const router = useRouter();
  
  const teachers = users.filter(u => u.role === "teacher");
  const classifications = schoolProfile.teacherClassifications || [];
  
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "grupos" | "expediente" | "medico">("info");
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isConfigClassOpen, setIsConfigClassOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const [newTeacher, setNewTeacher] = useState({ name: "", email: "", password: "123", phone: "", degree: "", classification: "" });
  const [newDocName, setNewDocName] = useState("");
  const [newClassTag, setNewClassTag] = useState("");

  const handleAddTeacher = () => {
    if (newTeacher.name && newTeacher.email) {
      registerUser({ ...newTeacher, role: "teacher" });
      setIsAddTeacherOpen(false);
    }
  };

  const handleUpdateTeacherInfo = (field: keyof User, value: any) => {
    if (selectedTeacher) {
      const updated = { ...selectedTeacher, [field]: value };
      setSelectedTeacher(updated);
      updateUserProfile(selectedTeacher.id, updated);
    }
  };

  const handleUpdateMedical = (field: string, value: string) => {
    if (selectedTeacher) {
      const currentMed = selectedTeacher.medicalNote || { bloodType: "", illnesses: "", allergies: "", other: "" };
      const updatedMed = { ...currentMed, [field]: value };
      handleUpdateTeacherInfo("medicalNote", updatedMed);
    }
  };

  const handleImpersonate = (teacherId: string) => {
    setActiveTeacherId(teacherId);
    router.push("/");
  };

  const getTeacherGroups = (teacherId: string) => {
    try {
      const saved = localStorage.getItem(`eduPanelData_${teacherId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.groups || [];
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  const handleSendSchedule = () => {
    if (!selectedTeacher) return;
    const groups = getTeacherGroups(selectedTeacher.id);
    const groupNames = groups.map((g: any) => g.name).join(", ");
    const content = `Hola ${selectedTeacher.name}, se te han asignado los siguientes grupos: ${groupNames || 'Ninguno aún'}. Por favor, revisa tu horario en el panel.`;
    addNote(selectedTeacher.id, content);
    alert("¡Notificación de horario y grupos enviada con éxito!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedTeacher && newDocName) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newDoc = {
          id: `doc_${Date.now()}`,
          name: newDocName,
          date: new Date().toISOString().split("T")[0],
          url: base64String
        };
        const updatedDocs = [...(selectedTeacher.documents || []), newDoc];
        handleUpdateTeacherInfo("documents", updatedDocs);
        setNewDocName("");
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteDoc = (docId: string) => {
    if (selectedTeacher) {
      const updatedDocs = (selectedTeacher.documents || []).filter(d => d.id !== docId);
      handleUpdateTeacherInfo("documents", updatedDocs);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedTeacher) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateTeacherInfo("photo", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddClassTag = () => {
    if (newClassTag && !classifications.includes(newClassTag)) {
      updateSchoolProfile({ teacherClassifications: [...classifications, newClassTag] });
      setNewClassTag("");
    }
  };

  const handleDeleteClassTag = (tag: string) => {
    updateSchoolProfile({ teacherClassifications: classifications.filter(c => c !== tag) });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Plantilla y Expedientes</h2>
          <p className="text-slate-500 text-sm mt-1">Gestión detallada de profesores y documentos oficiales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white" onClick={() => setIsConfigClassOpen(true)}>
            <Settings className="w-4 h-4 mr-2" /> Clasificaciones
          </Button>
          <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
            <DialogTrigger render={<Button className="bg-indigo-600 hover:bg-indigo-700 text-white" />}>
              <Plus className="w-4 h-4 mr-2" /> Añadir Maestro
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Profesor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} placeholder="Ej. Prof. María Rodríguez" />
                </div>
                <div className="space-y-2">
                  <Label>Correo Electrónico (Para Iniciar Sesión)</Label>
                  <Input type="email" value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} placeholder="correo@escuela.edu" />
                </div>
                <div className="space-y-2">
                  <Label>Clasificación</Label>
                  <Select value={newTeacher.classification} onValueChange={(v) => setNewTeacher({...newTeacher, classification: v})}>
                    <SelectTrigger><SelectValue placeholder="Ej. Maestro de 6to" /></SelectTrigger>
                    <SelectContent>
                      {classifications.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleAddTeacher}>
                  Crear Perfil
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isConfigClassOpen} onOpenChange={setIsConfigClassOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Configurar Clasificaciones</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label>Nueva Clasificación</Label>
                <Input value={newClassTag} onChange={e => setNewClassTag(e.target.value)} placeholder="Ej. Maestro de Inglés" />
              </div>
              <Button onClick={handleAddClassTag} className="bg-indigo-600 hover:bg-indigo-700 text-white">Añadir</Button>
            </div>
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {classifications.map(tag => (
                <div key={tag} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="font-medium text-sm">{tag}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteClassTag(tag)} className="text-red-500 h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {classifications.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No hay clasificaciones definidas.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {!selectedTeacher ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map(teacher => (
            <Card key={teacher.id} className="overflow-hidden hover:shadow-md transition-shadow border-slate-200 cursor-pointer" onClick={() => setSelectedTeacher(teacher)}>
              <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-center gap-3">
                <div className="h-12 w-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold shrink-0 text-lg overflow-hidden border border-slate-200 shadow-sm">
                  {teacher.photo ? (
                    <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    teacher.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-slate-800 truncate">{teacher.name}</h3>
                  <div className="text-xs text-indigo-600 font-medium flex items-center mt-1">
                    {teacher.classification || "Sin clasificación"}
                  </div>
                </div>
              </div>
              <CardContent className="p-4 bg-white">
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {teacher.phone || "No registrado"}</div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {teacher.email}</div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-indigo-600 font-medium">{teacher.documents?.length || 0} docs en expediente</span>
                  <span className="flex items-center text-slate-500 hover:text-indigo-700 font-semibold">
                    Abrir Perfil <ArrowRight className="w-3 h-3 ml-1" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" className="text-slate-500 mb-2 -ml-2 hover:bg-slate-100" onClick={() => setSelectedTeacher(null)}>
            ← Volver a la Plantilla
          </Button>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar del Perfil */}
            <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 shrink-0 flex flex-col">
              <div className="p-6 text-center border-b border-slate-100">
                <div className="h-20 w-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold shrink-0 text-3xl mb-3 overflow-hidden border border-slate-200 shadow-sm relative group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                  {selectedTeacher.photo ? (
                    <img src={selectedTeacher.photo} alt={selectedTeacher.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedTeacher.name.charAt(0).toUpperCase()
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                </div>
                <input type="file" accept="image/*" className="hidden" ref={photoInputRef} onChange={handlePhotoUpload} />
                <h3 className="font-bold text-slate-800">{selectedTeacher.name}</h3>
                <p className="text-xs text-indigo-600 font-medium mt-1">{selectedTeacher.classification || "Sin clasificación"}</p>
              </div>
              <div className="p-2 space-y-1 flex-1">
                {[
                  { id: "info", label: "Información Personal", icon: Users },
                  { id: "grupos", label: "Asignaciones / Panel", icon: GraduationCap },
                  { id: "expediente", label: "Expediente Digital", icon: FileText },
                  { id: "medico", label: "Nota Médica", icon: HeartPulse }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-slate-200">
                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-sm" onClick={() => handleImpersonate(selectedTeacher.id)}>
                  <Eye className="w-4 h-4 mr-2" /> Supervisar Panel
                </Button>
              </div>
            </div>

            {/* Contenido del Perfil */}
            <div className="flex-1 p-6 md:p-8 bg-white min-h-[500px]">
              
              {activeTab === "info" && (
                <div className="space-y-6 max-w-lg">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Información de Contacto</h3>
                    <p className="text-sm text-slate-500 mb-6">Modifica los detalles personales del maestro.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nombre Completo</Label>
                      <Input value={selectedTeacher.name} onChange={e => handleUpdateTeacherInfo("name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Clasificación</Label>
                      <Select value={selectedTeacher.classification || ""} onValueChange={(v) => handleUpdateTeacherInfo("classification", v)}>
                        <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                        <SelectContent>
                          {classifications.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input value={selectedTeacher.phone || ""} onChange={e => handleUpdateTeacherInfo("phone", e.target.value)} placeholder="000-000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Cumpleaños</Label>
                        <Input type="date" value={selectedTeacher.birthday || ""} onChange={e => handleUpdateTeacherInfo("birthday", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Licenciatura o Especialidad</Label>
                      <Input value={selectedTeacher.degree || ""} onChange={e => handleUpdateTeacherInfo("degree", e.target.value)} placeholder="Ej. Pedagogía" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "medico" && (
                <div className="space-y-6 max-w-lg">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-red-100 p-2 rounded-full"><HeartPulse className="w-5 h-5 text-red-600" /></div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Nota Médica de Emergencia</h3>
                      <p className="text-sm text-slate-500">Información crucial para casos de emergencia médica.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tipo de Sangre</Label>
                      <Select value={selectedTeacher.medicalNote?.bloodType || ""} onValueChange={(v) => handleUpdateMedical("bloodType", v)}>
                        <SelectTrigger><SelectValue placeholder="O+, A-, etc." /></SelectTrigger>
                        <SelectContent>
                          {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Desconocido"].map(bt => (
                            <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Enfermedades Crónicas</Label>
                      <Textarea value={selectedTeacher.medicalNote?.illnesses || ""} onChange={(e) => handleUpdateMedical("illnesses", e.target.value)} placeholder="Ej. Asma, Diabetes, Hipertensión..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Alergias</Label>
                      <Textarea value={selectedTeacher.medicalNote?.allergies || ""} onChange={(e) => handleUpdateMedical("allergies", e.target.value)} placeholder="Ej. Penicilina, Nueces..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Notas Adicionales (Medicación, Contactos)</Label>
                      <Textarea value={selectedTeacher.medicalNote?.other || ""} onChange={(e) => handleUpdateMedical("other", e.target.value)} placeholder="Ej. Toma paracetamol, llamar a esposa en caso de..." />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "grupos" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">Grupos y Asignaturas</h3>
                      <p className="text-sm text-slate-500">Extraído del panel de control del maestro.</p>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" onClick={handleSendSchedule}>
                      <Send className="w-4 h-4 mr-2" /> Enviar Asignaciones
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {getTeacherGroups(selectedTeacher.id).length === 0 ? (
                      <div className="col-span-full py-8 text-center border border-dashed border-slate-300 rounded-lg text-slate-500">
                        Este maestro no ha configurado ningún grupo aún.
                      </div>
                    ) : (
                      getTeacherGroups(selectedTeacher.id).map((g: any) => (
                        <Card key={g.id} className="bg-slate-50 border-slate-200">
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                              <GraduationCap className="h-6 w-6 text-indigo-500" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800">{g.name}</h4>
                              <p className="text-xs text-slate-500 mt-1">{g.academicYear} • {g.school}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "expediente" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Expediente Digital</h3>
                    <p className="text-sm text-slate-500 mb-6">Añade y visualiza documentos oficiales (Actas, Certificados, Fotos).</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 space-y-2 w-full">
                      <Label>Nombre del Documento</Label>
                      <Input 
                        placeholder="Ej. Acta de Nacimiento, Título..." 
                        value={newDocName} 
                        onChange={e => setNewDocName(e.target.value)} 
                        className="bg-white"
                      />
                    </div>
                    <div className="w-full sm:w-auto">
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                      />
                      <Button 
                        disabled={!newDocName} 
                        onClick={() => fileInputRef.current?.click()} 
                        className="bg-indigo-600 hover:bg-indigo-700 w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" /> Seleccionar y Subir
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(!selectedTeacher.documents || selectedTeacher.documents.length === 0) ? (
                      <div className="col-span-full py-12 text-center border border-dashed border-slate-300 rounded-lg text-slate-500">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        No hay documentos en el expediente de este maestro.
                      </div>
                    ) : (
                      selectedTeacher.documents.map(doc => (
                        <div key={doc.id} className="border border-slate-200 rounded-lg overflow-hidden group">
                          {doc.url ? (
                            doc.url.startsWith('data:image') ? (
                              <div className="h-32 bg-slate-100 relative">
                                <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-32 bg-slate-100 flex items-center justify-center text-slate-400">
                                <FileText className="w-12 h-12" />
                              </div>
                            )
                          ) : (
                            <div className="h-32 bg-slate-100 flex items-center justify-center text-slate-400">
                              <FileText className="w-12 h-12" />
                            </div>
                          )}
                          <div className="p-3 bg-white flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-slate-800 text-sm truncate w-32" title={doc.name}>{doc.name}</p>
                              <p className="text-xs text-slate-500 flex items-center mt-1">
                                <CalendarIcon className="w-3 h-3 mr-1" /> {doc.date}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => handleDeleteDoc(doc.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
