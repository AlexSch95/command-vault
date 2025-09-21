const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    dbQuery: (sql, params) => ipcRenderer.invoke('db-query', sql, params),
    loadTheme: () => ipcRenderer.invoke('load-theme'),
    saveTheme: (themeData) => ipcRenderer.invoke('save-theme', themeData)
})