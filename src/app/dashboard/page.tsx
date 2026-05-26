"use client";

import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Clock, CalendarDays, UserCircle2 } from "lucide-react";

export default function Dashboard() {
  const { students, activeGroupId, attendanceHistory, meetings } = useAppContext();
  
  const activeStudents = students.filter(s => s.groupId === activeGroupId);
  const totalStudents = activeStudents.length;

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAttendance = attendanceHistory.filter(r => r.date === todayStr && activeStudents.some(s => s.id === r.studentId));
  const presentStudents = todayAttendance.filter(r => r.status === "Presente").length;
  // If no attendance recorded today, assume 0 rate, otherwise calculate
  const attendanceRate = totalStudents === 0 ? 0 : Math.round((presentStudents / totalStudents) * 100);

  const pendingTasks = activeStudents.reduce((acc, curr) => acc + (curr.tasksAssigned - curr.tasksCompleted), 0);
  
  const activeMeetings = meetings.filter(m => m.groupId === activeGroupId);
  const upcomingMeetings = activeMeetings.filter(m => m.status === "Programada").length;

  const absentStudentsRecords = todayAttendance.filter(r => r.status === "Ausente");
  const absentStudents = absentStudentsRecords.map(r => activeStudents.find(s => s.id === r.studentId)).filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Alumnos</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
            <p className="text-xs text-slate-500 mt-1">Registrados en el curso</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Asistencia Hoy</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{attendanceRate}%</div>
            <p className="text-xs text-slate-500 mt-1">{presentStudents} de {totalStudents} presentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tareas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{pendingTasks}</div>
            <p className="text-xs text-slate-500 mt-1">Entregas por revisar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Próximas Reuniones</CardTitle>
            <CalendarDays className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{upcomingMeetings}</div>
            <p className="text-xs text-slate-500 mt-1">Citas programadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Alumnos Ausentes Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {absentStudents.map(student => student && (
                <div key={student.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 overflow-hidden border border-slate-200">
                      {student.imageUrl ? (
                        <img src={student.imageUrl} alt={student.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>{student.avatar}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-500">Tutor: {student.tutor.name}</p>
                    </div>
                  </div>
                  <a 
                    href={`https://wa.me/${student.tutor.phone.replace(/\D/g,'')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 font-medium hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md"
                  >
                    Contactar
                  </a>
                </div>
              ))}
              {absentStudents.length === 0 && (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
                   <UserCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Todos los alumnos están presentes hoy o no se ha pasado asistencia.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Agenda Próxima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeMeetings.slice(0, 3).map(meeting => (
                <div key={meeting.id} className="flex items-start gap-4 border-l-2 border-indigo-500 pl-4 py-1">
                  <div className="min-w-[4rem]">
                    <p className="text-sm font-medium text-slate-900">{meeting.time}</p>
                    <p className="text-xs text-slate-500">{meeting.date.split("-").reverse().join("/")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{meeting.tutor}</p>
                    <p className="text-xs text-slate-500">{meeting.reason}</p>
                  </div>
                </div>
              ))}
              {activeMeetings.length === 0 && (
                <p className="text-sm text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-lg">No hay reuniones programadas.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
