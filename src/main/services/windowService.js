const { BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;
let settingsWindow;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    frame: false,
    resizable: true,
    maximizable: true,
    fullscreenable: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../../renderer/assets/safe.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      contextMenus: true,
      preload: path.join(__dirname, '../../preload/preload.js')
    }
  });

  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = Menu.buildFromTemplate([
      { label: 'Copy', role: 'copy' },
      { label: 'Paste', role: 'paste' },
      { label: 'Cut', role: 'cut' },
      { type: 'separator' },
      { label: 'Open DevTools', role: 'toggleDevTools' },
      { label: 'Made by Machinezr.de', click: () => shell.openExternal('https://machinezr.de') }
    ]);

    menu.popup({ window: mainWindow });
  });

  mainWindow.loadFile(path.join(__dirname, '../../renderer/pages/index.html'));
  return mainWindow;
};

const createSettingsWindow = () => {
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
    icon: path.join(__dirname, '../../renderer/assets/safe.ico'),
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      contextMenus: true,
      preload: path.join(__dirname, '../../preload/preload.js')
    }
  });

  settingsWindow.webContents.on('context-menu', (event, params) => {
    const menu = Menu.buildFromTemplate([
      { label: 'Copy', role: 'copy' },
      { label: 'Paste', role: 'paste' },
      { label: 'Cut', role: 'cut' },
      { type: 'separator' },
      { label: 'Open DevTools', role: 'toggleDevTools' },
      { label: 'Made by Machinezr.de', click: () => shell.openExternal('https://machinezr.de') }
    ]);

    menu.popup({ window: settingsWindow });
  });

  settingsWindow.loadFile(path.join(__dirname, '../../renderer/pages/settings.html'));

  settingsWindow.on('closed', () => {
    mainWindow.webContents.send('settings-closed');
  });

  return settingsWindow;
};

module.exports = {
  createMainWindow,
  createSettingsWindow,
  getMainWindow: () => mainWindow,
  getSettingsWindow: () => settingsWindow
};