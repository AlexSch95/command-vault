const { app, BrowserWindow, ipcMain } = require('electron')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

let db;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // <- Das ist wichtig!
    }
  })

  win.loadFile('index.html')
}

// Datenbank initialisieren
app.whenReady().then(() => {
  db = new sqlite3.Database('database.db')
  
  // Tabelle erstellen falls sie nicht existiert
  db.run(`CREATE TABLE IF NOT EXISTS commands (
    command_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tech TEXT NOT NULL,
    titel TEXT NOT NULL,
    command TEXT NOT NULL,
    beschreibung TEXT,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
  
  // Beispiel Handler
  ipcMain.handle('db-query', async (event, sql, params) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  })
  
  createWindow()
})