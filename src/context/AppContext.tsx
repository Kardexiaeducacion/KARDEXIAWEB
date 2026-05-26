"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { mockStudents, mockIncidents, mockMeetings } from "@/lib/mockData";
import { useAuth } from "./AuthContext";

export type Student = {
  id: string;
  groupId: string;
  name: string;
  avatar: string;
  imageUrl?: string;
  tutor: { name: string; phone: string; email: string };
  grades: { exam: number; project: number; tasks: number };
  participation: number;
  tasksCompleted: number;
  tasksAssigned: number;
  listNumber?: number;
  gender?: "M" | "F" | "Otro";
  manualOrder?: number;
  observations: { strengths: string; areasToImprove: string; suggestions: string };
  subjectGrades?: Record<string, { exam: number; project: number; tasks: number }>;
  conductScore?: number; // 0-10
  medicalNote?: { bloodType: string; illnesses: string; allergies: string; other: string };
};

export type GradingCriteria = {
  tasks: number;
  exams: number;
  participation: number;
  conduct: number;
};

export type ParticipationRecord = {
  id: string;
  studentId: string;
  groupId: string;
  date: string;
  points: number; // usually 1
  subjectId?: string;
};

export type ObservationRecord = {
  id: string;
  studentId: string;
  groupId: string;
  date: string;
  strengths: string;
  areasToImprove: string;
  suggestions: string;
};

export type ConductRecord = {
  id: string;
  studentId: string;
  groupId: string;
  date: string;
  points: number; // e.g. -0.5, +1.0
  subjectId?: string;
};

export type ActivityLog = {
  id: string;
  date: string;
  action: string;
  details: string;
  userType: "teacher" | "director";
  userName: string;
};

export type Group = { 
  id: string; 
  name: string; 
  school?: string; 
  grade?: string; 
  groupName?: string; 
  academicYear?: string;
  subjects?: { id: string; name: string }[];
};

export type Holiday = { date: string; name: string };

export type SchoolCalendar = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  holidays: Holiday[];
  cycleColor?: string;
};

export type ArchivedCycle = {
  id: string;
  name: string;
  archiveDate: string;
  data: any;
};

export type AttendanceRecord = { 
  date: string; 
  studentId: string; 
  status: "Presente" | "Ausente" | "Retardo" | "Justificado";
  subjectId?: string;
};

export type EventRecord = { id: string; groupId: string; title: string; date: string; time: string; description: string; alert: boolean; type?: "event" | "birthday" };

export type TeacherEvaluationCriteria = {
  id: string;
  name: string;
  maxScore: number;
};

export type TeacherEvaluation = {
  id: string;
  teacherId: string;
  date: string;
  period: string;
  frequency: string; // "Mensual" | "Bimestral" | "Semestral" | "Anual"
  scores: Record<string, number>;
  comments: string;
};

export type IncidentRecord = { id: string; groupId: string; date: string; time: string; studentId: string; description: string; actionsTaken: string; witnesses: string };

export type MeetingRecord = { id: string; groupId: string; tutor: string; date: string; time: string; reason: string; status: string; agreements: string };

export type AnecdoteRecord = { id: string; groupId: string; date: string; content: string };

export type TaskRecord = {
  id: string;
  groupId: string;
  subjectId?: string;
  title: string;
  description: string;
  dueDate: string;
  status: "Activa" | "Revisión" | "Completada";
  weight?: number; // Porcentaje de calificación (ej. 20%)
};

export type TaskSubmission = {
  id: string;
  taskId: string;
  studentId: string;
  fileData?: string; // Base64 string for PDF/Image
  fileName?: string;
  status: "Entregada" | "Pendiente";
  grade?: number;
  comments?: string;
};

export type ExamRecord = {
  id: string;
  groupId: string;
  subjectId?: string;
  title: string;
  date: string;
  weight: number; // Porcentaje de calificación (ej. 50%)
  totalQuestions: number; // Número total de aciertos
};

