import { showFeedback, loadGlobalTheme } from "../shared/shared.js";
import { themes } from "../shared/presetThemes.js";

document.addEventListener('DOMContentLoaded', async () => {

    if (window.i18n) {
        await window.i18n.ready;
    }

    //desc: flag für den Modus - entweder aktuelle Technologien (->false) oder neue Technologie (->true)
    let newTechMode = false;

    //desc: initiale funktionsaufrufe
    loadGlobalTheme();
    loadTechnologies();
    setupCurrentColors();

    document.getElementById("close-btn").addEventListener("click", () => {
        window.electronAPI.closeSettingsWindow();
    });

    document.getElementById("open-userdata-btn").addEventListener("click", () => {
        window.electronAPI.openUserDataFolder();
    });

    //desc: lädt die user-theme.json und wendet die aktuellen Farben im Color Picker an
    async function setupCurrentColors() {
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

    //desc: generiert ein objekt aus den aktuell ausgewählten farben und ruft damit applyTheme auf
    function customTheme() {
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

    //desc: wendet ein theme an, wenn string dann aus presetThemes.js, wenn objekt dann custom
    async function applyTheme(chosenTheme) {
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
                showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("pages.settings.themes.messages.themeApplied") : "Design angewendet."}` });
            } else {
                showFeedback(result);
            }
        } catch (error) {
            console.error('Fehler beim Speichern des vordefinierten Themes:', error);
            showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("pages.settings.themes.messages.themeSaveError") : "Fehler beim Speichern des Themes."}` });
        } finally {
            setupCurrentColors();
        }
    }

    //desc: Eventlistener für die Buttons
    document.getElementById('save-theme-btn').addEventListener('click', customTheme);
    document.getElementById('reset-database-btn').addEventListener('click', handleDatabaseReset);
    document.getElementById('preset-themes').addEventListener('click', (event) => {
        const theme = event.target.dataset.theme;
        if (theme) {
            applyTheme(theme);
        }
    });

    //desc: schickt die änderungen ab, wenn newtechmode true dann insert into, wenn false dann update
    document.getElementById('add-technology-btn').addEventListener('click', async (event) => {
        event.preventDefault();
        const tech = document.getElementById('tech');
        const color = document.getElementById('color');
        if (newTechMode === true) {
            try {
                const result = await window.electronAPI.dbQuery('INSERT INTO technologies (tech_name, color) VALUES (?, ?)', [tech.value, color.value]);
                showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("pages.settings.categories.messages.categorySaved") : "Technologie erfolgreich gespeichert."}` });
                document.getElementById('add-technology-form').reset();
            } catch (error) {
                console.error('Datenbank Fehler:', error);
                showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("pages.settings.categories.messages.categorySaveError") : "Fehler beim Hinzufügen der Technologie."}` });
            }
        } else if (newTechMode === false) {
            try {
                const result = await window.electronAPI.dbQuery('UPDATE technologies SET color = ? WHERE tech_id = ?', [color.value, tech.value]);
                showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("pages.settings.categories.messages.categoryUpdated") : "Technologie erfolgreich aktualisiert."}` });
                document.getElementById('add-technology-form').reset();
            } catch (error) {
                console.error('Datenbank Fehler:', error);
                showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("pages.settings.categories.messages.categoryUpdateError") : "Fehler beim Aktualisieren der Technologie."}` });
            }
        }
        loadTechnologies();
    });

    //desc: formular resetten
    document.getElementById('reset-btn').addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById('add-technology-form').reset();
        window.location.reload();
    });

    //desc: updatet die hex-anzeige wenn der colorpicker wert sich ändert
    document.getElementById('color').addEventListener('input', (event) => {
        const hexDisplay = document.getElementById('hex-display');
        hexDisplay.textContent = event.target.value;
    });

    //desc: löschfunktion für vorhandene technologien mit modal
    //desc: modal verlangt den Technologienamen als bestätigungstext
    //desc: weist mehrfach darauf hin, dass löschen der Tech dazu führt, dass alle zugeordneten Commands gelöscht werden
    document.getElementById('delete-technology-btn').addEventListener('click', async (event) => {
        event.preventDefault();
        const tech = document.getElementById('tech');
        if (tech.value != '') {
            const techName = tech.options[tech.selectedIndex].text;

            // Modal erstellen und anzeigen
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'deleteModal';
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content bg-secondary">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title text-light">${window.i18n ? window.i18n.translate("pages.settings.categories.modal.title") : "Technologie löschen"}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-light">
                            <p>${window.i18n ? window.i18n.translate("pages.settings.categories.modal.warning") : "ACHTUNG: Dadurch werden alle zugehörigen Commands ebenfalls gelöscht!"}</p>
                            <p>${window.i18n ? window.i18n.translate("pages.settings.categories.modal.confirmThisp1") : "Gib den Namen der Technologie"} 
                            "<strong>${techName}</strong>" 
                            ${window.i18n ? window.i18n.translate("pages.settings.categories.modal.confirmThisp2") : "ein, um das Löschen zu bestätigen:"}</p>
                            <input type="text" class="form-control bg-dark border-secondary text-light mt-3" 
                                   id="confirmTechName" placeholder="${techName}" autocomplete="off">
                        </div>
                        <div class="modal-footer border-secondary">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            ${window.i18n ? window.i18n.translate("pages.settings.categories.modal.cancelButton") : "Abbrechen"}
                            </button>
                            <button type="button" class="btn btn-danger" id="confirmDelete" disabled>
                            ${window.i18n ? window.i18n.translate("pages.settings.categories.modal.deleteButton") : "Löschen"}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();

            const confirmInput = document.getElementById('confirmTechName');
            const confirmButton = document.getElementById('confirmDelete');

            // Input-Validierung in Echtzeit
            confirmInput.addEventListener('input', () => {
                if (confirmInput.value === techName) {
                    confirmButton.disabled = false;
                    confirmButton.classList.remove('btn-danger');
                    confirmButton.classList.add('btn-danger');
                } else {
                    confirmButton.disabled = true;
                }
            });

            // Bestätigung Event Listener
            confirmButton.addEventListener('click', async () => {
                if (confirmInput.value === techName) {
                    try {
                        const result = await window.electronAPI.dbQuery('DELETE FROM technologies WHERE tech_id = ?', [tech.value]);
                        showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("pages.settings.categories.messages.categoryDeleted") : "Technologie erfolgreich gelöscht!"}` });
                        document.getElementById('add-technology-form').reset();
                        loadTechnologies();
                        bootstrapModal.hide();
                    } catch (error) {
                        console.error('Datenbank Fehler:', error);
                        showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("pages.settings.categories.messages.categoryDeleteError") : "Fehler beim Löschen der Technologie."}` });
                    }
                }
            });

            // Modal nach Schließen entfernen
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
            });
        }
    });

    async function loadTechnologies() {
        try {
            newTechMode = false;
            const technologies = await window.electronAPI.dbQuery('SELECT * FROM technologies ORDER BY tech_name ASC');

            const techContainer = document.getElementById('tech-container');
            techContainer.innerHTML = '';

            const flexContainer = document.createElement('div');
            flexContainer.className = 'd-flex align-items-center gap-2';

            const techSelect = document.createElement('select');
            techSelect.id = 'tech';
            techSelect.className = 'form-select form-select-lg bg-dark border-secondary text-light flex-grow-1';
            if (technologies.length === 0) {
                techSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.translate("pages.settings.categories.noCategories") : "Hier ist noch nichts..."}</option>`;
            } else {
                techSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.translate("pages.settings.categories.categoryPlaceholder") : "Kategorie auswählen..."}</option>`;
            }

            technologies.forEach(tech => {
                const option = document.createElement('option');
                option.value = tech.tech_id;
                option.textContent = tech.tech_name;
                option.dataset.color = tech.color;
                techSelect.appendChild(option);
            });

            const newButton = document.createElement('button');
            newButton.type = 'button';
            newButton.textContent = `${window.i18n ? window.i18n.translate("pages.settings.categories.buttons.addNew") : "Neue Kategorie"}`;
            newButton.id = 'new-tech-btn';
            newButton.className = 'btn btn-primary btn-sm';

            flexContainer.appendChild(techSelect);
            flexContainer.appendChild(newButton);
            techContainer.appendChild(flexContainer);

            techSelect.addEventListener('change', (event) => {
                const selectedOption = event.target.options[event.target.selectedIndex];
                const colorInput = document.getElementById('color');
                colorInput.value = selectedOption.dataset.color || '#007bff';
                const hexDisplay = document.getElementById('hex-display');
                hexDisplay.textContent = colorInput.value;
                document.getElementById('delete-technology-btn').disabled = false;
            });

            newButton.addEventListener('click', () => {
                newTechMode = true;
                document.getElementById('tech-container').innerHTML = `
                    <input type="text" id="tech" class="form-control form-control-lg bg-dark border-secondary text-light" placeholder="Linux, JavaScript, Python..." required>
                `;
                document.getElementById('color').value = '#007bff';
                document.getElementById('hex-display').textContent = '#007bff';
            })
        } catch (error) {
            console.error('Fehler beim Laden der Technologien:', error);
        }
    }

    async function handleDatabaseReset(event) {
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
                            ${window.i18n ? window.i18n.translate("pages.settings.clearDb.modal.title") : "Datenbank bereinigen"}
                        </h5>
                        <button type="button" class="btn-close btn-close-white btn-outline-primary" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-light">
                        <div class="alert alert-danger bg-secondary border-danger mb-4 text-primary" role="alert">
                            <p class="mb-2">
                            <strong>${window.i18n ? window.i18n.translate("pages.settings.clearDb.modal.lastWarning") : "LETZTE WARNUNG:"}</strong>
                            </p>
                            <p class="mb-2"><strong>${window.i18n ? window.i18n.translate("pages.settings.clearDb.modal.warningText1") : "Diese Aktion wird ALLE Befehle und Technologien unwiderruflich löschen!"}</strong></p>
                            <p class="mb-0 small">${window.i18n ? window.i18n.translate("pages.settings.clearDb.modal.warningText2") : "Stelle sicher, dass du ein Backup hast, bevor du fortfährst."}</p>
                        </div>
                        <p>
                        ${window.i18n ? window.i18n.translate("pages.settings.clearDb.modal.confirmThis1") : "Gib "}
                        "<strong>${window.i18n ? window.i18n.translate("pages.settings.clearDb.modal.confirmThisWord") : "DATENBANK BEREINIGEN"}</strong>" ein, um das Löschen zu bestätigen:</p>
                        <input type="text" class="form-control bg-dark border-secondary text-light mt-3" 
                               id="confirmResetText" placeholder="${window.i18n ? window.i18n.translate("pages.settings.clearDb.modal.confirmThisWord") : "DATENBANK BEREINIGEN"}" autocomplete="off">
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            ${window.i18n ? window.i18n.translate("pages.settings.clearDb.modal.cancelButton") : "Abbrechen"}
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmReset" disabled>
                            <i class="bi bi-trash3 me-2"></i>${window.i18n ? window.i18n.translate("pages.settings.clearDb.modal.deleteButton") : "Datenbank bereinigen"}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        const confirmInput = document.getElementById('confirmResetText');
        const confirmButton = document.getElementById('confirmReset');
        const requiredText = `${window.i18n ? window.i18n.translate("pages.settings.clearDb.modal.confirmThisWord") : "DATENBANK BEREINIGEN"}`;

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

                    showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("pages.settings.clearDb.messages.dbResetSuccess") : "Datenbank erfolgreich bereinigt!"}` });

                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);

                    bootstrapModal.hide();
                } catch (error) {
                    console.error('Datenbank Fehler:', error);
                    showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("pages.settings.clearDb.messages.dbResetError") : "Fehler beim Bereinigen der Datenbank."}` });
                }
            }
        });

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    document.getElementById('backup-database-btn').addEventListener('click', async () => {
        const btn = document.getElementById('backup-database-btn');
        const oldBtn = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<i class="bi bi-arrow-repeat spin me-2"></i> ${window.i18n ? window.i18n.translate("pages.settings.backupDb.starting") : "Backup wird erstellt..."}`;

        try {
            const result = await window.electronAPI.createDbBackup();
            if (result.success) {
                showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("pages.settings.backupDb.messages.backupSuccess") : "Backup erfolgreich erstellt!"}` });
                document.getElementById('backup-path').textContent = `${window.i18n ? window.i18n.translate("pages.settings.backupDb.backupCreatedInfo") : "Backup erstellt in: "} ${result.path}`;
            } else {
                showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("pages.settings.backupDb.messages.dbBackupFailed") : "Fehler beim Erstellen des Backups."}` });
            }
        } catch (error) {
            console.error('Fehler beim Erstellen des Backups:', error);
            showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("pages.settings.backupDb.messages.dbBackupFailed") : "Fehler beim Erstellen des Backups."}` });
        } finally {
            btn.disabled = false;
            btn.innerHTML = oldBtn;
        }
    });

    document.getElementById('check-updates-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('check-updates-btn');
        const statusDiv = document.getElementById('update-status');

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
    });

    window.electronAPI.onUpdateAvailable?.((event, info) => {
        showUpdateStatus(`${window.i18n ? window.i18n.translate("pages.settings.update.available") : "Update verfügbar: v"}${info.version}`, 'success');
        document.getElementById('update-progress').classList.remove('d-none');
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
                Update v${info.version}${window.i18n ? window.i18n.translate("pages.settings.update.downloaded") : " heruntergeladen."}
                <button class="btn btn-sm btn-primary ms-2" id="restart-update-btn">
                    ${window.i18n ? window.i18n.translate("pages.settings.update.restartAndInstall") : "Neu starten & installieren"}
                </button>
            </div>
        `;

        document.getElementById('restart-update-btn').addEventListener('click', () => {
            window.electronAPI.restartApp();
        });
    });

    function showUpdateStatus(message, type) {
        const statusDiv = document.getElementById('update-status');
        statusDiv.classList.remove('d-none');
        statusDiv.innerHTML = `
            <div class="alert alert-${type}">
                <i class="bi bi-info-circle me-2"></i>${message}
            </div>
        `;
    }
});