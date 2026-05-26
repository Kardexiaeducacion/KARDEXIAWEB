export const mockStudents = [
  {
    id: "1",
    name: "Ana García",
    avatar: "AG",
    attendance: "Presente",
    tutor: {
      name: "María García",
      phone: "+52 55 1234 5678",
      email: "maria.garcia@example.com",
    },
    grades: {
      exam: 8.5,
      project: 9.0,
      tasks: 10.0,
    },
    participation: 5,
    tasksCompleted: 8,
    tasksAssigned: 10,
    observations: {
      strengths: "Muy participativa, excelente comprensión lectora.",
      areasToImprove: "Se distrae ocasionalmente en matemáticas.",
      suggestions: "Fomentar lectura en casa por 20 minutos diarios."
    }
  },
  {
    id: "2",
    name: "Carlos López",
    avatar: "CL",
    attendance: "Presente",
    tutor: {
      name: "Juan López",
      phone: "+52 55 2345 6789",
      email: "juan.lopez@example.com",
    },
    grades: {
      exam: 7.0,
      project: 8.5,
      tasks: 8.0,
    },
    participation: 3,
    tasksCompleted: 9,
    tasksAssigned: 10,
    observations: {
      strengths: "Responsable con sus entregas, buen trabajo en equipo.",
      areasToImprove: "Mejorar ortografía y redacción.",
      suggestions: "Revisar los apuntes antes de los exámenes."
    }
  },
  {
    id: "3",
    name: "Lucía Martínez",
    avatar: "LM",
    attendance: "Retardo",
    tutor: {
      name: "Elena Martínez",
      phone: "+52 55 3456 7890",
      email: "elena.martinez@example.com",
    },
    grades: {
      exam: 9.5,
      project: 10.0,
      tasks: 9.5,
    },
    participation: 8,
    tasksCompleted: 10,
    tasksAssigned: 10,
    observations: {
      strengths: "Excelente desempeño académico, liderazgo nato.",
      areasToImprove: "A veces es impaciente con sus compañeros.",
      suggestions: "Inscribirla en actividades extracurriculares de liderazgo."
    }
  },
  {
    id: "4",
    name: "Diego Fernández",
    avatar: "DF",
    attendance: "Ausente",
    tutor: {
      name: "Roberto Fernández",
      phone: "+52 55 4567 8901",
      email: "roberto.fernandez@example.com",
    },
    grades: {
      exam: 6.0,
      project: 7.5,
      tasks: 6.0,
    },
    participation: 1,
    tasksCompleted: 5,
    tasksAssigned: 10,
    observations: {
      strengths: "Mucha creatividad en proyectos artísticos.",
      areasToImprove: "Falta de atención y tareas incompletas.",
      suggestions: "Establecer una rutina de tareas más estricta en casa."
    }
  },
  {
    id: "5",
    name: "Sofía Ramírez",
    avatar: "SR",
    attendance: "Presente",
    tutor: {
      name: "Carmen Ramírez",
      phone: "+52 55 5678 9012",
      email: "carmen.ramirez@example.com",
    },
    grades: {
      exam: 9.0,
      project: 9.5,
      tasks: 9.0,
    },
    participation: 6,
    tasksCompleted: 10,
    tasksAssigned: 10,
    observations: {
      strengths: "Muy aplicada, siempre dispuesta a ayudar.",
      areasToImprove: "Participar más hablando en público.",
      suggestions: "Practicar exposiciones orales en casa."
    }
  }
];

export const mockIncidents = [
  {
    id: "1",
    date: "2023-10-24",
    time: "10:30 AM",
    studentId: "4",
    description: "Empujó a un compañero durante el receso.",
    actionsTaken: "Se le llamó la atención y se le pidió disculparse. Se notificó al tutor.",
    witnesses: "Maestro de guardia"
  }
];

export const mockMeetings = [
  {
    id: "1",
    tutor: "Roberto Fernández",
    date: "2023-10-25",
    time: "14:00",
    reason: "Bajo rendimiento académico y falta de tareas.",
    status: "Programada",
    agreements: ""
  },
  {
    id: "2",
    tutor: "Elena Martínez",
    date: "2023-10-20",
    time: "13:00",
    reason: "Reunión de seguimiento general.",
    status: "Completada",
    agreements: "Mantener el excelente nivel y buscar retos adicionales."
  }
];