export type ExamSubmission = {
  id: string;
  examId: string;
  studentId: string;
  correctAnswers?: number; // Aciertos obtenidos
  fileData?: string; // Base64 string for PDF/Image
  fileName?: string;
  comments?: string;
};

export type TeamRecord = {
  id: string;
  groupId: string;
  name: string;
  date: string;
  teams: { teamName: string; students: Student[] }[];
};

export type FinanceConcept = {
  id: string;
  groupId: string; // "all" for global or specific group ID
  title: string;
  amount: number;
  date: string;
  targetType: "student" | "teacher";
  frequency?: string; // "Único" | "Mensual" | "Bimestral" | "Semestral" | "Anual"
};

export type EducationalMaterial = {
  id: string;
  groupId: string;
  subjectId?: string; // empty means 'General'
  title: string;
  description: string;
  type: "file" | "link";
  fileData?: string; // Base64 string for PDFs, Images, PPTXs
  fileName?: string;
  url?: string; // External URL
  uploadDate: string;
};

export type FinancePayment = {
  id: string;
  conceptId: string;
  payerId: string; // studentId or teacherId
  amountPaid: number;
  date: string;
};

export type ScheduleBlock = {
  id: string;
  groupId: string;
  days: string[]; // ["lunes", "martes", "miercoles", "jueves", "viernes"]
  startTime: string; // "08:00"
  endTime: string;   // "08:50"
  title: string; // Free text, e.g. "Matemáticas", "Receso"
  color: string; // Tailwind color class e.g. "bg-blue-100 border-blue-400 text-blue-800"
};

