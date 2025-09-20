const { app, BrowserWindow, ipcMain } = require('electron')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

let db;

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        resizable: true,
        maximizable: true,
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
    db.run(`CREATE TABLE IF NOT EXISTS technologies (
        tech_id INTEGER PRIMARY KEY AUTOINCREMENT,
        tech_name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
    db.run(`CREATE TABLE IF NOT EXISTS commands (
        command_id INTEGER PRIMARY KEY AUTOINCREMENT,
        tech_id INTEGER NOT NULL,
        titel TEXT NOT NULL,
        command TEXT NOT NULL,
        beschreibung TEXT,
        source TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tech_id) REFERENCES technologies (tech_id) ON DELETE CASCADE
    )`)

    // Modernisierter Handler für verschiedene SQL-Operationen
    ipcMain.handle('db-query', async (event, sql, params) => {
        return new Promise((resolve, reject) => {
            if (sql.trim().startsWith('SELECT')) {
                // Für SELECT-Queries
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err)
                    else resolve(rows)
                })
            } else {
                // Für INSERT, UPDATE, DELETE-Queries
                db.run(sql, params, function (err) {
                    if (err) reject(err)
                    else resolve({
                        changes: this.changes,
                        lastID: this.lastID
                    })
                })
            }
        })
    })

    createWindow()
})