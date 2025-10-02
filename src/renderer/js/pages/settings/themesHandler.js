
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
      bgListContainer.innerHTML = `
                      <div class="col-12">
                        <div class="text-center py-5 text-muted">
                          <i class="bi bi-images fs-1 mb-3 d-block"></i>
                          <p class="mb-0">${window.i18n.translate("pages.settings.themes.custom.noAvailableBgImages")}</p>
                        </div>
                      </div>
        `;
      return;
    }
    const noBackgroundCol = document.createElement('div');
    noBackgroundCol.className = 'col-lg-3 col-md-4 col-sm-6 col-12';
    noBackgroundCol.innerHTML = `
            <div class="d-flex justify-content-center align-items-center bg-image-preview border rounded" data-image="none">
              <div class="text-center">
                <i class="bi bi-slash-circle fs-1 mb-2 pe-none"></i>
                <div class="small pe-none">${window.i18n.translate("pages.settings.themes.custom.noBackground")}</div>
              </div>
            </div>
          `;
    bgListContainer.appendChild(noBackgroundCol);
    const sortedFiles = files.sort((a, b) => b.includes('default-') - a.includes('default-'));
    sortedFiles.forEach(file => {
      const col = document.createElement('div');
      col.className = 'col-lg-3 col-md-4 col-sm-6 col-12';
      col.innerHTML = `
                  <div class="bg-image-container">
                    <img src="file:///${folderPath.replace(/\\/g, '/')}/${file}" alt="${file}" class="img-fluid bg-image-preview mb-2" data-image="${file}">
                    ${file.includes('default-') ? '' :
                    `<button class="bg-image-delete-btn" data-deletefile="${file}" title="Bild löschen">
                      <i class="bi bi-trash"></i>
                    </button>`}

                  </div>
              `;
      bgListContainer.appendChild(col);
    });

    const addBackgroundCol = document.createElement('div');
    addBackgroundCol.className = 'col-lg-3 col-md-4 col-sm-6 col-12';
    addBackgroundCol.innerHTML = `
            <div class="d-flex justify-content-center align-items-center bg-image-add border rounded" id="add-bg">
              <div class="text-center">
                <i class="bi bi-plus-circle fs-1 mb-2 pe-none"></i>
                <div class="small pe-none">${window.i18n.translate("pages.settings.themes.custom.addBackground")}</div>
              </div>
            </div>
          `;
    bgListContainer.appendChild(addBackgroundCol);

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
    }
    loadGlobalTheme();
    showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.themes.messages.backgroundImageApplied")}` });
  } catch (error) {
    console.error('Fehler beim Anwenden des Hintergrundbilds:', error);
    showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.themes.messages.backgroundImageError")}` });
  }
}

export async function deleteBackgroundImage(fileName) {
  try {
    const result = await window.electronAPI.deleteBackgroundImage(fileName);
    showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.themes.messages.backgroundImageDeleted")}` });
    loadBackgroundImages();
  } catch (error) {
    console.error('Fehler beim Löschen des Hintergrundbilds:', error);
    showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.themes.messages.backgroundImageDeleteError")}` });
  }
}

export async function saveNewBackgroundImage() {
  try {
    const uploadedBg = document.getElementById("import-background").files[0];
    await window.electronAPI.saveBackgroundImage(uploadedBg);
    loadBackgroundImages();

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