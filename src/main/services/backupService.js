const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const createBackup = async () => {
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
};

const listBackups = async () => {
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
};

const restoreBackup = async (backupFileName, db) => {
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
    return true;
  } catch (error) {
    console.error('Fehler beim Wiederherstellen des Backups:', error);
    return false;
  }
};

const deleteBackup = async (backupFileName) => {
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
};

module.exports = {
  createBackup,
  listBackups,
  restoreBackup,
  deleteBackup
};