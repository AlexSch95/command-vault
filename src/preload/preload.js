const { contextBridge, ipcRenderer } = require('electron')

//desc: schnittstelle zwischen dem frontend und dem backend (main.js) - die funktionen werden im frontend aufrufbar
//desc: und erlauben kommunikation mit dem "backend" (IPC - inter-process communication)
contextBridge.exposeInMainWorld('electronAPI', {
  dbQuery: (sql, params) => ipcRenderer.invoke('db-query', sql, params),
  loadTheme: () => ipcRenderer.invoke('load-theme'),
  saveTheme: (themeData) => ipcRenderer.invoke('save-theme', themeData),
  restartApp: () => ipcRenderer.invoke('restart-app'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateNotAvailable: (callback) => ipcRenderer.on('update-not-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback),
  createDbBackup: () => ipcRenderer.invoke('create-db-backup'),
  openSettingsWindow: () => ipcRenderer.invoke('open-settings'),
  closeSettingsWindow: () => ipcRenderer.invoke('close-settings'),
  onSettingsClosed: (callback) => ipcRenderer.on('settings-closed', callback),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  openUserDataFolder: () => ipcRenderer.invoke('open-user-data'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  listBackups: () => ipcRenderer.invoke('list-backups'),
  restoreDbBackup: (backupFileName) => ipcRenderer.invoke('restore-db-backup', backupFileName),
  deleteDbBackup: (backupFileName) => ipcRenderer.invoke('delete-backup', backupFileName),
  listBackgroundImages: () => ipcRenderer.invoke('list-background-images'),
  deleteBackgroundImage: (fileName) => ipcRenderer.invoke('delete-background-image', fileName),
  saveBackgroundImage: async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const fileData = {
        name: file.name,
        type: file.type,
        buffer: arrayBuffer
      };
      return await ipcRenderer.invoke('save-background-image', fileData);
    } catch (error) {
      console.error('Fehler beim Speichern des Hintergrundbildes:', error);
      return { success: false, message: 'Failed to save background image' };
    }
  }
})