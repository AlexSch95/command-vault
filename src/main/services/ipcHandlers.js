const { ipcMain, app } = require('electron');
const { autoUpdater } = require('electron-updater');
const { createBackup, listBackups, restoreBackup, deleteBackup } = require('./backupService');
const { listBackgroundImages, saveBackgroundImage, deleteBackgroundImage, openUserData } = require('./fileService');
const { createSettingsWindow, getMainWindow, getSettingsWindow } = require('./windowService');
const { loadTheme, saveTheme } = require('./themeService');

const registerIpcHandlers = (db) => {
  // Database handlers
  ipcMain.handle('db-query', async (event, sql, params) => {
    return new Promise((resolve, reject) => {
      if (sql.trim().startsWith('SELECT')) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        db.run(sql, params, function (err) {
          if (err) reject(err);
          else resolve({
            changes: this.changes,
            lastID: this.lastID
          });
        });
      }
    });
  });

  // Backup handlers
  ipcMain.handle('create-db-backup', createBackup);
  ipcMain.handle('list-backups', listBackups);
  ipcMain.handle('restore-db-backup', async (event, backupFileName) => {
    return restoreBackup(backupFileName, db);
  });
  ipcMain.handle('delete-backup', async (event, backupFileName) => {
    return deleteBackup(backupFileName);
  });

  // File handlers
  ipcMain.handle('list-background-images', listBackgroundImages);
  ipcMain.handle('save-background-image', async (event, fileData) => {
    return saveBackgroundImage(fileData);
  });
  ipcMain.handle('delete-background-image', async (event, fileName) => {
    return deleteBackgroundImage(fileName);
  });
  ipcMain.handle('open-user-data', openUserData);

  // Window handlers
  ipcMain.handle('open-settings', () => {
    createSettingsWindow();
  });

  ipcMain.handle('minimize-window', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.handle('close-window', () => {
    const mainWindow = getMainWindow();
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('close-settings', () => {
    const settingsWindow = getSettingsWindow();
    if (settingsWindow) settingsWindow.close();
  });

  // Theme handlers
  ipcMain.handle('load-theme', loadTheme);
  ipcMain.handle('save-theme', async (event, themeData) => {
    return saveTheme(themeData);
  });

  // App handlers
  ipcMain.handle('get-user-data-path', () => {
    return app.getPath('userData');
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Update handlers
  ipcMain.handle('restart-app', () => {
    const settingsWindow = getSettingsWindow();
    if (settingsWindow) settingsWindow.close();
    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 100);
  });

  ipcMain.handle('check-for-updates', () => {
    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });
};

module.exports = {
  registerIpcHandlers
};