/**
 * Arquitectura Preparada para Base de Datos Local
 * 
 * Este archivo actúa como una interfaz (capa de abstracción) para 
 * manejar los datos. Actualmente las funciones utilizan localStorage
 * para mantener la funcionalidad, pero la firma de los métodos ya está
 * preparada para migrarse a IPC (Inter-Process Communication) con Electron 
 * para escribir archivos JSON directos en el disco.
 */

declare global {
  interface Window {
    electronAPI?: {
      saveData: (key: string, data: any) => Promise<{ success: boolean; error?: string }>;
      loadData: (key: string) => Promise<any>;
    };
  }
}

export const localDb = {
  // Guarda información en la base de datos local
  async saveData(key: string, data: any): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Entorno de Electron (SQLite)
        const result = await window.electronAPI.saveData(key, data);
        if (!result.success) throw new Error(result.error);
        console.log(`[LocalDB-SQLite] Datos guardados para: ${key}`);
      } else if (typeof window !== 'undefined') {
        // Entorno Web (Fallback)
        localStorage.setItem(`eduPanelData_${key}`, JSON.stringify(data));
        console.log(`[LocalDB-Web] Datos guardados para: ${key}`);
      }
    } catch (error) {
      console.error("[LocalDB] Error al guardar datos:", error);
    }
  },

  // Lee información de la base de datos local
  async loadData(key: string): Promise<any | null> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Entorno de Electron (SQLite)
        return await window.electronAPI.loadData(key);
      } else if (typeof window !== 'undefined') {
        // Entorno Web (Fallback)
        const saved = localStorage.getItem(`eduPanelData_${key}`);
        return saved ? JSON.parse(saved) : null;
      }
      return null;
    } catch (error) {
      console.error("[LocalDB] Error al leer datos:", error);
      return null;
    }
  }
};
