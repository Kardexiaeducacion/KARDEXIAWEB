'use client'

/**
 * Storage Híbrido (Local-First)
 * Este módulo decide automáticamente dónde guardar los datos dependiendo del entorno:
 * - Si estamos en Electron (Desktop App), usa la base de datos SQLite oculta.
 * - Si estamos en el navegador web (Web App), usa el LocalStorage del navegador.
 */

export const hybridStorage = {
  async save(key: string, data: any): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // Estamos en la aplicación instalada (Electron)
      const res = await (window as any).electronAPI.saveData(key, data)
      window.dispatchEvent(new CustomEvent('edu_local_update'));
      return res.success
    } else if (typeof window !== 'undefined') {
      // Estamos en el navegador (Web)
      try {
        localStorage.setItem(key, JSON.stringify(data))
        window.dispatchEvent(new CustomEvent('edu_local_update'));
        return true
      } catch (e) {
        console.error('Error guardando en LocalStorage:', e)
        return false
      }
    }
    return false
  },

  async load(key: string): Promise<any | null> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // Estamos en la aplicación instalada (Electron)
      return await (window as any).electronAPI.loadData(key)
    } else if (typeof window !== 'undefined') {
      // Estamos en el navegador (Web)
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (e) {
        console.error('Error leyendo de LocalStorage:', e)
        return null
      }
    }
    return null
  }
}