interface AppContextType {
  groups: Group[];
  addGroup: (group: Omit<Group, "id">) => void;
  updateGroup: (id: string, data: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  activeGroupId: string;
  setActiveGroupId: (id: string) => void;
  students: Student[];
  addStudent: (student: Omit<Student, "id">) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  attendanceHistory: AttendanceRecord[];
  addOrUpdateAttendance: (record: AttendanceRecord) => void;
  events: EventRecord[];
  addEvent: (event: Omit<EventRecord, "id">) => void;
  updateEvent: (id: string, data: Partial<EventRecord>) => void;
  deleteEvent: (id: string) => void;
  incidents: IncidentRecord[];
  addIncident: (incident: Omit<IncidentRecord, "id">) => void;
  meetings: MeetingRecord[];
  addMeeting: (meeting: Omit<MeetingRecord, "id">) => void;
  updateMeeting: (id: string, data: Partial<MeetingRecord>) => void;
  anecdotes: AnecdoteRecord[];
  addAnecdote: (anecdote: Omit<AnecdoteRecord, "id">) => void;
  schoolCalendars: SchoolCalendar[];
  addSchoolCalendar: (calendar: Omit<SchoolCalendar, "id">) => void;
  updateSchoolCalendar: (id: string, data: Partial<SchoolCalendar>) => void;
  deleteSchoolCalendar: (id: string) => void;
  tasks: TaskRecord[];
  addTask: (task: Omit<TaskRecord, "id">) => void;
  updateTask: (id: string, data: Partial<TaskRecord>) => void;
  deleteTask: (id: string) => void;
  taskSubmissions: TaskSubmission[];
  addOrUpdateSubmission: (submission: Omit<TaskSubmission, "id">) => void;
  exams: ExamRecord[];
  addExam: (exam: Omit<ExamRecord, "id">) => void;
  updateExam: (id: string, data: Partial<ExamRecord>) => void;
  deleteExam: (id: string) => void;
  examSubmissions: ExamSubmission[];
  addOrUpdateExamSubmission: (submission: Omit<ExamSubmission, "id">) => void;
  gradingCriteria: GradingCriteria;
  updateGradingCriteria: (criteria: Partial<GradingCriteria>) => void;
  participationGoalConfig: { amount: number; timeframe: string };
  setParticipationGoalConfig: (config: { amount: number; timeframe: string }) => void;
  participationHistory: ParticipationRecord[];
  addParticipation: (record: Omit<ParticipationRecord, "id">) => void;
  removeParticipation: (studentId: string, date: string, subjectId?: string) => void;
  observationHistory: ObservationRecord[];
  addOrUpdateObservation: (record: Omit<ObservationRecord, "id">) => void;
  conductHistory: ConductRecord[];
  addConductRecord: (record: Omit<ConductRecord, "id">) => void;
  removeConductRecord: (studentId: string, date: string, points: number, subjectId?: string) => void;
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, details: string) => void;
  teacherEvaluationCriteria: TeacherEvaluationCriteria[];
  addTeacherEvaluationCriteria: (criteria: Omit<TeacherEvaluationCriteria, "id">) => void;
  updateTeacherEvaluationCriteria: (id: string, data: Partial<TeacherEvaluationCriteria>) => void;
  deleteTeacherEvaluationCriteria: (id: string) => void;
  teacherEvaluations: TeacherEvaluation[];
  addTeacherEvaluation: (evalData: Omit<TeacherEvaluation, "id">) => void;
  updateTeacherEvaluation: (id: string, data: Partial<TeacherEvaluation>) => void;
  deleteTeacherEvaluation: (id: string) => void;
  savedTeams: TeamRecord[];
  saveTeamRecord: (record: Omit<TeamRecord, "id">) => void;
  deleteTeamRecord: (id: string) => void;
  financeConcepts: FinanceConcept[];
  addFinanceConcept: (concept: Omit<FinanceConcept, "id">) => void;
  updateFinanceConcept: (id: string, data: Partial<FinanceConcept>) => void;
  deleteFinanceConcept: (id: string) => void;
  financePayments: FinancePayment[];
  addOrUpdateFinancePayment: (payment: Omit<FinancePayment, "id">) => void;
  deleteFinancePayment: (id: string) => void;
  scheduleBlocks: ScheduleBlock[];
  addScheduleBlock: (block: Omit<ScheduleBlock, "id">) => void;
  updateScheduleBlock: (id: string, data: Partial<ScheduleBlock>) => void;
  deleteScheduleBlock: (id: string) => void;
  educationalMaterials: EducationalMaterial[];
  addEducationalMaterial: (material: Omit<EducationalMaterial, "id">) => void;
  deleteEducationalMaterial: (id: string) => void;
  archivedCycles: ArchivedCycle[];
  maxArchivedCycles: number;
  setMaxArchivedCycles: (n: number) => void;
  archiveCurrentCycle: (cycleId: string, cycleName: string) => void;
  deleteArchivedCycle: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [groups, setGroups] = useState<Group[]>([
    { id: "g1", name: '6to Grado "A"', school: "Primaria Benito Juárez", grade: "6to", groupName: "A", academicYear: "2023-2024" }, 
    { id: "g2", name: '6to Grado "B"', school: "Primaria Benito Juárez", grade: "6to", groupName: "B", academicYear: "2023-2024" }
  ]);
  const [activeGroupId, setActiveGroupId] = useState("g1");
  
