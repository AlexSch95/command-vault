import { showFeedback, loadGlobalTheme } from "../shared/shared.js";
import * as cleardbHandler from "./settings/clearDbHandler.js";
import * as themesHandler from "./settings/themesHandler.js";
import * as backupDbHandler from "./settings/backupDbHandler.js";
import * as categoriesHandler from "./settings/categoriesHandler.js";
import * as restoreCommandsHandler from "./settings/restoreCommandsHandler.js";
import * as updatesHandler from "./settings/updatesHandler.js";

document.addEventListener('DOMContentLoaded', async () => {

  if (window.i18n) {
    await window.i18n.ready;
  }

  loadGlobalTheme();
  await themesHandler.init();
  await backupDbHandler.init();
  await categoriesHandler.init();
  await restoreCommandsHandler.init();

  //desc: Globaler Schließen Button fürs Settings Fenster
  document.getElementById("close-btn").addEventListener("click", () => {
    window.electronAPI.closeSettingsWindow();
  });


  //desc: Themes Eventlistener
  document.getElementById('save-theme-btn').addEventListener('click', themesHandler.customTheme);

  document.getElementById('preset-themes').addEventListener('click', (event) => {
    const theme = event.target.dataset.theme;
    if (theme) {
      themesHandler.applyTheme(theme);
    }
  });


  //desc: DB-Reset Eventlistener
  document.getElementById('reset-database-btn').addEventListener('click', cleardbHandler.handleDatabaseReset);


  //desc: DB-Backup Eventlistener
  document.getElementById('backup-list').addEventListener('click', (event) => {
    if (event.target.classList.contains('restore-backup-btn')) {
      const backupFilename = event.target.dataset.filename;
      backupDbHandler.restoreBackup(backupFilename);
    } else if (event.target.classList.contains('fully-delete-backup-btn')) {
      const backupFilename = event.target.dataset.filename;
      backupDbHandler.fullyDeleteBackup(backupFilename);
    }
  });

  document.getElementById('backup-database-btn').addEventListener('click', backupDbHandler.backupCurrentDatabase);

  document.getElementById("open-userdata-btn").addEventListener("click", backupDbHandler.openBackupsFolder);


  //desc: Kategorien Eventlistener
  document.getElementById('add-technology-btn').addEventListener('click', (event) => {
    event.preventDefault();
    categoriesHandler.addCategory();
  });

  document.getElementById('reset-categories-btn').addEventListener('click', (event) => {
    event.preventDefault();
    categoriesHandler.loadCategories();
    document.getElementById('add-technology-form').reset();
    document.getElementById('delete-technology-btn').disabled = true;
  });

  document.getElementById('color').addEventListener('input', (event) => {
    const hexDisplay = document.getElementById('hex-display');
    hexDisplay.textContent = event.target.value;
  });

  document.getElementById('delete-technology-btn').addEventListener('click', (event) => {
    event.preventDefault();
    categoriesHandler.deleteCategory();
  });


  //desc: Befehl restoren Eventlistener
  document.getElementById('restore-commands-container').addEventListener('click', async (event) => {
    if (event.target.classList.contains('restore-command-btn')) {
      const commandId = event.target.dataset.id;
      restoreCommandsHandler.restoreCommand(commandId);
    } else if (event.target.classList.contains('fully-delete-cmd-btn')) {
      const commandId = event.target.dataset.id;
      restoreCommandsHandler.fullyDeleteCommand(commandId);
    }
  });


  //desc: Updates Bereich Eventlistener
  document.getElementById('check-updates-btn').addEventListener('click', updatesHandler.checkUpdates());

  window.electronAPI.onUpdateAvailable?.((event, info) => {
    updatesHandler.showUpdateStatus(`${window.i18n.translate("pages.settings.update.available")}${info.version}`, 'success');
    document.getElementById('update-progress').classList.remove('d-none');
  });

  window.electronAPI.onUpdateNotAvailable?.((event, info) => {
    updatesHandler.showUpdateStatus(`${window.i18n.translate("pages.settings.update.noUpdate")}`, 'info');
  });

  window.electronAPI.onDownloadProgress?.((event, progress) => {
    const progressBar = document.querySelector('#update-progress .progress-bar');
    progressBar.style.width = `${progress.percent}%`;
    progressBar.textContent = `${Math.round(progress.percent)}%`;
  });

  window.electronAPI.onUpdateDownloaded?.((event, info) => {
    const statusDiv = document.getElementById('update-status');
    statusDiv.innerHTML = `
            <div class="alert alert-success">
                <i class="bi bi-check-circle me-2"></i>
                Update v${info.version}${window.i18n.translate("pages.settings.update.downloaded")}
                <button class="btn btn-sm btn-primary ms-2" id="restart-update-btn">
                    ${window.i18n.translate("pages.settings.update.restartAndInstall")}
                </button>
            </div>
        `;

    document.getElementById('restart-update-btn').addEventListener('click', () => {
      window.electronAPI.restartApp();
    });
  });
});