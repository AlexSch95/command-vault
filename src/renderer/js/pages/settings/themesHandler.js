
import { themes } from "../../shared/presetThemes.js";
import { showFeedback } from "../../shared/shared.js";

export function init() {
  setupCurrentColors();
}

if (window.i18n) {
  await window.i18n.ready;
}

export async function setupCurrentColors() {
  try {
    const savedTheme = await window.electronAPI.loadTheme();

    if (savedTheme) {
      document.getElementById('bg-primary-color').value = savedTheme.bgPrimary;
      document.getElementById('bg-secondary-color').value = savedTheme.bgSecondary;
      document.getElementById('border-color').value = savedTheme.borderColor;
      document.getElementById('text-primary-color').value = savedTheme.textPrimary;
      document.getElementById('accent-color').value = savedTheme.accentColor;
      document.getElementById('text-color-code').value = savedTheme.textColorCode;
    }
  } catch (error) {
    console.error('Fehler beim Laden der aktuellen Farben', error);
  }
}

export function customTheme() {
  const themeData = {
    bgPrimary: document.getElementById('bg-primary-color').value,
    bgSecondary: document.getElementById('bg-secondary-color').value,
    borderColor: document.getElementById('border-color').value,
    textPrimary: document.getElementById('text-primary-color').value,
    accentColor: document.getElementById('accent-color').value,
    textColorCode: document.getElementById('text-color-code').value
  };
  applyTheme(themeData);
}

export async function applyTheme(chosenTheme) {
  let themeData;

  if (typeof chosenTheme === 'string') {
    themeData = themes[chosenTheme]
  } else {
    themeData = chosenTheme;
  }

  const root = document.documentElement;
  root.style.setProperty('--bg-primary', themeData.bgPrimary);
  root.style.setProperty('--bg-secondary', themeData.bgSecondary);
  root.style.setProperty('--border-color', themeData.borderColor);
  root.style.setProperty('--text-primary', themeData.textPrimary);
  root.style.setProperty('--accent-color', themeData.accentColor);
  root.style.setProperty('--text-color-code', themeData.textColorCode);
  try {
    const result = await window.electronAPI.saveTheme(themeData);
    if (result.success) {
      showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.themes.messages.themeApplied")}` });
    } else {
      showFeedback(result);
    }
  } catch (error) {
    console.error('Fehler beim Speichern des vordefinierten Themes:', error);
    showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.themes.messages.themeSaveError")}` });
  } finally {
    setupCurrentColors();
  }
}