"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { hybridStorage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { SyncEngine } from "@/lib/syncEngine";

export type Role = "teacher" | "director" | "superadmin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  school?: string;
  phone?: string;
  degree?: string;
  photo?: string;
  birthday?: string;
  classification?: string;
  medicalNote?: {
    bloodType: string;
    illnesses: string;
    allergies: string;
    other: string;
  };
  documents?: { id: string; name: string; date: string; url?: string }[];
};

export type SchoolProfile = {
  name: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  logo: string;
  teacherClassifications?: string[];
};

export type TermGradeRecord = {
  id: string;
  teacherId: string;
  groupId: string;
  groupName: string;
  termType: "Bimestre" | "Semestre" | "Año";
  termName: string;
  dateSubmitted: string;
  averageGrade: number;
  totalStudents: number;
  approvedStudents: number;
  failedStudents: number;
};

export type DirectorNote = {
  id: string;
  directorId: string;
  directorName: string;
  teacherId: string;
  date: string;
  content: string;
  read: boolean;
};

type AuthContextType = {
  users: User[];
  currentUser: User | null;
  activeTeacherId: string | null;
  isReadOnly: boolean;
  notes: DirectorNote[];
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (data: { name: string; email: string; password: string; role: Role; school: string }) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => Promise<void>;
  setActiveTeacherId: (id: string | null) => void;
  addNote: (teacherId: string, content: string) => void;
  markNoteAsRead: (noteId: string) => void;
  schoolProfile: SchoolProfile;
  schoolGrades: TermGradeRecord[];
  updateUserProfile: (userId: string, data: Partial<User>) => void;
  updateSchoolProfile: (data: Partial<SchoolProfile>) => void;
  addSchoolGrade: (grade: Omit<TermGradeRecord, "id" | "dateSubmitted">) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean | null>(null);
  
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);
  const [notes, setNotes] = useState<DirectorNote[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>({
    name: "Nombre de la Escuela",
    address: "",
    phone: "",
    email: "",
    principalName: "",
    logo: "",
    teacherClassifications: ["Maestros de 1er Grado", "Maestros de 6to Grado"]
  });
  const [schoolGrades, setSchoolGrades] = useState<TermGradeRecord[]>([]);

  useEffect(() => {
    setIsClient(true);

    const initApp = async () => {
      // 1. Cargar estado local (Offline) usando nuestro hybridStorage
      const savedUsers = await hybridStorage.load("edu_users");
      const savedNotes = await hybridStorage.load("edu_notes");
      const savedSchool = await hybridStorage.load("edu_school_profile");
      const savedGrades = await hybridStorage.load("edu_school_grades");
      const savedSessionId = await hybridStorage.load("edu_session_id");
      const subStatus = await hybridStorage.load("subscription_status");

      if (savedUsers) setUsers(savedUsers);
      if (savedNotes) setNotes(savedNotes);
      if (savedSchool) setSchoolProfile(savedSchool);
      if (savedGrades) setSchoolGrades(savedGrades);

      // 2. Verificar Sesión con Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      let loggedUser = null;
      if (session) {
        // En linea: Intentar descargar perfil actualizado
        if (navigator.onLine) {
          const { data: profile } = await supabase.from('usuarios').select('*').eq('id', session.user.id).single();
          if (profile) {
            loggedUser = {
              id: session.user.id,
              name: session.user.email === "admin@kardexia.com" ? "Administrador General" : (profile.nombre || session.user.email?.split('@')[0] || 'Usuario'),
              email: session.user.email || '',
              role: session.user.email === "admin@kardexia.com" ? "superadmin" : (profile.rol === 'Director' ? 'director' : 'teacher'),
              school: profile.escuela
            };
            // Guardar para offline
            await hybridStorage.save("edu_cached_user", loggedUser);

            // Sincronización Inicial: Descargar la nube a local
            if (profile.app_data) {
              const appData = profile.app_data;
              if (appData.edu_users) await hybridStorage.save('edu_users', appData.edu_users);
              if (appData.edu_notes) await hybridStorage.save('edu_notes', appData.edu_notes);
              if (appData.edu_school_profile) await hybridStorage.save('edu_school_profile', appData.edu_school_profile);
              if (appData.edu_school_grades) await hybridStorage.save('edu_school_grades', appData.edu_school_grades);
              
              const teacherKey = `eduPanelData_${session.user.id}`;
              if (appData[teacherKey]) {
                await hybridStorage.save(teacherKey, appData[teacherKey]);
              }
              // Avisar a la app que hay nuevos datos locales
              window.dispatchEvent(new CustomEvent('edu_sync_update'));
            }
          }
        } else {
          // Offline: usar el cacheado
          loggedUser = await hybridStorage.load("edu_cached_user");
        }
      }

      if (loggedUser) {
        setCurrentUser(loggedUser);
        if (loggedUser.role === "teacher") {
          setActiveTeacherId(loggedUser.id);
        }

        // 3. Verificación de suscripción SÓLO si está logueado
        if (subStatus === "inactive" || !subStatus) {
          setSubscriptionActive(false);
          if (pathname !== "/suscripcion") router.replace("/suscripcion");
        } else {
          setSubscriptionActive(true);
          if (pathname === "/" || pathname === "/suscripcion" || pathname === "/login" || pathname === "/registro") {
            router.replace("/dashboard");
          }
          
          // Iniciar Sync Engine
          import("@/lib/syncEngine").then(({ SyncEngine }) => {
             SyncEngine.start(loggedUser.id);
          });
        }
      } else {
        // No hay usuario logueado
        setSubscriptionActive(true); // Permitir render de componentes públicos
        if (pathname !== '/login' && pathname !== '/registro' && pathname !== '/') {
          router.replace('/login');
        }
      }
    };

    initApp();

    const reloadLocalData = async () => {
      const savedUsers = await hybridStorage.load("edu_users");
      const savedNotes = await hybridStorage.load("edu_notes");
      const savedSchool = await hybridStorage.load("edu_school_profile");
      const savedGrades = await hybridStorage.load("edu_school_grades");

      if (savedUsers) setUsers(savedUsers);
      if (savedNotes) setNotes(savedNotes);
      if (savedSchool) setSchoolProfile(savedSchool);
      if (savedGrades) setSchoolGrades(savedGrades);
    };

    const handleSync = () => reloadLocalData();
    window.addEventListener('edu_sync_update', handleSync);
    return () => window.removeEventListener('edu_sync_update', handleSync);
  }, [pathname, router]);

  const loginUser = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error || !data.user) {
        console.error("Login failed:", error);
        return false;
      }

      const { data: profile } = await supabase.from('usuarios').select('*').eq('id', data.user.id).single();
      
      let finalRole: Role = profile?.rol === 'Director' ? 'director' : 'teacher';
      let finalName = profile?.nombre || email.split('@')[0];

      if (email === "admin@kardexia.com") {
        finalRole = "superadmin";
        finalName = "Administrador General";
      }

      const loggedInUser: User = {
        id: data.user.id,
        name: finalName,
        email: email,
        role: finalRole,
        school: profile?.escuela
      };

      setCurrentUser(loggedInUser);
      if (loggedInUser.role === "teacher") {
        setActiveTeacherId(loggedInUser.id);
      }
      
      await hybridStorage.save("edu_session_id", data.session.access_token);
      await hybridStorage.save("edu_cached_user", loggedInUser);
      
      // Load user specific data after login
      if (profile?.app_data) {
        const appData = profile.app_data;
        if (appData.edu_users) {
          setUsers(appData.edu_users);
          await hybridStorage.save('edu_users', appData.edu_users);
        }
        if (appData.edu_notes) {
          setNotes(appData.edu_notes);
          await hybridStorage.save('edu_notes', appData.edu_notes);
        }
        if (appData.edu_school_profile) {
          setSchoolProfile(appData.edu_school_profile);
          await hybridStorage.save('edu_school_profile', appData.edu_school_profile);
        }
        if (appData.edu_school_grades) {
          setSchoolGrades(appData.edu_school_grades);
          await hybridStorage.save('edu_school_grades', appData.edu_school_grades);
        }
        const teacherKey = `eduPanelData_${data.user.id}`;
        if (appData[teacherKey]) {
          await hybridStorage.save(teacherKey, appData[teacherKey]);
        }
      }

      // Check subscription
      const subStatus = profile?.estado_suscripcion || "trial";
      await hybridStorage.save("subscription_status", subStatus);
      
      if (subStatus === "inactiva") {
        setSubscriptionActive(false);
        router.push("/suscripcion");
      } else {
        setSubscriptionActive(true);
        if (loggedInUser.role === "superadmin") {
          router.push("/admin");
        } else if (loggedInUser.role === "director") {
          router.push("/director");
        } else {
          router.push("/dashboard");
        }
      }

      import("@/lib/syncEngine").then(({ SyncEngine }) => {
        SyncEngine.start(data.user.id);
      });

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const registerUser = async (data: { name: string; email: string; password: string; role: Role; school: string }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError || !authData.user) {
        console.error("SignUp error:", authError);
        return { success: false, error: "El correo ya está registrado o es inválido." };
      }

      // Start 14-day trial
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14);

      // Create profile in perfiles table
      const { error: profileError } = await supabase.from('usuarios').insert([{
        id: authData.user.id,
        nombre: data.name,
        rol: data.role === 'director' ? 'Director' : 'Maestro',
        escuela: data.school,
        estado_suscripcion: 'trial',
        fecha_fin_prueba: endDate.toISOString()
      }]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      // Auto-login after registration
      await loginUser(data.email, data.password);
      return { success: true };
    } catch (e) {
      console.error("Register catch error:", e);
      return { success: false, error: "Ocurrió un error inesperado al registrarte." };
    }
  };

  const logoutUser = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTeacherId(null);
    await hybridStorage.save("edu_cached_user", null);
    router.replace('/login');
  };

  const addNote = (teacherId: string, content: string) => {
    if (currentUser?.role !== "director") return;
    const newNote: DirectorNote = {
      id: `n_${Date.now()}`,
      directorId: currentUser.id,
      directorName: currentUser.name,
      teacherId,
      date: new Date().toISOString(),
      content,
      read: false
    };
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    hybridStorage.save("edu_notes", updatedNotes);
  };

  const markNoteAsRead = (noteId: string) => {
    const updatedNotes = notes.map(n => n.id === noteId ? { ...n, read: true } : n);
    setNotes(updatedNotes);
    hybridStorage.save("edu_notes", updatedNotes);
  };

  const updateUserProfile = (userId: string, data: Partial<User>) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...data } : u);
    setUsers(updatedUsers);
    hybridStorage.save("edu_users", updatedUsers);
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, ...data });
    }
  };

  const updateSchoolProfile = (data: Partial<SchoolProfile>) => {
    if (currentUser?.role !== "director") return;
    const updated = { ...schoolProfile, ...data };
    setSchoolProfile(updated);
    hybridStorage.save("edu_school_profile", updated);
  };

  const addSchoolGrade = (grade: Omit<TermGradeRecord, "id" | "dateSubmitted">) => {
    const newGrade: TermGradeRecord = {
      ...grade,
      id: `tg_${Date.now()}`,
      dateSubmitted: new Date().toISOString()
    };
    const updated = [newGrade, ...schoolGrades];
    setSchoolGrades(updated);
    hybridStorage.save("edu_school_grades", updated);
  };

  const isReadOnly = currentUser?.role === "director" && activeTeacherId !== null && activeTeacherId !== currentUser?.id;

  if (!isClient || subscriptionActive === null) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <AuthContext.Provider value={{
      users,
      currentUser,
      activeTeacherId,
      isReadOnly,
      notes,
      loginUser,
      registerUser,
      logoutUser,
      setActiveTeacherId,
      addNote,
      markNoteAsRead,
      schoolProfile,
      schoolGrades,
      updateUserProfile,
      updateSchoolProfile,
      addSchoolGrade
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
