const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    dbQuery: (sql, params) => ipcRenderer.invoke('db-query', sql, params),
    loadTheme: () => ipcRenderer.invoke('load-theme'),
    saveTheme: (themeData) => ipcRenderer.invoke('save-theme', themeData),
    // Update-Funktionen hinzufügen
    restartApp: () => ipcRenderer.invoke('restart-app'),
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    // Update-Events empfangen
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback)
})