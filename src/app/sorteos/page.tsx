"use client";

import { useState, useEffect, useRef } from "react";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Shuffle, Save, Trophy, Trash2, Calendar, History } from "lucide-react";

export default function SorteosPage() {
  const { students, activeGroupId, savedTeams, saveTeamRecord, deleteTeamRecord } = useAppContext();
  const groupStudents = students.filter(s => s.groupId === activeGroupId);

  const [activeTab, setActiveTab] = useState<"ruleta" | "tombola" | "historial">("ruleta");

  // Ruleta State
  const [ruletaWinner, setRuletaWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayedName, setDisplayedName] = useState<string>("");
  const spinInterval = useRef<NodeJS.Timeout | null>(null);

  // Tombola State
  const [teamCount, setTeamCount] = useState(4);
  const [generatedTeams, setGeneratedTeams] = useState<{teamName: string; students: any[]}[]>([]);
  const [teamRecordName, setTeamRecordName] = useState("");

  const spinRuleta = () => {
    if (groupStudents.length === 0) return;
    setIsSpinning(true);
    setRuletaWinner(null);

    let counter = 0;
    const maxSpins = 20; // How many names to cycle through
    const intervalDelay = 100; // ms

    if (spinInterval.current) clearInterval(spinInterval.current);

    spinInterval.current = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * groupStudents.length);
      setDisplayedName(groupStudents[randomIdx].name);
      counter++;

      if (counter >= maxSpins) {
        clearInterval(spinInterval.current!);
        const winner = groupStudents[Math.floor(Math.random() * groupStudents.length)].name;
        setDisplayedName(winner);
        setRuletaWinner(winner);
        setIsSpinning(false);
      }
    }, intervalDelay);
  };

  const generateTeams = () => {
    if (groupStudents.length === 0 || teamCount <= 0) return;

    // Shuffle students
    const shuffled = [...groupStudents].sort(() => 0.5 - Math.random());
    
    // Create empty teams
    const teams = Array.from({ length: teamCount }, (_, i) => ({
      teamName: `Equipo ${i + 1}`,
      students: [] as any[]
    }));

    // Distribute students
    shuffled.forEach((student, index) => {
      teams[index % teamCount].students.push(student);
    });

    setGeneratedTeams(teams);
    setTeamRecordName(`Sorteo de Equipos - ${new Date().toLocaleDateString()}`);
  };

  const saveTeams = () => {
    if (generatedTeams.length > 0 && teamRecordName) {
      saveTeamRecord({
        groupId: activeGroupId,
        name: teamRecordName,
        date: new Date().toISOString().split("T")[0],
        teams: generatedTeams
      });
      setGeneratedTeams([]);
      setTeamRecordName("");
      setActiveTab("historial");
    }
  };

  const groupSavedTeams = savedTeams.filter(t => t.groupId === activeGroupId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Herramientas de Sorteo</h2>
        <p className="text-slate-500 text-sm mt-1">Selecciona alumnos al azar o crea equipos dinámicamente.</p>
      </div>

      <div className="flex border-b border-slate-200 mb-6">
        {[
          { id: "ruleta", label: "Ruleta (Al Azar)", icon: Trophy },
          { id: "tombola", label: "Tómbola (Equipos)", icon: Users },
          { id: "historial", label: "Historial Guardado", icon: History }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? "border-indigo-600 text-indigo-700 bg-indigo-50/50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "ruleta" && (
        <Card className="border-slate-200 shadow-sm max-w-2xl mx-auto overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-center relative overflow-hidden">
            {/* Background decorative circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full translate-x-1/4 translate-y-1/4"></div>
            
            <h3 className="text-white text-lg font-medium opacity-90 mb-6">Elige un alumno al azar</h3>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl min-h-[160px] flex items-center justify-center relative z-10">
              {isSpinning ? (
                <div className="text-4xl font-bold text-slate-300 animate-pulse transition-all">
                  {displayedName || "..."}
                </div>
              ) : ruletaWinner ? (
                <div className="flex flex-col items-center animate-in zoom-in duration-300">
                  <Trophy className="w-12 h-12 text-yellow-500 mb-2" />
                  <div className="text-3xl font-black text-indigo-700 text-center">
                    {ruletaWinner}
                  </div>
                  <p className="text-sm font-medium text-slate-400 mt-2">¡Es tu turno!</p>
                </div>
              ) : (
                <div className="text-2xl font-semibold text-slate-400 text-center">
                  Presiona el botón para girar la ruleta
                </div>
              )}
            </div>
          </div>
          <CardContent className="p-6 text-center bg-white">
            <Button 
              size="lg" 
              onClick={spinRuleta} 
              disabled={isSpinning || groupStudents.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 shadow-md"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              {isSpinning ? "Girando..." : "Girar Ruleta"}
            </Button>
            {groupStudents.length === 0 && (
              <p className="text-red-500 text-sm mt-3">No hay alumnos en el grupo activo.</p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "tombola" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200 md:col-span-1 shadow-sm h-fit">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg">Configurar Tómbola</CardTitle>
              <CardDescription>Genera equipos aleatorios</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Cantidad de Equipos a crear</Label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => setTeamCount(Math.max(2, teamCount - 1))}>-</Button>
                  <Input type="number" className="text-center w-20 font-bold" value={teamCount} readOnly />
                  <Button variant="outline" size="icon" onClick={() => setTeamCount(teamCount + 1)}>+</Button>
                </div>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-800">
                Alumnos en grupo: <strong>{groupStudents.length}</strong>
              </div>
              <Button onClick={generateTeams} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={groupStudents.length === 0}>
                <Shuffle className="w-4 h-4 mr-2" /> Generar Equipos
              </Button>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            {generatedTeams.length > 0 ? (
              <Card className="border-indigo-100 shadow-sm overflow-hidden border-2">
                <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1 w-full">
                    <Label className="text-indigo-800 mb-1 block">Nombre de esta formación</Label>
                    <Input value={teamRecordName} onChange={(e) => setTeamRecordName(e.target.value)} className="bg-white border-indigo-200" placeholder="Ej. Equipos de Exposición" />
                  </div>
                  <Button onClick={saveTeams} disabled={!teamRecordName} className="bg-green-600 hover:bg-green-700 mt-5 sm:mt-0 w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" /> Guardar
                  </Button>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {generatedTeams.map((team, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                        <h4 className="font-bold text-indigo-700 border-b border-slate-100 pb-2 mb-2 flex justify-between">
                          {team.teamName}
                          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{team.students.length} alumnos</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {team.students.map(s => (
                            <li key={s.id} className="text-sm text-slate-700 flex items-center before:content-['•'] before:mr-2 before:text-indigo-300">
                              {s.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <Users className="w-12 h-12 mb-3 text-slate-300" />
                <p>Configura la cantidad y genera los equipos para visualizarlos aquí.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "historial" && (
        <div className="space-y-4">
          {groupSavedTeams.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-300 rounded-lg text-slate-500 bg-slate-50/50">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              Aún no has guardado ninguna configuración de equipos en este grupo.
            </div>
          ) : (
            groupSavedTeams.map(record => (
              <Card key={record.id} className="border-slate-200 shadow-sm">
                <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{record.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" /> Creado el {record.date}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => deleteTeamRecord(record.id)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                  </Button>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {record.teams.map((team, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3">
                        <h4 className="font-bold text-slate-700 text-sm mb-2">{team.teamName}</h4>
                        <ul className="space-y-1">
                          {team.students.map(s => (
                            <li key={s.id} className="text-xs text-slate-600 truncate" title={s.name}>
                              • {s.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
