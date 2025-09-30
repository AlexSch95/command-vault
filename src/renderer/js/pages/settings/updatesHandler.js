import { showFeedback } from "../../shared/shared.js";


if (window.i18n) {
    await window.i18n.ready;
}


export async function checkUpdates() {
    const btn = document.getElementById('check-updates-btn');

    btn.disabled = true;
    btn.innerHTML = `<i class="bi bi-arrow-repeat spin me-2"></i> ${window.i18n ? window.i18n.translate("pages.settings.update.checking") : "Suche nach Updates..."}`;

    try {
        await window.electronAPI.checkForUpdates();
        showUpdateStatus(`${window.i18n ? window.i18n.translate("pages.settings.update.checking") : "Suche nach Updates..."}`, 'info');
    } catch (error) {
        showUpdateStatus(`${window.i18n ? window.i18n.translate("pages.settings.update.error") : "Fehler beim Suchen nach Updates"}`, 'danger');
    }

    setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-search me-2"></i> ${window.i18n ? window.i18n.translate("pages.settings.update.checkUpdatesButton") : "Nach Updates suchen"}`;
    }, 3000);
}

export function showUpdateStatus(message, type) {
    const statusDiv = document.getElementById('update-status');
    statusDiv.classList.remove('d-none');
    statusDiv.innerHTML = `
            <div class="alert alert-${type}">
                <i class="bi bi-info-circle me-2"></i>${message}
            </div>
        `;
}