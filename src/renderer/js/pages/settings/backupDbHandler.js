import { showFeedback } from "../../shared/shared.js";

export function init() {
  listBackups();
}

if (window.i18n) {
  await window.i18n.ready;
}

export async function restoreBackup(backupFilename) {
  try {
    console.log(backupFilename);
    const result = await window.electronAPI.restoreDbBackup(backupFilename);
    showFeedback({ success: result, message: `${window.i18n.translate("pages.settings.backupDb.backupsList.messages.restoreSuccess")}` });
  } catch (error) {
    console.error('Fehler beim Wiederherstellen des Backups:', error);
    showFeedback({ success: result, message: `${window.i18n.translate("pages.settings.backupDb.backupsList.messages.restoreError")}` });

  }
}

export async function fullyDeleteBackup(backupFilename) {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'deleteBackupModal';
  modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-secondary">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-danger">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            ${window.i18n.translate("pages.settings.backupDb.backupsList.modal.title")}
                        </h5>
                        <button type="button" class="btn-close btn-close-white btn-outline-primary" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-light">
                        <div class="alert alert-danger bg-secondary border-danger mb-4 text-primary" role="alert">
                            <p class="mb-2">
                            <strong>${window.i18n.translate("pages.settings.backupDb.backupsList.modal.warning")}</strong>
                            </p>
                        </div>
                        <p>
                        ${window.i18n.translate("pages.settings.backupDb.backupsList.modal.confirmThis1")}
                        "<strong>${window.i18n.translate("pages.settings.backupDb.backupsList.modal.confirmThisWord")}</strong>"
                        ${window.i18n.translate("pages.settings.backupDb.backupsList.modal.confirmThis2")}
                        </p>
                        <input type="text" class="form-control bg-dark border-secondary text-light mt-3" 
                               id="confirmResetText" placeholder="${window.i18n.translate("pages.settings.backupDb.backupsList.modal.confirmThisWord")}" autocomplete="off">
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            ${window.i18n.translate("pages.settings.backupDb.backupsList.modal.cancelButton")}
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmBackupDelete" data-filename="${backupFilename}" disabled>
                            <i class="bi bi-trash3 me-2"></i>${window.i18n.translate("pages.settings.backupDb.backupsList.modal.deleteButton")}
                        </button>
                    </div>
                </div>
            </div>
        `;

  document.body.appendChild(modal);
  const deleteBackupModal = new bootstrap.Modal(modal);
  deleteBackupModal.show();

  const confirmInput = document.getElementById('confirmResetText');
  const confirmButton = document.getElementById('confirmBackupDelete');
  const requiredText = `${window.i18n.translate("pages.settings.backupDb.backupsList.modal.confirmThisWord")}`;

  confirmInput.addEventListener('input', () => {
    if (confirmInput.value === requiredText) {
      confirmButton.disabled = false;
    } else {
      confirmButton.disabled = true;
    }
  });

  confirmButton.addEventListener('click', async () => {
    const backupFilename = confirmButton.dataset.filename;
    if (confirmInput.value === requiredText) {
      try {
        const result = await window.electronAPI.deleteDbBackup(backupFilename);
        showFeedback({ success: result, message: `${window.i18n.translate("pages.settings.backupDb.backupsList.messages.deleteSuccess")}` });
      } catch (error) {
        console.error('Fehler beim endgültigen Löschen des Backups:', error);
        showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.backupDb.backupsList.messages.deleteError")}` });
      } finally {
        deleteBackupModal.hide();
        listBackups();
      }
    }
  });

  modal.addEventListener('hidden.bs.modal', () => {
    modal.remove();
  });
}

export async function backupCurrentDatabase() {
  const btn = document.getElementById('backup-database-btn');
  const oldBtn = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<i class="bi bi-arrow-repeat spin me-2"></i> ${window.i18n.translate("pages.settings.backupDb.starting")}`;

  try {
    await window.electronAPI.createDbBackup();
    showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.backupDb.messages.backupSuccess")}` });
  } catch (error) {
    console.error('Fehler beim Erstellen des Backups:', error);
    showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.backupDb.messages.dbBackupFailed")}` });
  } finally {
    btn.disabled = false;
    btn.innerHTML = oldBtn;
    listBackups();
  }
};

async function listBackups() {
  try {
    const backupListContainer = document.getElementById('backup-list');
    const backups = await window.electronAPI.listBackups();
    backupListContainer.innerHTML = '';
    console.log(backups);
    if (backups.length === 0) {
      backupListContainer.innerHTML = `<p class="text-muted">${window.i18n.translate("pages.settings.backupDb.backupsList.noBackups")}</p>`;
      return;
    }

    const table = document.createElement('table');


    const thead = document.createElement('thead');
    thead.innerHTML = `
                <tr>
                    <th>${window.i18n.translate("pages.settings.backupDb.backupsList.tableHeaders.date")}</th>
                    <th>${window.i18n.translate("pages.settings.backupDb.backupsList.tableHeaders.time")}</th>
                    <th>${window.i18n.translate("pages.settings.backupDb.backupsList.tableHeaders.actions")}</th>
                </tr>
            `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    backups.forEach(backup => {
      const row = document.createElement('tr');
      const parsedFilename = parseBackupFilename(backup);
      row.innerHTML = `
                    <td>${parsedFilename.date}</td>
                    <td>${parsedFilename.time}</td>
                    <td class="text-center">
                        <button class="btn btn-success btn-sm restore-backup-btn" title="${window.i18n.translate("pages.settings.backupDb.backupsList.buttons.restore")}" data-filename="${parsedFilename.originalFilename}">
                            <i class="bi bi-arrow-counterclockwise"></i>
                        </button>
                        <button class="btn btn-danger btn-sm fully-delete-backup-btn" title="${window.i18n.translate("pages.settings.backupDb.backupsList.buttons.delete")}" data-filename="${parsedFilename.originalFilename}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    backupListContainer.appendChild(table);

  } catch (error) {
    console.error('Fehler beim Laden der Backups:', error);
  }
}

function parseBackupFilename(filename) {
  const cleanFilename = filename.replace('database-backup-', '').replace('.db', '');
  const [datePart, timePart] = cleanFilename.split('T');
  const [year, month, day] = datePart.split('-');
  const reorderedDate = `${day}.${month}.${year}`;

  const [hours, minutes, seconds] = timePart.split('-');
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  return {
    date: reorderedDate,
    time: formattedTime,
    originalFilename: filename
  }
}

export function openBackupsFolder() {
  window.electronAPI.openUserDataFolder();
}