import { showFeedback, loadGlobalTheme } from "./shared.js";

document.addEventListener('DOMContentLoaded', async () => {

    if (window.i18n) {
        await window.i18n.ready;
    }

    const languageSwitchers = document.querySelectorAll('.language-switcher');
    languageSwitchers.forEach(switcher => {
        switcher.addEventListener('click', async (event) => {
            event.preventDefault();
            const selectedLang = switcher.getAttribute('data-language');
            await window.switchLanguage(selectedLang);
            loadTechnologies();
        });
    });

    loadGlobalTheme();
    setupCurrentColors();

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
            }
        } catch (error) {
            console.error('Fehler beim Laden des globalen Themes:', error);
        }
    }

    //desc: Speichert die ausgewählten Farben in die user-theme.json und wendet sie sofort an
    async function saveTheme() {
        try {
            const themeData = {
                bgPrimary: document.getElementById('bg-primary-color').value,
                bgSecondary: document.getElementById('bg-secondary-color').value,
                borderColor: document.getElementById('border-color').value,
                textPrimary: document.getElementById('text-primary-color').value,
                accentColor: document.getElementById('accent-color').value,
                timestamp: new Date().toISOString()
            };

            const result = await window.electronAPI.saveTheme(themeData);

            if (result.success) {
                applyTheme(themeData);
                showFeedback(result);
            } else {
                showFeedback(result);
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Themes:', error);
            showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("messages.themeSaveError") : "Fehler beim Speichern des Themes."}` });
        }
    }


    function applyTheme(themeData) {
        const root = document.documentElement;
        root.style.setProperty('--bg-primary', themeData.bgPrimary);
        root.style.setProperty('--bg-secondary', themeData.bgSecondary);
        root.style.setProperty('--border-color', themeData.borderColor);
        root.style.setProperty('--text-primary', themeData.textPrimary);
        root.style.setProperty('--accent-color', themeData.accentColor);
    }

    //desc: vordefinierter Lightmode, aktualisiert auch den Color picker um den Lightmode noch anpassen zu können
    async function applyLightMode() {
        const lightTheme = {
            bgPrimary: '#ffffffff',
            bgSecondary: '#e5e5e5ff',
            borderColor: '#dee2e6',
            textPrimary: '#212529',
            accentColor: '#21b9ffff'
        };

        document.getElementById('bg-primary-color').value = lightTheme.bgPrimary;
        document.getElementById('bg-secondary-color').value = lightTheme.bgSecondary;
        document.getElementById('border-color').value = lightTheme.borderColor;
        document.getElementById('text-primary-color').value = lightTheme.textPrimary;
        document.getElementById('accent-color').value = lightTheme.accentColor;

        applyTheme(lightTheme);

        try {
            const themeData = {
                ...lightTheme,
                timestamp: new Date().toISOString()
            };

            const result = await window.electronAPI.saveTheme(themeData);
            if (result.success) {
                showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("messages.lightThemeApplied") : "Helles Design angewendet."}` });
            } else {
                showFeedback(result);
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Light Themes:', error);
            showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("messages.themeSaveError") : "Fehler beim Speichern des Themes."}` });
        }
    }

    //desc: vordefinierter Darkmode
    async function applyDarkMode() {
        const darkTheme = {
            bgPrimary: '#0f172a',
            bgSecondary: '#1e293b',
            borderColor: '#334155',
            textPrimary: '#f1f5f9',
            accentColor: '#0d6efd'
        };

        document.getElementById('bg-primary-color').value = darkTheme.bgPrimary;
        document.getElementById('bg-secondary-color').value = darkTheme.bgSecondary;
        document.getElementById('border-color').value = darkTheme.borderColor;
        document.getElementById('text-primary-color').value = darkTheme.textPrimary;
        document.getElementById('accent-color').value = darkTheme.accentColor;

        applyTheme(darkTheme);

        try {
            const themeData = {
                ...darkTheme,
                timestamp: new Date().toISOString()
            };

            const result = await window.electronAPI.saveTheme(themeData);
            if (result.success) {
                showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("messages.darkThemeApplied") : "Dunkles Design angewendet."}` });
            } else {
                showFeedback(result);
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Dark Themes:', error);
            showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("messages.themeSaveError") : "Fehler beim Speichern des Themes."}` });
        }
    }

    //desc: Eventlistener für die Buttons
    document.getElementById('save-theme-btn').addEventListener('click', saveTheme);
    document.getElementById('light-mode-btn').addEventListener('click', applyLightMode);
    document.getElementById('dark-mode-btn').addEventListener('click', applyDarkMode);
    document.getElementById('reset-database-btn').addEventListener('click', handleDatabaseReset);

    //desc: flag für den Modus - entweder aktuelle Technologien (->false) oder neue Technologie (->true)
    let newTechMode = false;

    loadGlobalTheme();
    loadTechnologies();

    //desc: schickt die änderungen ab, wenn newtechmode true dann insert into, wenn false dann update
    document.getElementById('add-technology-btn').addEventListener('click', async (event) => {
        event.preventDefault();
        const tech = document.getElementById('tech');
        const color = document.getElementById('color');
        if (newTechMode === true) {
            try {
                const result = await window.electronAPI.dbQuery('INSERT INTO technologies (tech_name, color) VALUES (?, ?)', [tech.value, color.value]);
                showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("messages.technologySaved") : "Technologie erfolgreich gespeichert."}` });
                document.getElementById('add-technology-form').reset();
            } catch (error) {
                console.error('Datenbank Fehler:', error);
                showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("messages.technologySaveError") : "Fehler beim Hinzufügen der Technologie."}` });
            }
        } else if (newTechMode === false) {
            try {
                const result = await window.electronAPI.dbQuery('UPDATE technologies SET color = ? WHERE tech_id = ?', [color.value, tech.value]);
                showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("messages.technologyUpdated") : "Technologie erfolgreich aktualisiert."}` });
                document.getElementById('add-technology-form').reset();
            } catch (error) {
                console.error('Datenbank Fehler:', error);
                showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("messages.technologyUpdateError") : "Fehler beim Aktualisieren der Technologie."}` });
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
                    <div class="modal-content bg-dark">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title text-light">${window.i18n ? window.i18n.translate("pages.settings.delTechModal.title") : "Technologie löschen"}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-light">
                            <p>${window.i18n ? window.i18n.translate("pages.settings.delTechModal.warning") : "ACHTUNG: Dadurch werden alle zugehörigen Commands ebenfalls gelöscht!"}</p>
                            <p>${window.i18n ? window.i18n.translate("pages.settings.delTechModal.confirmThisp1") : "Gib den Namen der Technologie"} 
                            "<strong>${techName}</strong>" 
                            ${window.i18n ? window.i18n.translate("pages.settings.delTechModal.confirmThisp2") : "ein, um das Löschen zu bestätigen:"}</p>
                            <input type="text" class="form-control bg-dark border-secondary text-light mt-3" 
                                   id="confirmTechName" placeholder="${techName}" autocomplete="off">
                        </div>
                        <div class="modal-footer border-secondary">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            ${window.i18n ? window.i18n.translate("pages.settings.delTechModal.cancelButton") : "Abbrechen"}
                            </button>
                            <button type="button" class="btn btn-danger" id="confirmDelete" disabled>
                            ${window.i18n ? window.i18n.translate("pages.settings.delTechModal.deleteButton") : "Löschen"}
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
                        showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("messages.technologyDeleted") : "Technologie erfolgreich gelöscht!"}` });
                        document.getElementById('add-technology-form').reset();
                        loadTechnologies();
                        bootstrapModal.hide();
                    } catch (error) {
                        console.error('Datenbank Fehler:', error);
                        showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("messages.technologyDeleteError") : "Fehler beim Löschen der Technologie."}` });
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
                techSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.translate("labels.technologyPlaceholderNone") : "Hier ist noch nichts..."}</option>`;
            } else {
                techSelect.innerHTML = `<option value="">${window.i18n ? window.i18n.translate("labels.technologyPlaceholder") : "Technologie auswählen..."}</option>`;
            }

            technologies.forEach(tech => {
                const option = document.createElement('option');
                option.value = tech.tech_id;
                option.textContent = tech.tech_name;
                option.dataset.color = tech.color;
                techSelect.appendChild(option);
            });

            // "Neu" Button erstellen
            const newButton = document.createElement('button');
            newButton.type = 'button';
            newButton.textContent = `${window.i18n ? window.i18n.translate("pages.settings.addTechButton") : "Neue Technologie"}`;
            newButton.id = 'new-tech-btn';
            newButton.className = 'btn btn-primary btn-sm';

            // Flex Container befüllen
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
        
        // Modal für Datenbank-Reset erstellen
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'resetDatabaseModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-secondary">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-danger">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            ${window.i18n ? window.i18n.translate("pages.settings.clearDbModal.title") : "Datenbank bereinigen"}
                        </h5>
                        <button type="button" class="btn-close btn-close-white btn-outline-primary" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-light">
                        <div class="alert alert-danger bg-secondary border-danger mb-4 text-primary" role="alert">
                            <p class="mb-2">
                            <strong>${window.i18n ? window.i18n.translate("pages.settings.clearDbModal.lastWarning") : "LETZTE WARNUNG:"}</strong>
                            </p>
                            <p class="mb-2"><strong>${window.i18n ? window.i18n.translate("pages.settings.clearDbModal.warningText1") : "Diese Aktion wird ALLE Befehle und Technologien unwiderruflich löschen!"}</strong></p>
                            <p class="mb-0 small">${window.i18n ? window.i18n.translate("pages.settings.clearDbModal.warningText2") : "Stelle sicher, dass du ein Backup hast, bevor du fortfährst."}</p>
                        </div>
                        <p>
                        ${window.i18n ? window.i18n.translate("pages.settings.clearDbModal.confirmThis1") : "Gib "}
                        "<strong>${window.i18n ? window.i18n.translate("pages.settings.clearDbModal.confirmThisWord") : "DATENBANK BEREINIGEN"}</strong>" ein, um das Löschen zu bestätigen:</p>
                        <input type="text" class="form-control bg-dark border-secondary text-light mt-3" 
                               id="confirmResetText" placeholder="${window.i18n ? window.i18n.translate("pages.settings.clearDbModal.confirmThisWord") : "DATENBANK BEREINIGEN"}" autocomplete="off">
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            ${window.i18n ? window.i18n.translate("pages.settings.clearDbModal.cancelButton") : "Abbrechen"}
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmReset" disabled>
                            <i class="bi bi-trash3 me-2"></i>${window.i18n ? window.i18n.translate("pages.settings.clearDbModal.deleteButton") : "Datenbank bereinigen"}
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
        const requiredText = `${window.i18n ? window.i18n.translate("pages.settings.clearDbModal.confirmThisWord") : "DATENBANK BEREINIGEN"}`;
        
        // Input-Validierung in Echtzeit
        confirmInput.addEventListener('input', () => {
            if (confirmInput.value === requiredText) {
                confirmButton.disabled = false;
            } else {
                confirmButton.disabled = true;
            }
        });
        
        // Bestätigung Event Listener
        confirmButton.addEventListener('click', async () => {
            if (confirmInput.value === requiredText) {
                try {
                    // Beide Tabellen löschen (commands zuerst wegen Foreign Key)
                    await window.electronAPI.dbQuery('DELETE FROM commands');
                    await window.electronAPI.dbQuery('DELETE FROM technologies');

                    showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("messages.dbResetSuccess") : "Datenbank erfolgreich bereinigt!"}` });

                    // Seite neu laden um UI zu aktualisieren
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    
                    bootstrapModal.hide();
                } catch (error) {
                    console.error('Datenbank Fehler:', error);
                    showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("messages.dbResetError") : "Fehler beim Bereinigen der Datenbank."}` });
                }
            }
        });
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    // Update-Funktionalität
    document.getElementById('check-updates-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('check-updates-btn');
        const statusDiv = document.getElementById('update-status');
        
        btn.disabled = true;
        btn.innerHTML = `<i class="bi bi-arrow-repeat spin me-2"></i> ${window.i18n ? window.i18n.translate("pages.settings.updateArea.checking") : "Suche nach Updates..."}`;

        try {
            await window.electronAPI.checkForUpdates();
            showUpdateStatus(`${window.i18n ? window.i18n.translate("pages.settings.updateArea.checking") : "Suche nach Updates..."}`, 'info');
        } catch (error) {
            showUpdateStatus(`${window.i18n ? window.i18n.translate("pages.settings.updateArea.error") : "Fehler beim Suchen nach Updates"}`, 'danger');
        }
        
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = `<i class="bi bi-search me-2"></i> ${window.i18n ? window.i18n.translate("pages.settings.updateArea.notAvailable") : "Keine Updates verfügbar. Du bist auf dem neuesten Stand!"}`;
        }, 3000);
    });

    // Update Event Listeners
    window.electronAPI.onUpdateAvailable?.((event, info) => {
        showUpdateStatus(`${window.i18n ? window.i18n.translate("pages.settings.updateArea.available") : "Update verfügbar: v"}${info.version}`, 'success');
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
                Update v${info.version}${window.i18n ? window.i18n.translate("pages.settings.updateArea.downloaded") : " heruntergeladen."}
                <button class="btn btn-sm btn-primary ms-2" id="restart-update-btn">
                    ${window.i18n ? window.i18n.translate("pages.settings.updateArea.restartAndInstall") : "Neu starten & installieren"}
                </button>
            </div>
        `;
        
        // Event Listener für den Restart Button hinzufügen
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