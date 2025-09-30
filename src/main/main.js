const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let db;
let mainWindow;
let settingsWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    frame: false,
    resizable: true,
    maximizable: true,
    fullscreenable: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../renderer/assets/safe.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      contextMenus: true,
      preload: path.join(__dirname, '../preload/preload.js')
    }
  })

  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = Menu.buildFromTemplate([
      { label: 'Kopieren', role: 'copy' },
      { label: 'Einfügen', role: 'paste' },
      { label: 'Ausschneiden', role: 'cut' },
    ]);

    menu.popup({ window: mainWindow });
  });

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
    )`);
  db.run(`CREATE TABLE IF NOT EXISTS commands (
        command_id INTEGER PRIMARY KEY AUTOINCREMENT,
        tech_id INTEGER NOT NULL,
        titel TEXT NOT NULL,
        command TEXT NOT NULL,
        beschreibung TEXT,
        source TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tech_id) REFERENCES technologies (tech_id) ON DELETE CASCADE
    )`);
  db.run(`CREATE TABLE IF NOT EXISTS deleted_commands (
        command_id INTEGER PRIMARY KEY AUTOINCREMENT,
        tech_id INTEGER NOT NULL,
        tech_name TEXT NOT NULL,
        tech_color TEXT NOT NULL,
        titel TEXT NOT NULL,
        command TEXT NOT NULL,
        beschreibung TEXT,
        source TEXT,
        deleted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  ipcMain.handle('create-db-backup', async () => {
    try {
      const dbPath = path.join(app.getPath('userData'), 'database.db');
      const backupPath = path.join(app.getPath('userData'), 'backups');

      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`;

      const backupFile = path.join(backupPath, `database-backup-${timestamp}.db`);

      fs.copyFileSync(dbPath, backupFile);

      return { success: true, path: backupFile };
    } catch (error) {
      console.error('Fehler beim Erstellen des Backups:', error);
      return { success: false, message: 'Db Backup failed' };
    }
  });

  ipcMain.handle('list-backups', async () => {
    try {
      const backupPath = path.join(app.getPath('userData'), 'backups');
      const files = fs.readdirSync(backupPath)
        .filter(file => file.endsWith('.db'))
        .map(file => {
          const filePath = path.join(backupPath, file);
          const stats = fs.statSync(filePath);
          return { file, birthtime: stats.birthtime };
        })
        .sort((a, b) => b.birthtime - a.birthtime)
        .map(entry => entry.file);

      return files;
    } catch (error) {
      console.error('Fehler beim Auflisten der Backups:', error);
      return [];
    }
  });

  ipcMain.handle('restore-db-backup', async (event, backupFileName) => {
    try {
      const dbPath = path.join(app.getPath('userData'), 'database.db');
      const backupPath = path.join(app.getPath('userData'), 'backups', backupFileName);

      await new Promise((resolve, reject) => {
        db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
      }

      fs.copyFileSync(backupPath, dbPath);
      db = new sqlite3.Database(dbPath);
      return true;

    } catch (error) {
      console.error('Fehler beim Wiederherstellen des Backups:', error);
      return false;
    }
  });

  ipcMain.handle('delete-backup', async (event, backupFileName) => {
    try {
      const backupPath = path.join(app.getPath('userData'), 'backups', backupFileName);
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Fehler beim Löschen des Backups:', error);
      return false;
    }
  });

  ipcMain.handle('open-settings', () => {
    const [mainWidth, mainHeight] = mainWindow.getSize();
    const settingsWidth = Math.floor(mainWidth * 0.8);
    const settingsHeight = Math.floor(mainHeight * 0.8);
    settingsWindow = new BrowserWindow({
      width: settingsWidth,
      height: settingsHeight,
      frame: false,
      resizable: true,
      maximizable: false,
      movable: true,
      fullscreenable: false,
      autoHideMenuBar: false,
      icon: path.join(__dirname, '../renderer/assets/safe.ico'),
      parent: mainWindow,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        contextMenus: true,
        preload: path.join(__dirname, '../preload/preload.js')  // Wichtig!
      }
    });

    settingsWindow.webContents.on('context-menu', (event, params) => {
      const menu = Menu.buildFromTemplate([
        { label: 'Kopieren', role: 'copy' },
        { label: 'Einfügen', role: 'paste' },
        { label: 'Ausschneiden', role: 'cut' },
      ]);

      settingsWindow.webContents.openDevTools();

      menu.popup({ window: settingsWindow });
    });


    settingsWindow.loadFile(path.join(__dirname, '../renderer/pages/settings.html'));

    settingsWindow.on('closed', () => {
      mainWindow.webContents.send('settings-closed');
    });
  });

  ipcMain.handle('minimize-window', () => {
    if (mainWindow) {
      mainWindow.minimize();
    };
  });

  ipcMain.handle('close-window', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  ipcMain.handle('close-settings', () => {
    if (settingsWindow) {
      settingsWindow.close();
    }
  });

  ipcMain.handle('open-user-data', () => {
    const userDataPath = app.getPath('userData');
    shell.openPath(userDataPath);
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
    if (settingsWindow) {
      settingsWindow.close();
    }
    setTimeout(() => {

      autoUpdater.quitAndInstall();
    }, 100);
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
  if (settingsWindow) {
    settingsWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  if (settingsWindow) {
    settingsWindow.webContents.send('update-not-available', info);
  }
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
  if (settingsWindow) {
    settingsWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  if (settingsWindow) {
    settingsWindow.webContents.send('update-downloaded', info);
  }
});