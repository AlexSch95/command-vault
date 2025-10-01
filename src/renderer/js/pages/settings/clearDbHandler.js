import { showFeedback } from "../../shared/shared.js";

if (window.i18n) {
  await window.i18n.ready;
}

export async function handleDatabaseReset(event) {
  event.preventDefault();

  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'resetDatabaseModal';
  modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-secondary">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-danger">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            ${window.i18n.translate("pages.settings.clearDb.modal.title")}
                        </h5>
                        <button type="button" class="btn-close btn-close-white btn-outline-primary" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-light">
                        <div class="alert alert-danger bg-secondary border-danger mb-4 text-primary" role="alert">
                            <p class="mb-2">
                            <strong>${window.i18n.translate("pages.settings.clearDb.modal.lastWarning")}</strong>
                            </p>
                            <p class="mb-2"><strong>${window.i18n.translate("pages.settings.clearDb.modal.warningText1")}</strong></p>
                            <p class="mb-0 small">${window.i18n.translate("pages.settings.clearDb.modal.warningText2")}</p>
                        </div>
                        <p>
                        ${window.i18n.translate("pages.settings.clearDb.modal.confirmThis1")}
                        "<strong>${window.i18n.translate("pages.settings.clearDb.modal.confirmThisWord")}</strong>"
                        ${window.i18n.translate("pages.settings.clearDb.modal.confirmThis2")}
                        </p>
                        <input type="text" class="form-control bg-dark border-secondary text-light mt-3" 
                               id="confirmResetText" placeholder="${window.i18n.translate("pages.settings.clearDb.modal.confirmThisWord")}" autocomplete="off">
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            ${window.i18n.translate("pages.settings.clearDb.modal.cancelButton")}
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmReset" disabled>
                            <i class="bi bi-trash3 me-2"></i>${window.i18n.translate("pages.settings.clearDb.modal.deleteButton")}
                        </button>
                    </div>
                </div>
            </div>
        `;

  document.body.appendChild(modal);
  const dbResetModal = new bootstrap.Modal(modal);
  dbResetModal.show();

  const confirmInput = document.getElementById('confirmResetText');
  const confirmButton = document.getElementById('confirmReset');
  const requiredText = `${window.i18n.translate("pages.settings.clearDb.modal.confirmThisWord")}`;

  confirmInput.addEventListener('input', () => {
    if (confirmInput.value === requiredText) {
      confirmButton.disabled = false;
    } else {
      confirmButton.disabled = true;
    }
  });

  confirmButton.addEventListener('click', async () => {
    if (confirmInput.value === requiredText) {
      try {
        await window.electronAPI.dbQuery('DELETE FROM commands');
        await window.electronAPI.dbQuery('DELETE FROM technologies');
        await window.electronAPI.dbQuery('DELETE FROM deleted_commands');

        showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.clearDb.messages.dbResetSuccess")}` });

        setTimeout(() => {
          window.location.reload();
        }, 2000);

        dbResetModal.hide();
      } catch (error) {
        console.error('Datenbank Fehler:', error);
        showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.clearDb.messages.dbResetError")}` });
      }
    }
  });

  modal.addEventListener('hidden.bs.modal', () => {
    modal.remove();
  });
}