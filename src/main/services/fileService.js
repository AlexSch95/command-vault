const fs = require('fs');
const path = require('path');
const { app, shell } = require('electron');

const setupDefaultBackgrounds = () => {
  try {
    const userDataPath = app.getPath('userData');
    const backgroundsPath = path.join(userDataPath, 'background-images');

    if (!fs.existsSync(backgroundsPath)) {
      fs.mkdirSync(backgroundsPath, { recursive: true });
    }

    const defaultBackgroundsPath = path.join(__dirname, '../../renderer/assets/default-backgrounds');
    const defaultBackgroundFiles = fs.readdirSync(defaultBackgroundsPath);

    defaultBackgroundFiles.forEach(file => {
      const srcPath = path.join(defaultBackgroundsPath, file);
      const destPath = path.join(backgroundsPath, file);
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  } catch (error) {
    console.error('Fehler beim Einrichten der Standard-Hintergrundbilder:', error);
  }
};

const listBackgroundImages = async () => {
  try {
    const userDataPath = app.getPath('userData');
    const backgroundsPath = path.join(userDataPath, 'background-images');

    if (!fs.existsSync(backgroundsPath)) {
      fs.mkdirSync(backgroundsPath, { recursive: true });
    }

    const files = fs.readdirSync(backgroundsPath);
    return { folderPath: backgroundsPath, files: files };
  } catch (error) {
    console.error('Fehler beim Auflisten der Hintergrundbilder:', error);
    return { folderPath: '', files: [] };
  }
};

const saveBackgroundImage = async (fileData) => {
  try {
    const userDataPath = app.getPath('userData');
    const backgroundsPath = path.join(userDataPath, 'background-images');

    if (!fs.existsSync(backgroundsPath)) {
      fs.mkdirSync(backgroundsPath, { recursive: true });
    }

    const filePath = path.join(backgroundsPath, fileData.name);
    const buffer = Buffer.from(fileData.buffer);
    fs.writeFileSync(filePath, buffer);
    return { success: true, filePath: filePath, fileName: fileData.name };

  } catch (error) {
    console.error('Fehler beim Speichern des Hintergrundbildes:', error);
    return { success: false, message: 'Failed to save background image' };
  }
};

const deleteBackgroundImage = async (fileName) => {
  try {
    const userDataPath = app.getPath('userData');
    const backgroundsPath = path.join(userDataPath, 'background-images');
    const filePath = path.join(backgroundsPath, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { success: true };
    }
    return { success: false, message: 'Background image not found' };
  } catch (error) {
    console.error('Fehler beim Löschen des Hintergrundbildes:', error);
    return { success: false, message: 'Failed to delete background image' };
  }
};

const openUserData = () => {
  const userDataPath = app.getPath('userData');
  shell.openPath(userDataPath);
};

module.exports = {
  setupDefaultBackgrounds,
  listBackgroundImages,
  saveBackgroundImage,
  deleteBackgroundImage,
  openUserData
};