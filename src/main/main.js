const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Services importieren
const { createMainWindow, getSettingsWindow } = require('./services/windowService');
const { setupDefaultBackgrounds } = require('./services/fileService');
const { registerIpcHandlers } = require('./services/ipcHandlers');

let db;
let mainWindow;

const createWindow = () => {
  mainWindow = createMainWindow();

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  } else {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 3000);
  }
};

app.whenReady().then(() => {
  setupDefaultBackgrounds();
  
  // Datenbank initialisieren
  const dbPath = path.join(app.getPath('userData'), 'database.db');
  db = new sqlite3.Database(dbPath);

  db.run('PRAGMA foreign_keys = ON;');

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

  registerIpcHandlers(db);
  createWindow();
});

// Auto-Updater Events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
  const settingsWindow = getSettingsWindow();
  if (settingsWindow) {
    settingsWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  const settingsWindow = getSettingsWindow();
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
  const settingsWindow = getSettingsWindow();
  if (settingsWindow) {
    settingsWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  const settingsWindow = getSettingsWindow();
  if (settingsWindow) {
    settingsWindow.webContents.send('update-downloaded', info);
  }
});