const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const loadTheme = async () => {
  try {
    const themePath = path.join(app.getPath('userData'), 'user-theme.json');
    if (fs.existsSync(themePath)) {
      const themeData = fs.readFileSync(themePath, 'utf8');
      return JSON.parse(themeData);
    } else {
      const defaultTheme = {
        bgPrimary: "#2e2e2e",
        bgSecondary: "#383838",
        borderColor: "#7a7a7a",
        textPrimary: "#f1f5f9",
        accentColor: "#484a60",
        textColorCode: "#27e70d",
        backgroundImage: "default-dark.png"
      };
      fs.writeFileSync(themePath, JSON.stringify(defaultTheme, null, 2));
      return defaultTheme;
    }
  } catch (error) {
    console.error('Fehler beim Laden des Themes:', error);
    return null;
  }
};

const saveTheme = async (themeData) => {
  try {
    const themePath = path.join(app.getPath('userData'), 'user-theme.json');
    fs.writeFileSync(themePath, JSON.stringify(themeData, null, 2));
    return { success: true, message: 'Theme erfolgreich gespeichert!' };
  } catch (error) {
    console.error('Fehler beim Speichern des Themes:', error);
    return { success: false, message: 'Fehler beim Speichern des Themes.' };
  }
};

module.exports = {
  loadTheme,
  saveTheme
};