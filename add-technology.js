import { showFeedback, loadGlobalTheme } from "./shared.js";

document.addEventListener('DOMContentLoaded', () => {
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
            newButton.textContent = '+';
            newButton.id = 'new-tech-btn';
            newButton.className = 'btn btn-outline-light btn-sm';
            
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

});