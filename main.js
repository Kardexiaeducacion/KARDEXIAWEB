const { app, BrowserWindow, ipcMain, session } = require('electron');

// Deshabilitar aceleración de hardware para evitar parpadeos de pantalla (flickering) en algunas tarjetas gráficas
app.disableHardwareAcceleration();
const path = require('path');
const serve = require('electron-serve').default || require('electron-serve');
const fs = require('fs');
const { exec } = require('child_process');
const { DatabaseSync } = require('node:sqlite');

// Configurar y asegurar que exista la carpeta de la base de datos local
const userDataPath = app.getPath('userData');
// Usamos un nombre menos obvio para mayor privacidad
const dbFolderPath = path.join(userDataPath, 'SystemLocalData'); 

if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
  
  // Ocultar la carpeta a nivel de sistema operativo en Windows (Atributos: Oculto y Sistema)
  if (process.platform === 'win32') {
    exec(`attrib +h +s "${dbFolderPath}"`, (error) => {
      if (error) {
        console.error('Error al ocultar la carpeta de base de datos:', error);
      }
    });
  }
}
console.log('Carpeta de base de datos lista y protegida en:', dbFolderPath);

// Inicializar SQLite nativo (node:sqlite)
const dbPath = path.join(dbFolderPath, 'edupanel.sqlite');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');

// Crear tabla básica para KeyValue si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS KeyValueStore (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS SyncQueue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Asegurarnos de que exista un estado inicial de suscripción (inactivo por defecto si no existe)
const checkSub = db.prepare('SELECT value FROM KeyValueStore WHERE key = ?');
const row = checkSub.get('subscription_status');
if (!row) {
  const initSub = db.prepare('INSERT INTO KeyValueStore (key, value) VALUES (?, ?)');
  initSub.run('subscription_status', JSON.stringify('inactive'));
}

// Handlers IPC para la base de datos
ipcMain.handle('save-data', (event, key, data) => {
  try {
    const stmt = db.prepare('INSERT OR REPLACE INTO KeyValueStore (key, value) VALUES (?, ?)');
    stmt.run(key, JSON.stringify(data));
    return { success: true };
  } catch (err) {
    console.error('Error guardando en DB:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-data', (event, key) => {
  try {
    const stmt = db.prepare('SELECT value FROM KeyValueStore WHERE key = ?');
    const row = stmt.get(key);
    return row ? JSON.parse(row.value) : null;
  } catch (err) {
    console.error('Error leyendo DB:', err);
    return null;
  }
});

// Sirve la carpeta 'out' en el esquema app://-
const loadURL = serve({ directory: 'out' });

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true
    },
    icon: path.join(__dirname, 'public/favicon.ico'),
    title: 'EduPanel - Panel de Control para Docentes'
  });

  if (process.env.ELECTRON_START_URL) {
    // Modo desarrollo
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    // Modo producción empaquetado (usa app://-)
    loadURL(mainWindow);
  }

  // Remove menu bar for a cleaner look
  mainWindow.setMenuBarVisibility(false);
  
  // Interceptar cabeceras para permitir que Canva se incruste en WebView
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = Object.assign({}, details.responseHeaders);
    
    // Si la URL es de Canva o WhatsApp, removemos las cabeceras que bloquean el iframe/webview
    if (details.url.includes('canva.com') || details.url.includes('canva') || details.url.includes('whatsapp.com')) {
      delete responseHeaders['x-frame-options'];
      delete responseHeaders['X-Frame-Options'];
      delete responseHeaders['content-security-policy'];
      delete responseHeaders['Content-Security-Policy'];
    }
    
    callback({ cancel: false, responseHeaders });
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
