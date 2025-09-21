import { showFeedback } from "./shared.js";

document.addEventListener('DOMContentLoaded', () => {

    let commandsArray = [];
    const commandsContainer = document.getElementById('commandsContainer');

    loadCommands();
    technologyFilter();

    document.getElementById('technologyFilter').addEventListener('change', applyFilter);
    document.getElementById('searchInput').addEventListener('input', applyFilter);

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
                    t.color as tech_color,
                    t.tech_id as tech_id
                FROM commands c
                JOIN technologies t ON c.tech_id = t.tech_id
                ORDER BY c.created_at DESC
            `, []);
            commandsArray = rows;
            renderCommands(commandsArray);
        } catch (error) {
            console.error('Datenbank Fehler:', error);
            showFeedback({ success: false, message: 'Fehler beim Laden der Commands.' });
        }
    }

    async function technologyFilter() {
        try {
            const technologies = await loadTechnologies();
            console.log(technologies);
            const technologyFilter = document.getElementById('technologyFilter');
            technologies.forEach(tech => {
                const option = document.createElement('option');
                option.value = tech.tech_id;
                option.textContent = tech.tech_name;
                technologyFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Datenbank Fehler:', error);
            showFeedback({ success: false, message: 'Fehler beim Laden der Technologien.' });
        }
    }

    function renderCommands(commands) {
        commandsContainer.innerHTML = '';
        if (commands.length === 0) {
            commandsContainer.innerHTML = '<h2 class="text-center text-muted mt-5">Hier ist noch nichts... Füge einen neuen Command hinzu!</h2>';
            return;
        }
        commands.forEach(cmd => {
            const commandCard = document.createElement('div');
            commandCard.classList.add('col-lg-6');
            commandCard.id = `${cmd.command_id}`;
            commandCard.innerHTML = `
                    <div class="card bg-secondary border-secondary h-100">
                        <div class="card-header bg-dark d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <span class="badge" style="background-color: ${cmd.tech_color};"><span class="text-shadow-outline fs-5">${cmd.tech}</span></span>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-link text-light p-1" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-dark">
                                    <li><a class="dropdown-item view-source-btn" data-linktosource="${cmd.source}" href="#"><i class="bi bi-box-arrow-up-right me-2"></i>Zur Quelle</a></li>
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
                                    <button class="btn btn-outline-light copy-cmd-btn btn-sm position-absolute top-0 end-0 m-2" data-command='${cmd.command}'>
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

    // Filter- und Suchfunktion
    function applyFilter() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const selectedTechId = document.getElementById('technologyFilter').value;
        console.log(selectedTechId);
        
        let filteredCommands = commandsArray;
        console.log("vor filter", filteredCommands);
        
        // Nach Technologie filtern
        if (selectedTechId) {
            filteredCommands = filteredCommands.filter(cmd => 
                cmd.tech_id == selectedTechId || cmd.tech_id === parseInt(selectedTechId)
            );
        }
        
        // Nach Suchbegriff filtern (Titel, Command, Beschreibung, Technologie)
        if (searchTerm) {
            filteredCommands = filteredCommands.filter(cmd => 
                cmd.titel.toLowerCase().includes(searchTerm) ||
                cmd.command.toLowerCase().includes(searchTerm) ||
                (cmd.beschreibung && cmd.beschreibung.toLowerCase().includes(searchTerm)) ||
                cmd.tech.toLowerCase().includes(searchTerm)
            );
        }
        console.log("nach filter", filteredCommands);
        renderCommands(filteredCommands);
        
        // Zeige Ergebnis-Info
        const resultCount = filteredCommands.length;
        const totalCount = commandsArray.length;
        console.log(`Gefilterte Commands: ${resultCount} von ${totalCount}`);
    }

    commandsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('delete-command-btn')) {
            const commandId = target.getAttribute('data-id');
            deleteCommand(commandId);
        } else if (target.classList.contains('edit-command-btn')) {
            const commandId = target.getAttribute('data-id');
            editCommand(commandId);
        } else if (target.classList.contains('view-source-btn')) {
            const linkToSource = target.getAttribute('data-linktosource');
            window.open(linkToSource, '_blank');
        } else if (target.classList.contains('copy-cmd-btn')) {
            const command = target.getAttribute('data-command');
            copyToClipboard(command);
        }
    });

    async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showFeedback({ success: true, message: 'Command in Zwischenablage kopiert!' });
    } catch (error) {
        console.error('Fehler beim Kopieren:', error);
        showFeedback({ success: false, message: 'Fehler beim Kopieren in Zwischenablage.' });
    }
}


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
        const cmd = commandsArray.find(c => c.command_id == commandId);
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
