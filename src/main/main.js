const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let db;
let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        resizable: true,
        maximizable: true,
        fullscreenable: false,
        autoHideMenuBar: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, '../preload/preload.js')
        }
    })

    mainWindow.loadFile(path.join(__dirname, '../renderer/pages/index.html'))

    // desc: devtools werden automatisch geöffnet wenn in der entwicklungsumgebung
    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    } else {
        setTimeout(() => {
            autoUpdater.checkForUpdatesAndNotify();
        }, 3000);
    }
}

//desc: App initialisierung und DB und Tabellen erstellen wenn noch keine vorhanden
app.whenReady().then(() => {
    //desc: Datenbank im User Data Directory öffnen damit bei autoupdate keine Probleme auftreten (db gelöscht)
    const dbPath = path.join(app.getPath('userData'), 'database.db');
    db = new sqlite3.Database(dbPath);

    //desc: Foreign Keys aktivieren (damit ON DELETE CASCADE funktioniert)
    db.run('PRAGMA foreign_keys = ON;')

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

    ipcMain.handle('create-db-backup', async () => {
        try {
            const dbPath = path.join(app.getPath('userData'), 'database.db');
            const backupPath = path.join(app.getPath('userData'), 'backups');

            if (!fs.existsSync(backupPath)) {
                fs.mkdirSync(backupPath, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(backupPath, `database-backup-${timestamp}.db`);

            fs.copyFileSync(dbPath, backupFile);

            return { success: true, path: backupFile };
        } catch (error) {
            console.error('Fehler beim Erstellen des Backups:', error);
            return { success: false, message: 'Db Backup failed'};
        }
    });

    //desc: SQL Query Handler der zwischen SELECT und allem anderen unterscheidet
    ipcMain.handle('db-query', async (event, sql, params) => {
        return new Promise((resolve, reject) => {
            if (sql.trim().startsWith('SELECT')) {
                //desc: Für SELECT-Queries
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err)
                    else resolve(rows)
                })
            } else {
                //desc: Für INSERT, UPDATE, DELETE-Queries
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

    //desc: Theme laden
    ipcMain.handle('load-theme', async () => {
        try {
            const themePath = path.join(app.getPath('userData'), 'user-theme.json');
            if (fs.existsSync(themePath)) {
                const themeData = fs.readFileSync(themePath, 'utf8');
                return JSON.parse(themeData);
            }
            return null;
        } catch (error) {
            console.error('Fehler beim Laden des Themes:', error);
            return null;
        }
    });

    //desc: theme speichern
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

    //desc: updatefunktionen
    ipcMain.handle('restart-app', () => {
        autoUpdater.quitAndInstall();
    });

    ipcMain.handle('check-for-updates', () => {
        if (app.isPackaged) {
            autoUpdater.checkForUpdatesAndNotify();
        }
    });

    createWindow()
})

// Auto-Updater Events
autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
    console.log('Update available.');
    if (mainWindow) {
        mainWindow.webContents.send('update-available', info);
    }
});

autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
    if (mainWindow) {
        mainWindow.webContents.send('download-progress', progressObj);
    }
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    if (mainWindow) {
        mainWindow.webContents.send('update-downloaded', info);
    }
});