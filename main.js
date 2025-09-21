const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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

    // Foreign Keys aktivieren (wichtig für CASCADE DELETE)
    db.run('PRAGMA foreign_keys = ON;')

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

    ipcMain.handle('load-theme', async () => {
        try {
            const themePath = path.join(app.getPath('userData'), 'user-theme.json');
            if (fs.existsSync(themePath)) {
                const themeData = fs.readFileSync(themePath, 'utf8');
                return JSON.parse(themeData);
            }
            return null; // Standard Theme verwenden
        } catch (error) {
            console.error('Fehler beim Laden des Themes:', error);
            return null;
        }
    });

    ipcMain.handle('save-theme', async (event, themeData) => {
        try {
            const themePath = path.join(app.getPath('userData'), 'user-theme.json');
            fs.writeFileSync(themePath, JSON.stringify(themeData, null, 2));
            return { success: true, message: 'Theme erfolgreich gespeichert!' };
        } catch (error) {
            console.error('Fehler beim Speichern des Themes:', error);
            return { success: false, message: 'Fehler beim Speichern des Themes.' };
        }
    });

    createWindow()
})