"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, GraduationCap, Building, Eye, Clock, Phone, MapPin, Edit3, Save, UserCircle2, BookOpen } from "lucide-react";
import { useState } from "react";

export default function DirectorDashboard() {
  const { users, currentUser, setActiveTeacherId, notes, schoolProfile, updateSchoolProfile, schoolGrades } = useAuth();
  const router = useRouter();

  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [schoolData, setSchoolData] = useState(schoolProfile);

  // Redirect if not a director
  if (currentUser?.role !== "director") {
    if (typeof window !== "undefined") router.push("/");
    return null;
  }

  const teachers = users.filter(u => u.role === "teacher");

  const handleImpersonate = (teacherId: string) => {
    setActiveTeacherId(teacherId);
    router.push("/");
  };

  const handleSaveSchool = () => {
    updateSchoolProfile(schoolData);
    setIsEditingSchool(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Panel de Dirección Escolar</h2>
        <p className="text-slate-500 text-sm mt-1">Supervisión, gestión docente y calificaciones globales</p>
      </div>

      {/* School Profile Section */}
      <Card className="border-indigo-100 overflow-hidden shadow-sm">
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <Building className="h-6 w-6" />
            <h3 className="font-bold text-lg">Ficha Técnica de la Escuela</h3>
          </div>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-indigo-700 hover:text-white"
            onClick={() => isEditingSchool ? handleSaveSchool() : setIsEditingSchool(true)}
          >
            {isEditingSchool ? <><Save className="h-4 w-4 mr-2" /> Guardar</> : <><Edit3 className="h-4 w-4 mr-2" /> Editar</>}
          </Button>
        </div>
        <CardContent className="p-6 bg-indigo-50/30">
          {isEditingSchool ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de la Institución</Label>
                <Input value={schoolData.name} onChange={e => setSchoolData({...schoolData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Nombre del Director(a)</Label>
                <Input value={schoolData.principalName} onChange={e => setSchoolData({...schoolData, principalName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input value={schoolData.address} onChange={e => setSchoolData({...schoolData, address: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono de Contacto</Label>
                <Input value={schoolData.phone} onChange={e => setSchoolData({...schoolData, phone: e.target.value})} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Institución</p>
                <p className="font-medium text-slate-800">{schoolProfile.name || "No definido"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Dirección</p>
                <p className="font-medium text-slate-800 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {schoolProfile.address || "No definida"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Director(a)</p>
                <p className="font-medium text-slate-800 flex items-center gap-1">
                  <Users className="h-3 w-3 text-slate-400" />
                  {schoolProfile.principalName || currentUser.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Teléfono</p>
                <p className="font-medium text-slate-800 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-slate-400" />
                  {schoolProfile.phone || "No definido"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 text-white border-indigo-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Docentes Registrados</p>
                <p className="text-3xl font-bold">{teachers.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-600 text-white border-emerald-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Notas Enviadas</p>
                <p className="text-3xl font-bold">{notes.filter(n => n.directorId === currentUser.id).length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-600 text-white border-amber-500 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">Periodos Cerrados</p>
                <p className="text-3xl font-bold">{schoolGrades.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Fichas Docentes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map(teacher => {
            const notesForTeacher = notes.filter(n => n.teacherId === teacher.id && n.directorId === currentUser.id);
            const unreadByTeacher = notesForTeacher.filter(n => !n.read).length;

            return (
              <Card key={teacher.id} className="border-slate-200 hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-indigo-700 text-xl overflow-hidden shrink-0">
                      {teacher.photo ? (
                        <img src={teacher.photo} alt={teacher.name} className="h-full w-full object-cover" />
                      ) : (
                        teacher.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate" title={teacher.name}>{teacher.name}</CardTitle>
                      <CardDescription className="text-xs truncate flex items-center mt-1" title={teacher.degree || "Sin Licenciatura"}>
                        <GraduationCap className="h-3 w-3 mr-1 inline" />
                        {teacher.degree || "Sin Licenciatura"}
                      </CardDescription>
                      <CardDescription className="text-xs truncate flex items-center mt-0.5" title={teacher.phone || "Sin Teléfono"}>
                        <Phone className="h-3 w-3 mr-1 inline" />
                        {teacher.phone || "Sin Teléfono"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                      <span>Notas enviadas: {notesForTeacher.length}</span>
                      {unreadByTeacher > 0 ? (
                        <span className="text-red-600 font-medium">{unreadByTeacher} sin leer</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Todas leídas</span>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => handleImpersonate(teacher.id)}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Revisar Grupos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {teachers.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
              <GraduationCap className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No hay docentes registrados</p>
              <p className="text-slate-400 text-sm mt-1">Los profesores aparecerán aquí cuando creen su cuenta.</p>
            </div>
          )}
        </div>
      </div>

      {/* Concentrado de Calificaciones */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          Concentrado de Calificaciones (Periodos Cerrados)
        </h3>
        
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {schoolGrades.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No hay periodos cerrados</p>
              <p className="text-slate-400 text-sm mt-1">Los profesores deben usar la función "Cerrar Periodo" en su panel de calificaciones.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Profesor</th>
                    <th className="px-4 py-3">Grupo</th>
                    <th className="px-4 py-3">Periodo</th>
                    <th className="px-4 py-3 text-center">Alumnos</th>
                    <th className="px-4 py-3 text-center">Aprobados / Reprobados</th>
                    <th className="px-4 py-3 text-right">Promedio General</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schoolGrades.map((grade) => {
                    const teacher = users.find(u => u.id === grade.teacherId);
                    return (
                      <tr key={grade.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-600">{new Date(grade.dateSubmitted).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                          <UserCircle2 className="h-4 w-4 text-slate-400" />
                          {teacher?.name || "Desconocido"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{grade.groupName}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {grade.termName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">{grade.totalStudents}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-emerald-600 font-semibold mr-2">{grade.approvedStudents}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-red-600 font-semibold ml-2">{grade.failedStudents}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-bold ${grade.averageGrade >= 6 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {grade.averageGrade.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