  // Transform initial mock data to include groupId and conductScore
  const initialStudents = mockStudents.map(s => ({ ...s, groupId: "g1", imageUrl: "", conductScore: 10 }));
  const initialIncidents = mockIncidents.map(i => ({ ...i, groupId: "g1" }));
  const initialMeetings = mockMeetings.map(m => ({ ...m, groupId: "g1" }));
  const initialAttendance = mockStudents.map(s => ({ date: new Date().toISOString().split("T")[0], studentId: s.id, status: s.attendance as any }));
  const initialEvents = [{ id: "1", groupId: "g1", title: "Reunión de Padres", date: new Date().toISOString().split("T")[0], time: "10:00", description: "Entrega de boletas.", alert: true }];
  const initialAnecdotes = [{ id: "1", groupId: "g1", date: new Date().toISOString(), content: "Día normal." }];
  const initialCalendars: SchoolCalendar[] = [{
    id: "cal-sep-2025-2026",
    name: "SEP 2025-2026",
    startDate: "2025-08-25",
    endDate: "2026-07-16",
    holidays: [
      { date: "2025-09-16", name: "Día de la Independencia" },
      { date: "2025-11-17", name: "Aniversario de la Revolución (Descanso)" },
      { date: "2025-12-25", name: "Navidad" },
      { date: "2026-01-01", name: "Año Nuevo" },
      { date: "2026-02-02", name: "Día de la Constitución (Descanso)" },
      { date: "2026-03-16", name: "Natalicio de Benito Juárez (Descanso)" },
      { date: "2026-05-01", name: "Día del Trabajo" },
      { date: "2026-05-05", name: "Batalla de Puebla" },
      { date: "2026-05-15", name: "Día del Maestro" }
    ]
  }];

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>(initialAttendance);
  const [events, setEvents] = useState<EventRecord[]>(initialEvents);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(initialIncidents);
  const [meetings, setMeetings] = useState<MeetingRecord[]>(initialMeetings);
  const [anecdotes, setAnecdotes] = useState<AnecdoteRecord[]>(initialAnecdotes);
  const [schoolCalendars, setSchoolCalendars] = useState<SchoolCalendar[]>(initialCalendars);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmission[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([]);
  const [participationHistory, setParticipationHistory] = useState<ParticipationRecord[]>([]);
  const [observationHistory, setObservationHistory] = useState<ObservationRecord[]>([]);
  const [conductHistory, setConductHistory] = useState<ConductRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [teacherEvaluationCriteria, setTeacherEvaluationCriteria] = useState<TeacherEvaluationCriteria[]>([
    { id: "crit_1", name: "Planeación Didáctica", maxScore: 20 },
    { id: "crit_2", name: "Puntualidad", maxScore: 20 },
    { id: "crit_3", name: "Manejo de Grupo", maxScore: 20 },
    { id: "crit_4", name: "Participación Escolar", maxScore: 20 },
    { id: "crit_5", name: "Comunicación", maxScore: 20 }
  ]);
  const [teacherEvaluations, setTeacherEvaluations] = useState<TeacherEvaluation[]>([]);
  const [savedTeams, setSavedTeams] = useState<TeamRecord[]>([]);
  const [financeConcepts, setFinanceConcepts] = useState<FinanceConcept[]>([]);
  const [financePayments, setFinancePayments] = useState<FinancePayment[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  
  const [gradingCriteria, setGradingCriteria] = useState<GradingCriteria>({
    tasks: 30,
    exams: 30,
    participation: 20,
    conduct: 20
  });
  const [participationGoalConfig, setParticipationGoalConfig] = useState({ amount: 10, timeframe: "Bimestral" });
  const [educationalMaterials, setEducationalMaterials] = useState<EducationalMaterial[]>([]);
  const [archivedCycles, setArchivedCycles] = useState<ArchivedCycle[]>([]);
  const [maxArchivedCycles, setMaxArchivedCycles] = useState<number>(3);

  const { activeTeacherId, currentUser } = useAuth();

  const getStorageKey = () => {
    if (activeTeacherId) return `eduPanelData_${activeTeacherId}`;
    if (currentUser?.role === "director") return "eduPanelData_director";
    return null;
  };

  useEffect(() => {
    setIsClient(true);
    
    const initData = async () => {
      const storageKey = getStorageKey();
      if (!storageKey) return;

      const saved = await import("@/lib/storage").then(m => m.hybridStorage.load(storageKey));
      if (saved) {
        if (saved.groups) setGroups(saved.groups);
        if (saved.activeGroupId) setActiveGroupId(saved.activeGroupId);
        if (saved.students) setStudents(saved.students);
        if (saved.attendanceHistory) setAttendanceHistory(saved.attendanceHistory);
        if (saved.events) setEvents(saved.events);
        if (saved.incidents) setIncidents(saved.incidents);
        if (saved.meetings) setMeetings(saved.meetings);
        if (saved.anecdotes) setAnecdotes(saved.anecdotes);
        if (saved.schoolCalendars) setSchoolCalendars(saved.schoolCalendars);
        setParticipationHistory(saved.participationHistory || []);
        setObservationHistory(saved.observationHistory || []);
        setConductHistory(saved.conductHistory || []);
        setActivityLogs(saved.activityLogs || []);
        if (saved.teacherEvaluationCriteria) setTeacherEvaluationCriteria(saved.teacherEvaluationCriteria);
        setTeacherEvaluations(saved.teacherEvaluations || []);
        setSavedTeams(saved.savedTeams || []);
        setFinanceConcepts(saved.financeConcepts || []);
        setFinancePayments(saved.financePayments || []);
        setScheduleBlocks(saved.scheduleBlocks || []);
        setEducationalMaterials(saved.educationalMaterials || []);
        setArchivedCycles(saved.archivedCycles || []);
        setMaxArchivedCycles(saved.maxArchivedCycles || 3);
        if (saved.participationGoalConfig) {
          setParticipationGoalConfig(saved.participationGoalConfig);
        } else if (saved.participationGoal) {
          setParticipationGoalConfig({ amount: saved.participationGoal, timeframe: "Mensual" });
        }
      } else {
        // Initialize EMPTY data if new teacher
        setGroups([]);
        setActiveGroupId("");
        setStudents([]);
        setAttendanceHistory([]);
        setEvents([]);
        setIncidents([]);
        setMeetings([]);
        setAnecdotes([]);
        setSchoolCalendars([]);
        setTasks([]);
        setTaskSubmissions([]);
        setExams([]);
        setExamSubmissions([]);
        setParticipationHistory([]);
        setObservationHistory([]);
        setConductHistory([]);
        setActivityLogs([]);
        setTeacherEvaluations([]);
        setSavedTeams([]);
        setFinanceConcepts([]);
        setFinancePayments([]);
        setScheduleBlocks([]);
        setEducationalMaterials([]);
        setArchivedCycles([]);
        setMaxArchivedCycles(3);
        setGradingCriteria({ tasks: 30, exams: 30, participation: 20, conduct: 20 });
        setParticipationGoalConfig({ amount: 10, timeframe: "Bimestral" });
      }
    };
    initData();

    const handleSync = () => initData();
    window.addEventListener('edu_sync_update', handleSync);
    return () => window.removeEventListener('edu_sync_update', handleSync);
  }, [activeTeacherId]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (!isClient || !storageKey) return;
    const payload = {
        groups, activeGroupId, students, attendanceHistory, events, incidents, meetings, anecdotes, schoolCalendars, tasks, taskSubmissions, exams, examSubmissions, participationHistory, observationHistory, conductHistory, gradingCriteria, participationGoalConfig, activityLogs, teacherEvaluationCriteria, teacherEvaluations, savedTeams, financeConcepts, financePayments, scheduleBlocks, educationalMaterials, archivedCycles, maxArchivedCycles
    };
    import("@/lib/storage").then(m => m.hybridStorage.save(storageKey, payload));
  }, [groups, activeGroupId, students, attendanceHistory, events, incidents, meetings, anecdotes, schoolCalendars, tasks, taskSubmissions, exams, examSubmissions, participationHistory, observationHistory, conductHistory, gradingCriteria, participationGoalConfig, activityLogs, teacherEvaluationCriteria, teacherEvaluations, savedTeams, financeConcepts, financePayments, scheduleBlocks, educationalMaterials, archivedCycles, maxArchivedCycles, isClient, activeTeacherId, currentUser]);

  const addActivityLog = (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      date: new Date().toISOString(),
      action,
      details,
      userType: currentUser.role,
      userName: currentUser.name
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const addTeacherEvaluationCriteria = (criteria: Omit<TeacherEvaluationCriteria, "id">) => setTeacherEvaluationCriteria(prev => [...prev, { ...criteria, id: `crit_${Date.now()}` }]);
  const updateTeacherEvaluationCriteria = (id: string, data: Partial<TeacherEvaluationCriteria>) => setTeacherEvaluationCriteria(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  const deleteTeacherEvaluationCriteria = (id: string) => setTeacherEvaluationCriteria(prev => prev.filter(c => c.id !== id));

  const addTeacherEvaluation = (evalData: Omit<TeacherEvaluation, "id">) => setTeacherEvaluations(prev => [...prev, { ...evalData, id: `eval_${Date.now()}` }]);
  const updateTeacherEvaluation = (id: string, data: Partial<TeacherEvaluation>) => setTeacherEvaluations(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  const deleteTeacherEvaluation = (id: string) => setTeacherEvaluations(prev => prev.filter(e => e.id !== id));

  const addGroup = (group: Omit<Group, "id">) => setGroups(prev => [...prev, { ...group, id: Date.now().toString() }]);
  const updateGroup = (id: string, data: Partial<Group>) => setGroups(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  const deleteGroup = (id: string) => {
    setGroups(prev => prev.filter(g => g.id !== id));
    // Set active group to another one if deleted
    if (activeGroupId === id && groups.length > 1) {
      setActiveGroupId(groups.find(g => g.id !== id)?.id || "");
    }
  };

  const addStudent = (student: Omit<Student, "id">) => {
    setStudents(prev => [...prev, { ...student, id: Date.now().toString() }]);
    addActivityLog("Agregar Alumno", `Se agregó a ${student.name} al grupo.`);
  };
  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    addActivityLog("Actualizar Alumno", `Se actualizaron datos del alumno ID: ${id}.`);
  };
  const deleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    setStudents(prev => prev.filter(s => s.id !== id));
    addActivityLog("Eliminar Alumno", `Se eliminó al alumno ${student?.name || id}.`);
  };

  const addOrUpdateAttendance = (record: AttendanceRecord) => {
    setAttendanceHistory(prev => {
      const existing = prev.findIndex(r => r.date === record.date && r.studentId === record.studentId);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = record;
        return next;
      }
      return [...prev, record];
    });
  };

  const addEvent = (event: Omit<EventRecord, "id">) => setEvents(prev => [...prev, { ...event, id: Date.now().toString() }]);
  const updateEvent = (id: string, data: Partial<EventRecord>) => setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const addIncident = (inc: Omit<IncidentRecord, "id">) => setIncidents(prev => [{ ...inc, id: Date.now().toString() }, ...prev]);
  const addMeeting = (m: Omit<MeetingRecord, "id">) => setMeetings(prev => [{ ...m, id: Date.now().toString() }, ...prev]);
  const updateMeeting = (id: string, data: Partial<MeetingRecord>) => setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  const addAnecdote = (a: Omit<AnecdoteRecord, "id">) => setAnecdotes(prev => [{ ...a, id: Date.now().toString() }, ...prev]);

  const addSchoolCalendar = (cal: Omit<SchoolCalendar, "id">) => setSchoolCalendars(prev => [...prev, { ...cal, id: Date.now().toString() }]);
  const updateSchoolCalendar = (id: string, data: Partial<SchoolCalendar>) => setSchoolCalendars(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  const deleteSchoolCalendar = (id: string) => setSchoolCalendars(prev => prev.filter(c => c.id !== id));

  const addTask = (task: Omit<TaskRecord, "id">) => setTasks(prev => [...prev, { ...task, id: Date.now().toString() }]);
  const updateTask = (id: string, data: Partial<TaskRecord>) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setTaskSubmissions(prev => prev.filter(s => s.taskId !== id));
  };
  
  const addOrUpdateSubmission = (sub: Omit<TaskSubmission, "id">) => {
    setTaskSubmissions(prev => {
      const existing = prev.find(s => s.taskId === sub.taskId && s.studentId === sub.studentId);
      if (existing) {
        return prev.map(s => s.id === existing.id ? { ...s, ...sub } : s);
      }
      return [...prev, { ...sub, id: Date.now().toString() }];
    });
  };

  const addExam = (exam: Omit<ExamRecord, "id">) => setExams(prev => [...prev, { ...exam, id: Date.now().toString() }]);
  const updateExam = (id: string, data: Partial<ExamRecord>) => setExams(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    setExamSubmissions(prev => prev.filter(s => s.examId !== id));
  };
  
  const addOrUpdateExamSubmission = (sub: Omit<ExamSubmission, "id">) => {
    setExamSubmissions(prev => {
      const existing = prev.find(s => s.examId === sub.examId && s.studentId === sub.studentId);
      if (existing) {
        return prev.map(s => s.id === existing.id ? { ...s, ...sub } : s);
      }
      return [...prev, { ...sub, id: Date.now().toString() }];
    });
  };

  const updateGradingCriteria = (criteria: Partial<GradingCriteria>) => {
    setGradingCriteria(prev => ({ ...prev, ...criteria }));
  };

  const addParticipation = (record: Omit<ParticipationRecord, "id">) => {
    setParticipationHistory(prev => [...prev, { ...record, id: Date.now().toString() }]);
  };

  const removeParticipation = (studentId: string, date: string, subjectId?: string) => {
    setParticipationHistory(prev => {
      // Remove only one instance for that date and subject
      const index = prev.findIndex(p => p.studentId === studentId && p.date === date && p.subjectId === subjectId);
      if (index !== -1) {
        const newHistory = [...prev];
        newHistory.splice(index, 1);
        return newHistory;
      }
      return prev;
    });
  };

  const addOrUpdateObservation = (record: Omit<ObservationRecord, "id">) => {
    setObservationHistory(prev => {
      const existingIndex = prev.findIndex(o => o.studentId === record.studentId && o.date === record.date);
      if (existingIndex !== -1) {
        const newHistory = [...prev];
        newHistory[existingIndex] = { ...newHistory[existingIndex], ...record };
        return newHistory;
      }
      return [...prev, { ...record, id: Date.now().toString() }];
    });
  };

  const addConductRecord = (record: Omit<ConductRecord, "id">) => {
    setConductHistory(prev => [...prev, { ...record, id: Date.now().toString() }]);
  };

  const removeConductRecord = (studentId: string, date: string, points: number, subjectId?: string) => {
    setConductHistory(prev => {
      const index = prev.findIndex(p => p.studentId === studentId && p.date === date && p.points === points && p.subjectId === subjectId);
      if (index !== -1) {
        const newHistory = [...prev];
        newHistory.splice(index, 1);
        return newHistory;
      }
      return prev;
    });
  };

  const saveTeamRecord = (record: Omit<TeamRecord, "id">) => {
    setSavedTeams(prev => [{ ...record, id: `team_${Date.now()}` }, ...prev]);
  };

  const deleteTeamRecord = (id: string) => {
    setSavedTeams(prev => prev.filter(t => t.id !== id));
  };

  const addFinanceConcept = (concept: Omit<FinanceConcept, "id">) => {
    setFinanceConcepts(prev => [...prev, { ...concept, id: `fc_${Date.now()}` }]);
  };

  const updateFinanceConcept = (id: string, data: Partial<FinanceConcept>) => {
    setFinanceConcepts(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteFinanceConcept = (id: string) => {
    setFinanceConcepts(prev => prev.filter(c => c.id !== id));
    setFinancePayments(prev => prev.filter(p => p.conceptId !== id)); // cascading delete
  };

  const addOrUpdateFinancePayment = (payment: Omit<FinancePayment, "id">) => {
    setFinancePayments(prev => {
      const existing = prev.find(p => p.conceptId === payment.conceptId && p.payerId === payment.payerId);
      if (existing) {
        return prev.map(p => p.id === existing.id ? { ...p, amountPaid: payment.amountPaid, date: payment.date } : p);
      }
      return [...prev, { ...payment, id: `fp_${Date.now()}` }];
    });
  };

  const deleteFinancePayment = (id: string) => {
    setFinancePayments(prev => prev.filter(p => p.id !== id));
  };

  const addScheduleBlock = (block: Omit<ScheduleBlock, "id">) => {
    setScheduleBlocks(prev => [...prev, { ...block, id: `sb_${Date.now()}` }]);
  };

  const updateScheduleBlock = (id: string, data: Partial<ScheduleBlock>) => {
    setScheduleBlocks(prev => prev.map(sb => sb.id === id ? { ...sb, ...data } : sb));
  };

  const deleteScheduleBlock = (id: string) => {
    setScheduleBlocks(prev => prev.filter(sb => sb.id !== id));
  };

  const addEducationalMaterial = (material: Omit<EducationalMaterial, "id">) => {
    setEducationalMaterials(prev => [{ ...material, id: `mat_${Date.now()}` }, ...prev]);
  };

  const deleteEducationalMaterial = (id: string) => {
    setEducationalMaterials(prev => prev.filter(m => m.id !== id));
  };

  const archiveCurrentCycle = (cycleId: string, cycleName: string) => {
    const cycleData = {
      groups, students, attendanceHistory, events, incidents, meetings, anecdotes,
      tasks, taskSubmissions, exams, examSubmissions, participationHistory,
      observationHistory, conductHistory, activityLogs, teacherEvaluations,
      savedTeams, financeConcepts, financePayments, scheduleBlocks, educationalMaterials
    };
    
    const newArchived = {
      id: cycleId,
      name: cycleName,
      archiveDate: new Date().toISOString(),
      data: cycleData
    };
    
    setArchivedCycles(prev => {
      const updated = [newArchived, ...prev];
      if (updated.length > maxArchivedCycles) {
        return updated.slice(0, maxArchivedCycles);
      }
      return updated;
    });

    // Wipe current cycle
    setGroups([]);
    setActiveGroupId("");
    setStudents([]);
    setAttendanceHistory([]);
    setEvents([]);
    setIncidents([]);
    setMeetings([]);
    setAnecdotes([]);
    setTasks([]);
    setTaskSubmissions([]);
    setExams([]);
    setExamSubmissions([]);
    setParticipationHistory([]);
    setObservationHistory([]);
    setConductHistory([]);
    setActivityLogs([]);
    setTeacherEvaluations([]);
    setSavedTeams([]);
    setFinanceConcepts([]);
    setFinancePayments([]);
    setScheduleBlocks([]);
    setEducationalMaterials([]);
  };

  const deleteArchivedCycle = (id: string) => {
    setArchivedCycles(prev => prev.filter(c => c.id !== id));
  };

  if (!isClient) return null; // Avoid hydration mismatch on first render

  return (
    <AppContext.Provider value={{
      groups, addGroup, updateGroup, deleteGroup,
      activeGroupId, setActiveGroupId,
      students, addStudent, updateStudent, deleteStudent,
      attendanceHistory, addOrUpdateAttendance,
      events, addEvent, updateEvent, deleteEvent,
      incidents, addIncident,
      meetings, addMeeting, updateMeeting,
      anecdotes, addAnecdote,
      schoolCalendars, addSchoolCalendar, updateSchoolCalendar, deleteSchoolCalendar,
      tasks, addTask, updateTask, deleteTask,
      taskSubmissions, addOrUpdateSubmission,
      exams, addExam, updateExam, deleteExam,
      examSubmissions, addOrUpdateExamSubmission,
      gradingCriteria, updateGradingCriteria,
      participationGoalConfig, setParticipationGoalConfig,
      participationHistory, addParticipation, removeParticipation,
      observationHistory, addOrUpdateObservation,
      conductHistory, addConductRecord, removeConductRecord,
      activityLogs, addActivityLog,
      teacherEvaluationCriteria, addTeacherEvaluationCriteria, updateTeacherEvaluationCriteria, deleteTeacherEvaluationCriteria,
      teacherEvaluations, addTeacherEvaluation, updateTeacherEvaluation, deleteTeacherEvaluation,
      savedTeams, saveTeamRecord, deleteTeamRecord,
      financeConcepts, addFinanceConcept, updateFinanceConcept, deleteFinanceConcept,
      financePayments, addOrUpdateFinancePayment, deleteFinancePayment,
      scheduleBlocks, addScheduleBlock, updateScheduleBlock, deleteScheduleBlock,
      educationalMaterials, addEducationalMaterial, deleteEducationalMaterial,
      archivedCycles, maxArchivedCycles, setMaxArchivedCycles, archiveCurrentCycle, deleteArchivedCycle
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useAppContext must be used within an AppProvider");
  return context;
}
