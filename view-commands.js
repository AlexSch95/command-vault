import { showFeedback } from "./shared.js";

document.addEventListener('DOMContentLoaded', () => {

    let commands = [];
    const commandsContainer = document.getElementById('commandsContainer');

    loadCommands();

    async function loadCommands() {
        try {
            const rows = await window.electronAPI.dbQuery(`
                SELECT 
                    c.command_id,
                    c.titel,
                    c.command,
                    c.beschreibung,
                    c.source,
                    c.created_at,
                    t.tech_name as tech,
                    t.color as tech_color
                FROM commands c
                JOIN technologies t ON c.tech_id = t.tech_id
                ORDER BY c.created_at DESC
            `, []);
            commands = rows;
            renderCommands();
        } catch (error) {
            console.error('Datenbank Fehler:', error);
            showFeedback({ success: false, message: 'Fehler beim Laden der Commands.' });
        }
    }

    function renderCommands() {
        commandsContainer.innerHTML = '';
        commands.forEach(cmd => {
            const commandCard = document.createElement('div');
            commandCard.classList.add('col-lg-6');
            commandCard.id = `${cmd.command_id}`;
            commandCard.innerHTML = `
                    <div class="card bg-secondary border-secondary h-100">
                        <div class="card-header bg-dark d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <span class="badge" style="background-color: ${cmd.tech_color};">${cmd.tech}</span>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-link text-light p-1" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-dark">
                                    <li><a class="dropdown-item edit-command-btn" data-id="${cmd.command_id}" href="#"><i class="bi bi-pencil me-2"></i>Bearbeiten</a></li>
                                    <li><a class="dropdown-item text-danger delete-command-btn" data-id="${cmd.command_id}" href="#"><i class="bi bi-trash me-2"></i>Löschen</a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="card-body text-light">
                            <h5 class="card-title mb-3 text-light">
                                <span>${cmd.titel}</span>
                            </h5>
                            <div class="mb-3">
                                <label class="form-label text-muted mb-1">Command:</label>
                                <div class="bg-dark text-white p-3 rounded font-monospace position-relative">
                                    <code>${cmd.command}</code>
                                    <button class="btn btn-outline-light btn-sm position-absolute top-0 end-0 m-2">
                                        <i class="bi bi-copy"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="card-text text-light">
                            <span>${cmd.beschreibung}</span>
                            </p>
                            <small class="text-muted">
                                <i class="bi bi-clock me-1"></i>Hinzugefügt am ${new Date(cmd.created_at).toLocaleDateString()}
                            </small>
                        </div>
                    </div>`;
            commandsContainer.appendChild(commandCard);
        });
    }

    commandsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('delete-command-btn')) {
            const commandId = target.getAttribute('data-id');
            deleteCommand(commandId);
        } else if (target.classList.contains('edit-command-btn')) {
            const commandId = target.getAttribute('data-id');
            editCommand(commandId);
        }
    });


    async function deleteCommand(commandId) {
        try {
            const result = await window.electronAPI.dbQuery('DELETE FROM commands WHERE command_id = ?', [commandId]);
            loadCommands();
            showFeedback({ success: true, message: 'Command erfolgreich gelöscht.' });
            console.log(result);
        } catch (error) {
            showFeedback({ success: false, message: 'Fehler beim Löschen des Commands.' });
        }
    }

    async function editCommand(commandId) {
        const cmd = commands.find(c => c.command_id == commandId);
        const editedCommand = document.getElementById(commandId);
        const technologies = await loadTechnologies();
        
        // Dropdown-Optionen generieren
        let techOptions = '<option value="">Technologie auswählen...</option>';
        technologies.forEach(tech => {
            const selected = tech.tech_name === cmd.tech ? 'selected' : '';
            techOptions += `<option value="${tech.tech_id}" ${selected}>${tech.tech_name}</option>`;
        });
        
        editedCommand.innerHTML = `<div class="card bg-secondary border-secondary h-100">
                        <div class="card-header bg-dark d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <select class="form-select bg-dark border-secondary text-light" id="edit-tech-${cmd.command_id}">
                                    ${techOptions}
                                </select>
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-success btn-sm save-command-btn" data-id="${cmd.command_id}">
                                    <i class="bi bi-check"></i>
                                </button>
                                <button class="btn btn-danger btn-sm cancel-edit-btn" data-id="${cmd.command_id}">
                                    <i class="bi bi-x"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body text-light">
                            <h5 class="card-title mb-3 text-light">
                                <input type="text" class="form-control bg-dark border-secondary text-light" value="${cmd.titel}" id="edit-titel-${cmd.command_id}">
                            </h5>
                            <div class="mb-3">
                                <label class="form-label text-muted mb-1">Command:</label>
                                <div class="bg-dark text-white p-3 rounded position-relative">
                                    <textarea class="form-control bg-dark border-0 text-light font-monospace" id="edit-command-${cmd.command_id}" rows="3">${cmd.command}</textarea>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-muted mb-1">Beschreibung:</label>
                                <textarea class="form-control bg-dark border-secondary text-light" id="edit-beschreibung-${cmd.command_id}" rows="3">${cmd.beschreibung || ''}</textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-muted mb-1">Quelle:</label>
                                <input type="url" class="form-control bg-dark border-secondary text-light" value="${cmd.source || ''}" id="edit-source-${cmd.command_id}">
                            </div>
                            <small class="text-muted">
                                <i class="bi bi-clock me-1"></i>Hinzugefügt am ${new Date(cmd.created_at).toLocaleDateString()}
                            </small>
                        </div>
                    </div>`;
        editedCommand.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('save-command-btn')) {
                const commandId = target.getAttribute('data-id');
                saveCommand(commandId);
            } else if (target.classList.contains('cancel-edit-btn')) {
                loadCommands();
            }
        });
    }

    async function saveCommand(commandId) {
        const tech_id = document.getElementById(`edit-tech-${commandId}`).value;
        const titel = document.getElementById(`edit-titel-${commandId}`).value;
        const command = document.getElementById(`edit-command-${commandId}`).value;
        const beschreibung = document.getElementById(`edit-beschreibung-${commandId}`).value;
        const source = document.getElementById(`edit-source-${commandId}`).value;
        try {
            const result = await window.electronAPI.dbQuery(
                'UPDATE commands SET tech_id = ?, titel = ?, command = ?, beschreibung = ?, source = ? WHERE command_id = ?',
                [tech_id, titel, command, beschreibung, source, commandId]
            );
            loadCommands();
            showFeedback({ success: true, message: 'Command erfolgreich aktualisiert.' });
        } catch (error) {
            showFeedback({ success: false, message: 'Fehler beim Aktualisieren des Commands.' });
        }
    }

    async function loadTechnologies() { 
        try {
            const technologies = await window.electronAPI.dbQuery('SELECT * FROM technologies ORDER BY tech_name ASC');
            return technologies;
        } catch (error) {
            console.error('Fehler beim Laden der Technologien:', error);
        }
    }
});
