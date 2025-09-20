import { showFeedback } from "./shared.js";

document.addEventListener('DOMContentLoaded', () => {

    let commands = [];
    const commandsContainer = document.getElementById('commandsContainer');

    loadCommands();

    async function loadCommands() {
        try {
            const rows = await window.electronAPI.dbQuery('SELECT * FROM commands ORDER BY created_at DESC', []);
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
            commandCard.innerHTML = `
            <div class="card bg-secondary border-secondary h-100">
                        <div class="card-header bg-dark d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <span class="badge bg-primary me-2">${cmd.tech}</span>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-link text-light p-1" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-dark">
                                    <li><a class="dropdown-item" href="#"><i class="bi bi-pencil me-2"></i>Bearbeiten</a></li>
                                    <li><a class="dropdown-item" href="#"><i class="bi bi-copy me-2"></i>Kopieren</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#"><i class="bi bi-trash me-2"></i>Löschen</a></li>
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


});
