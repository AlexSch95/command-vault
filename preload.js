const { contextBridge, ipcRenderer } = require('electron')

//desc: schnittstelle zwischen dem frontend und dem backend (main.js) - die funktionen werden im frontend aufrufbar
//desc: und erlauben kommunikation mit dem "backend" (IPC - inter-process communication)
contextBridge.exposeInMainWorld('electronAPI', {
    dbQuery: (sql, params) => ipcRenderer.invoke('db-query', sql, params),
    loadTheme: () => ipcRenderer.invoke('load-theme'),
    saveTheme: (themeData) => ipcRenderer.invoke('save-theme', themeData),
    restartApp: () => ipcRenderer.invoke('restart-app'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback)
})