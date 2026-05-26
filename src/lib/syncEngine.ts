import { supabase } from "./supabase";
import { hybridStorage } from "./storage";

export class SyncEngine {
  private static intervalId: any = null;
  private static debounceTimer: any = null;
  private static channel: any = null;
  private static userId: string | null = null;
  private static isSyncing = false;
  private static lastCloudHash: string = "";

  static start(userId: string) {
    this.userId = userId;
    if (this.intervalId) return;

    console.log("[SyncEngine] Iniciando motor de sincronización Local-First bidireccional...");

    // Ejecutar polling de seguridad cada 5 segundos (garantiza sincronización sin depender de realtime config)
    this.intervalId = setInterval(() => {
      this.pollCloudData();
    }, 5000);

    // Escuchar cambios locales para hacer Push Inmediato (con debounce de 3s)
    if (typeof window !== 'undefined') {
      window.addEventListener('edu_local_update', this.handleLocalUpdate);
    }

    // Suscribirse a Supabase Realtime para hacer Pull Inmediato
    this.channel = supabase.channel(`profile_changes_${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'perfiles', filter: `id=eq.${userId}` }, async (payload) => {
        if (this.isSyncing) return; // Si nosotros causamos el update, lo ignoramos
        
        const appData = payload.new.app_data;
        if (appData && typeof appData === 'object') {
          console.log("[SyncEngine] ☁️ Cambio detectado en la nube. Sincronizando hacia local...");
          let changed = false;
          
          if (appData.edu_users) { await hybridStorage.save('edu_users', appData.edu_users); changed = true; }
          if (appData.edu_notes) { await hybridStorage.save('edu_notes', appData.edu_notes); changed = true; }
          if (appData.edu_school_profile) { await hybridStorage.save('edu_school_profile', appData.edu_school_profile); changed = true; }
          if (appData.edu_school_grades) { await hybridStorage.save('edu_school_grades', appData.edu_school_grades); changed = true; }
          
          const teacherKey = `eduPanelData_${userId}`;
          if (appData[teacherKey]) {
            await hybridStorage.save(teacherKey, appData[teacherKey]);
            changed = true;
          }

          if (changed) {
            console.log("[SyncEngine] ✅ Datos locales actualizados. Refrescando pantalla...");
            window.dispatchEvent(new CustomEvent('edu_sync_update'));
          }
        }
      })
      .subscribe();

    // Primera sincronización
    setTimeout(() => this.pollCloudData(), 1000);
  }

  private static async pollCloudData() {
    if (!this.userId || !navigator.onLine || !supabase || this.isSyncing) return;
    
    try {
      const { data: profile } = await supabase
        .from("perfiles")
        .select("app_data, estado_suscripcion")
        .eq("id", this.userId)
        .single();

      if (profile?.estado_suscripcion === "inactiva") {
        await hybridStorage.save("subscription_status", "inactive");
        window.location.href = "/suscripcion";
        return;
      }

      if (profile?.app_data) {
        const cloudDataString = JSON.stringify(profile.app_data);
        
        // Si la nube tiene datos diferentes a lo último que empujamos o bajamos
        if (cloudDataString !== this.lastCloudHash) {
          console.log("[SyncEngine] ☁️ Cambio detectado vía Polling. Sincronizando hacia local...");
          this.lastCloudHash = cloudDataString;
          this.isSyncing = true; // Bloqueamos el push mientras actualizamos
          
          let changed = false;
          const appData = profile.app_data as any;
          if (appData.edu_users) { await hybridStorage.save('edu_users', appData.edu_users); changed = true; }
          if (appData.edu_notes) { await hybridStorage.save('edu_notes', appData.edu_notes); changed = true; }
          if (appData.edu_school_profile) { await hybridStorage.save('edu_school_profile', appData.edu_school_profile); changed = true; }
          if (appData.edu_school_grades) { await hybridStorage.save('edu_school_grades', appData.edu_school_grades); changed = true; }
          
          const teacherKey = `eduPanelData_${this.userId}`;
          if (appData[teacherKey]) {
            await hybridStorage.save(teacherKey, appData[teacherKey]);
            changed = true;
          }

          if (changed) {
            console.log("[SyncEngine] ✅ Datos locales actualizados por Polling. Refrescando pantalla...");
            window.dispatchEvent(new CustomEvent('edu_sync_update'));
          }
          
          setTimeout(() => { this.isSyncing = false; }, 1000);
        }
      }
    } catch (e) {
      console.error("[SyncEngine] Error en Polling:", e);
    }
  }

  private static handleLocalUpdate = () => {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      console.log("[SyncEngine] 💻 Cambio local detectado. Empujando a la nube...");
      this.syncData();
    }, 3000);
  };

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('edu_local_update', this.handleLocalUpdate);
    }
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  private static async syncData() {
    if (!this.userId || !navigator.onLine || !supabase || this.isSyncing) return;
    this.isSyncing = true;

    try {
      // (La suscripción ahora se verifica en el polling)

      // 2. Hacer un PUSH de los datos locales de esta computadora a Supabase
      // Juntamos todos los arrays locales que queremos salvar en la nube
      const users = await hybridStorage.load("edu_users");
      const notes = await hybridStorage.load("edu_notes");
      const school = await hybridStorage.load("edu_school_profile");
      const grades = await hybridStorage.load("edu_school_grades");
      
      const appDataKey = `eduPanelData_${this.userId}`;
      const appData = await hybridStorage.load(appDataKey);

      const payload = {
        edu_users: users || [],
        edu_notes: notes || [],
        edu_school_profile: school || null,
        edu_school_grades: grades || [],
        [appDataKey]: appData || null
      };

      // Guardarlo en la columna app_data
      await supabase
        .from("perfiles")
        .update({ app_data: payload })
        .eq("id", this.userId);

      this.lastCloudHash = JSON.stringify(payload);
      console.log("[SyncEngine] Datos de la app subidos a Supabase con éxito.");

    } catch (err) {
      console.error("[SyncEngine] Error durante la sincronización:", err);
    } finally {
      this.isSyncing = false;
    }
  }
}
