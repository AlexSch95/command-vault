import { showFeedback, loadGlobalTheme } from "./shared.js";

document.addEventListener('DOMContentLoaded', () => {
    loadGlobalTheme();
    setupCurrentColors();

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

            console.log(themeData);

            const result = await window.electronAPI.saveTheme(themeData);

            if (result.success) {
                // Theme sofort anwenden
                applyTheme(themeData);
                showFeedback(result);
            } else {
                showFeedback(result);
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Themes:', error);
            showFeedback({ success: false, message: 'Fehler beim Speichern des Themes.' });
        }
    }


    function applyTheme(themeData) {
        // CSS Custom Properties dynamisch setzen
        const root = document.documentElement;
        root.style.setProperty('--bg-primary', themeData.bgPrimary);
        root.style.setProperty('--bg-secondary', themeData.bgSecondary);
        root.style.setProperty('--border-color', themeData.borderColor);
        root.style.setProperty('--text-primary', themeData.textPrimary);
        root.style.setProperty('--accent-color', themeData.accentColor);
    }

    async function applyLightMode() {
        // Light Mode Theme Farben
        const lightTheme = {
            bgPrimary: '#ffffff',        // Weißer Hintergrund
            bgSecondary: '#f8f9fa',      // Sehr helles Grau für Cards
            borderColor: '#dee2e6',      // Helles Grau für Rahmen
            textPrimary: '#212529',      // Dunkler Text
            accentColor: '#21b9ffff'       // Himmelsblau
        };

        // Color Picker aktualisieren
        document.getElementById('bg-primary-color').value = lightTheme.bgPrimary;
        document.getElementById('bg-secondary-color').value = lightTheme.bgSecondary;
        document.getElementById('border-color').value = lightTheme.borderColor;
        document.getElementById('text-primary-color').value = lightTheme.textPrimary;
        document.getElementById('accent-color').value = lightTheme.accentColor;

        // Theme anwenden
        applyTheme(lightTheme);

        // Theme speichern
        try {
            const themeData = {
                ...lightTheme,
                timestamp: new Date().toISOString()
            };

            const result = await window.electronAPI.saveTheme(themeData);
            if (result.success) {
                showFeedback({ success: true, message: 'Light Mode aktiviert!' });
            } else {
                showFeedback(result);
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Light Themes:', error);
            showFeedback({ success: false, message: 'Fehler beim Speichern des Themes.' });
        }
    }

    async function applyDarkMode() {
        // Dark Mode Theme Farben (Deep Navy Theme)
        const darkTheme = {
            bgPrimary: '#0f172a',        // Tiefes Navy
            bgSecondary: '#1e293b',      // Navy-Grau
            borderColor: '#334155',      // Heller Navy
            textPrimary: '#f1f5f9',      // Sehr helles Grau
            accentColor: '#0d6efd'
        };

        // Color Picker aktualisieren
        document.getElementById('bg-primary-color').value = darkTheme.bgPrimary;
        document.getElementById('bg-secondary-color').value = darkTheme.bgSecondary;
        document.getElementById('border-color').value = darkTheme.borderColor;
        document.getElementById('text-primary-color').value = darkTheme.textPrimary;
        document.getElementById('accent-color').value = darkTheme.accentColor;

        // Theme anwenden
        applyTheme(darkTheme);

        // Theme speichern
        try {
            const themeData = {
                ...darkTheme,
                timestamp: new Date().toISOString()
            };

            const result = await window.electronAPI.saveTheme(themeData);
            if (result.success) {
                showFeedback({ success: true, message: 'Dark Mode aktiviert!' });
            } else {
                showFeedback(result);
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Dark Themes:', error);
            showFeedback({ success: false, message: 'Fehler beim Speichern des Themes.' });
        }
    }

    document.getElementById('save-theme-btn').addEventListener('click', saveTheme);
    document.getElementById('light-mode-btn').addEventListener('click', applyLightMode);
    document.getElementById('dark-mode-btn').addEventListener('click', applyDarkMode);
    document.getElementById('reset-database-btn').addEventListener('click', handleDatabaseReset);


    let newTechMode = false;

    loadGlobalTheme();
    loadTechnologies();

    document.getElementById('add-technology-btn').addEventListener('click', async (event) => {
        event.preventDefault();
        const tech = document.getElementById('tech');
        const color = document.getElementById('color');
        if (newTechMode === true) {
            try {
                const result = await window.electronAPI.dbQuery('INSERT INTO technologies (tech_name, color) VALUES (?, ?)', [tech.value, color.value]);
                showFeedback({ success: true, message: 'Technologie erfolgreich hinzugefügt!' });
                document.getElementById('add-technology-form').reset();
            } catch (error) {
                console.error('Datenbank Fehler:', error);
                showFeedback({ success: false, message: 'Fehler beim Hinzufügen der Technologie.' });
            }
        } else if (newTechMode === false) {
            try {
                const result = await window.electronAPI.dbQuery('UPDATE technologies SET color = ? WHERE tech_id = ?', [color.value, tech.value]);
                showFeedback({ success: true, message: 'Technologie erfolgreich aktualisiert!' });
                document.getElementById('add-technology-form').reset();
            } catch (error) {
                console.error('Datenbank Fehler:', error);
                showFeedback({ success: false, message: 'Fehler beim Aktualisieren der Technologie.' });
            }
        }
        loadTechnologies();
    });

    document.getElementById('reset-btn').addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById('add-technology-form').reset();
        window.location.reload();
    });

    document.getElementById('color').addEventListener('input', (event) => {
        const hexDisplay = document.getElementById('hex-display');
        hexDisplay.textContent = event.target.value;
    });

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
                            <h5 class="modal-title text-light">Technologie löschen</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-light">
                            <p><strong>ACHTUNG:</strong> Dadurch werden alle zugehörigen Commands ebenfalls gelöscht!</p>
                            <p>Gib den Namen der Technologie "<strong>${techName}</strong>" ein, um das Löschen zu bestätigen:</p>
                            <input type="text" class="form-control bg-dark border-secondary text-light mt-3" 
                                   id="confirmTechName" placeholder="${techName}" autocomplete="off">
                        </div>
                        <div class="modal-footer border-secondary">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                            <button type="button" class="btn btn-danger" id="confirmDelete" disabled>Löschen</button>
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
                        showFeedback({ success: true, message: 'Technologie erfolgreich gelöscht!' });
                        document.getElementById('add-technology-form').reset();
                        loadTechnologies();
                        bootstrapModal.hide();
                    } catch (error) {
                        console.error('Datenbank Fehler:', error);
                        showFeedback({ success: false, message: 'Fehler beim Löschen der Technologie.' });
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

            // Container für Select + Button erstellen
            const techContainer = document.getElementById('tech-container');
            techContainer.innerHTML = ''; // Container leeren

            const flexContainer = document.createElement('div');
            flexContainer.className = 'd-flex align-items-center gap-2';

            const techSelect = document.createElement('select');
            techSelect.id = 'tech';
            techSelect.className = 'form-select form-select-lg bg-dark border-secondary text-light flex-grow-1';
            techSelect.innerHTML = '<option value="">Technologie auswählen...</option>';

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
            newButton.textContent = 'Neue Technologie';
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
                    <input type="text" id="tech" class="form-control form-control-lg bg-dark border-secondary text-light" placeholder="z.B. Linux, JavaScript, Python..." required>
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
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>Datenbank bereinigen
                        </h5>
                        <button type="button" class="btn-close btn-close-white btn-outline-primary" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-light">
                        <div class="alert alert-danger bg-secondary border-danger mb-4 text-primary" role="alert">
                            <p class="mb-2"><strong>LETZTE WARNUNG:</strong></p>
                            <p class="mb-2">Diese Aktion wird <strong>ALLE</strong> Commands und Technologien unwiderruflich löschen!</p>
                            <p class="mb-0 small">Stelle sicher, dass du ein Backup hast, bevor du fortfährst.</p>
                        </div>
                        <p>Gib "<strong>DATENBANK BEREINIGEN</strong>" ein, um das Löschen zu bestätigen:</p>
                        <input type="text" class="form-control bg-dark border-secondary text-light mt-3" 
                               id="confirmResetText" placeholder="DATENBANK BEREINIGEN" autocomplete="off">
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Abbrechen</button>
                        <button type="button" class="btn btn-danger" id="confirmReset" disabled>
                            <i class="bi bi-trash3 me-2"></i>Datenbank bereinigen
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
        const requiredText = 'DATENBANK BEREINIGEN';
        
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
                    
                    showFeedback({ success: true, message: 'Datenbank erfolgreich bereinigt!' });
                    
                    // Seite neu laden um UI zu aktualisieren
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    
                    bootstrapModal.hide();
                } catch (error) {
                    console.error('Datenbank Fehler:', error);
                    showFeedback({ success: false, message: 'Fehler beim Bereinigen der Datenbank.' });
                }
            }
        });
        
        // Modal nach Schließen entfernen
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
});