"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Phone, Building, Save, UserCircle2, Upload, HeartPulse } from "lucide-react";

export default function PerfilPage() {
  const { currentUser, updateUserProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    school: "",
    degree: "",
    photo: "",
    medicalNote: {
      bloodType: "",
      illnesses: "",
      allergies: "",
      other: ""
    }
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        school: currentUser.school || "",
        degree: currentUser.degree || "",
        photo: currentUser.photo || "",
        medicalNote: currentUser.medicalNote || {
          bloodType: "",
          illnesses: "",
          allergies: "",
          other: ""
        }
      });
    }
  }, [currentUser]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, photo: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMedicalChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      medicalNote: { ...prev.medicalNote, [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    updateUserProfile(currentUser.id, formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Ficha Técnica y Perfil</h2>
        <p className="text-slate-500 text-sm mt-1">
          Gestiona tu información personal, profesional y datos médicos de emergencia.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Información Profesional</CardTitle>
            <CardDescription>Completa tus datos de contacto y formación académica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div className="h-32 w-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                  {formData.photo ? (
                    <img src={formData.photo} alt="Foto de perfil" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle2 className="h-16 w-16 text-slate-300" />
                  )}
                </div>
                <div className="w-full text-center mt-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3 h-3 mr-2" /> Subir Foto
                  </Button>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="degree">Licenciatura / Título</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="degree" 
                        placeholder="Ej. Lic. en Educación Primaria" 
                        className="pl-10"
                        value={formData.degree}
                        onChange={(e) => setFormData({...formData, degree: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono de Contacto</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input 
                        id="phone" 
                        placeholder="10 dígitos" 
                        className="pl-10"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">Institución Escolar</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                      id="school" 
                      placeholder="Nombre de la escuela" 
                      className="pl-10"
                      value={formData.school}
                      onChange={(e) => setFormData({...formData, school: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="bg-red-50 border-b border-red-100 text-red-900 rounded-t-xl">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-red-600" />
              <CardTitle>Nota Médica de Emergencia</CardTitle>
            </div>
            <CardDescription className="text-red-700/70">Esta información es vital en caso de alguna contingencia médica.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Sangre</Label>
                <Select value={formData.medicalNote.bloodType} onValueChange={(v) => handleMedicalChange("bloodType", v)}>
                  <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="O+, A-, etc." /></SelectTrigger>
                  <SelectContent>
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Desconocido"].map(bt => (
                      <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Enfermedades Crónicas</Label>
                <Textarea 
                  value={formData.medicalNote.illnesses} 
                  onChange={(e) => handleMedicalChange("illnesses", e.target.value)} 
                  placeholder="Ej. Asma, Diabetes, Hipertensión... Dejar en blanco si no aplica." 
                />
              </div>
              <div className="space-y-2">
                <Label>Alergias</Label>
                <Textarea 
                  value={formData.medicalNote.allergies} 
                  onChange={(e) => handleMedicalChange("allergies", e.target.value)} 
                  placeholder="Ej. Penicilina, Nueces, etc." 
                />
              </div>
              <div className="space-y-2">
                <Label>Contactos de Emergencia y Otras Notas</Label>
                <Textarea 
                  value={formData.medicalNote.other} 
                  onChange={(e) => handleMedicalChange("other", e.target.value)} 
                  placeholder="Ej. Llamar a esposa al 555-0000. Medicación actual..." 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-6 text-lg w-full sm:w-auto">
            <Save className="h-5 w-5 mr-2" />
            {isSaved ? "Guardado con éxito" : "Guardar Toda la Información"}
          </Button>
        </div>
      </form>
    </div>
  );
}
