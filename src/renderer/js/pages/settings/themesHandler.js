
import { themes } from "../../shared/presetThemes.js";
import { loadGlobalTheme, showFeedback } from "../../shared/shared.js";

export function init() {
  setupCurrentColors();
  loadBackgroundImages();
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

export async function loadBackgroundImages() {
  try {
    const bgListContainer = document.getElementById('backgroundimages-list');
    const { folderPath, files } = await window.electronAPI.listBackgroundImages();
    bgListContainer.innerHTML = '';
    console.log(files);
    if (files.length === 0) {
      bgListContainer.innerHTML = `<p class="text-muted">${window.i18n.translate("pages.settings.themes.custom.noAvailableBgImages")}</p>`;
      return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
                <tr>
                    <th>${window.i18n.translate("pages.settings.themes.custom.preview")}</th>
                    <th>${window.i18n.translate("pages.settings.themes.custom.availableImageName")}</th>
                    <th>${window.i18n.translate("pages.settings.themes.custom.actions")}</th>
                </tr>
            `;

    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    files.forEach(file => {
      const row = document.createElement('tr');
      row.innerHTML = `
                    <td><img src="file://${folderPath}/${file}" alt="${file}" class="bg-image-preview"/></td>
                    <td>${file}</td>
                    <td class="text-center">
                        <button class="btn btn-success btn-sm use-background-btn" data-id="${file}">
                            <i class="bi bi-arrow-counterclockwise"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-background-btn" data-id="${file}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                    `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    bgListContainer.appendChild(table);

  } catch (error) {
    console.error('Fehler beim Laden der Hintergrundbilder:', error);
  }
}

export async function applyBackgroundImage(fileName) {
  try {
    const savedTheme = await window.electronAPI.loadTheme();

    if (savedTheme) {
      savedTheme.backgroundImage = fileName;
      await window.electronAPI.saveTheme(savedTheme);
      loadBackgroundImages();
    }
    loadGlobalTheme();
  } catch (error) {
    console.error('Fehler beim Anwenden des Hintergrundbilds:', error);
  }
}

export async function saveNewBackgroundImage() { 
  try {
    const uploadedBg = document.getElementById("import-background").files[0];
    let backgroundImageName;
    if (uploadedBg) {
      const result = await window.electronAPI.saveBackgroundImage(uploadedBg);
      backgroundImageName = result.fileName;
      loadBackgroundImages();
      applyBackgroundImage(backgroundImageName);
      document.getElementById('save-new-bg-btn').disabled = true;
      document.getElementById('file-name').textContent = `${window.i18n.translate("pages.settings.themes.custom.noBgSelected")}`;
    }
    
  } catch (error) {
    console.error('Fehler beim Speichern des neuen Hintergrundbilds:', error);
  }
}

export async function customTheme() {
  const savedTheme = await window.electronAPI.loadTheme();
  const backgroundImageName = savedTheme.backgroundImage;
  const themeData = {
    bgPrimary: document.getElementById('bg-primary-color').value,
    bgSecondary: document.getElementById('bg-secondary-color').value,
    borderColor: document.getElementById('border-color').value,
    textPrimary: document.getElementById('text-primary-color').value,
    accentColor: document.getElementById('accent-color').value,
    textColorCode: document.getElementById('text-color-code').value,
    backgroundImage: backgroundImageName
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
    loadGlobalTheme();
    setupCurrentColors();
  }
}