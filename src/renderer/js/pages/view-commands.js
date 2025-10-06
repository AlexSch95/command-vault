import { showFeedback, loadGlobalTheme, getAppVersion } from "../shared/shared.js";

document.addEventListener('DOMContentLoaded', async () => {

  if (window.i18n) {
    await window.i18n.ready;
  }

  await getAppVersion();

  document.getElementById("settingsButton").addEventListener("click", () => {
    document.getElementById("mainContentOverlay").classList.add("overlay-darken");
    window.electronAPI.openSettingsWindow();
  });

  window.electronAPI.onSettingsClosed(() => {
    document.getElementById("mainContentOverlay").classList.remove("overlay-darken");
    loadGlobalTheme();
    loadCommands();
    technologyFilter();
  });

  const languageSwitchers = document.querySelectorAll('.language-switcher');
  languageSwitchers.forEach(switcher => {
    switcher.addEventListener('click', async (event) => {
      event.preventDefault();
      const selectedLang = switcher.getAttribute('data-language');
      await window.switchLanguage(selectedLang);
      window.i18n.updatePage();
      loadCommands();
    });
  });

  document.getElementById("minimize-btn").addEventListener("click", () => {
    window.electronAPI.minimizeWindow();
  });
  document.getElementById("close-btn").addEventListener("click", () => {
    window.electronAPI.closeWindow();
  });





  let commandsArray = [];
  const commandsContainer = document.getElementById('commandsContainer');

  loadGlobalTheme();
  loadCommands();
  technologyFilter();

  document.getElementById('technologyFilter').addEventListener('change', applyFilter);
  document.getElementById('searchInput').addEventListener('input', applyFilter);

  //desc: lädt die commands aus der db
  async function loadCommands() {
    try {
      const rows = await window.electronAPI.dbQuery(`
                SELECT 
                    c.cmd_id,
                    c.cmd_title,
                    c.cmd,
                    c.cmd_description,
                    c.cmd_source,
                    c.created_at,
                    t.category_name,
                    t.category_color,
                    t.category_id,
                    c.modified,
                    c.last_modified
                FROM commands c
                JOIN categories t ON c.category_id = t.category_id
                ORDER BY t.category_name DESC
            `, []);
      commandsArray = rows;
      renderCommands(commandsArray);
    } catch (error) {
      console.error('Datenbank Fehler:', error);
      showFeedback({ success: false, message: `${window.i18n.translate("pages.viewCommands.messages.cmdLoadError")}` });
    }
  }

  //desc: füllt den tech filter mit den technologien aus der db
  async function technologyFilter() {
    try {
      const technologies = await loadTechnologies();
      console.log(technologies);
      const technologyFilter = document.getElementById('technologyFilter');
      technologies.forEach(tech => {
        const option = document.createElement('option');
        option.value = tech.category_id;
        option.textContent = tech.category_name;
        technologyFilter.appendChild(option);
      });
    } catch (error) {
      console.error('Datenbank Fehler:', error);
      showFeedback({ success: false, message: `${window.i18n.translate("pages.addCommand.messages.categoryLoadError")}` });
    }
  }

  //desc: renderfunktion für die command cards
  function renderCommands(commands) {
    commandsContainer.innerHTML = '';
    if (commands.length === 0) {
      commandsContainer.innerHTML = `<h2 class="text-center text-muted mt-5">${window.i18n.translate("pages.viewCommands.contentPlaceholder.noCommands")}</h2>`;
      return;
    }
    commands.forEach(cmd => {
      const commandCard = document.createElement('div');
      commandCard.classList.add('col-lg-6');
      commandCard.id = `${cmd.cmd_id}`;
      const markdownDescription = cmd.cmd_description ? marked.parse(cmd.cmd_description) : '';
      commandCard.innerHTML = `
                    <div class="card h-100">
                        <div class="card-header d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <span class="badge" style="background-color: ${cmd.category_color};"><span class="text-shadow-outline fs-5">${cmd.category_name}</span></span>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-link p-1" data-bs-toggle="dropdown">
                                    <i class="text-primary bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
                                    <li><a class="dropdown-item view-source-btn" data-linktosource="${cmd.cmd_source}" href="#"><i class="bi bi-box-arrow-up-right me-2"></i>${window.i18n.translate("pages.viewCommands.buttons.toSource")}</a></li>
                                    <li><a class="dropdown-item edit-command-btn" data-id="${cmd.cmd_id}" href="#"><i class="bi bi-pencil me-2"></i>${window.i18n.translate("pages.viewCommands.buttons.edit")}</a></li>
                                    <li><a class="dropdown-item text-danger delete-command-btn" data-id="${cmd.cmd_id}" href="#"><i class="bi bi-trash me-2"></i>${window.i18n.translate("pages.viewCommands.buttons.delete")}</a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title mb-3">
                                <span>${cmd.cmd_title}</span>
                            </h5>
                            <div class="mb-3">
                                <label class="form-label text-muted mb-1">${window.i18n.translate("pages.viewCommands.cmdCard.cmdBoxLabel")}</label>
                                <div class="bg-dark text-white p-3 mb-2 rounded font-monospace position-relative">
                                    <code class="viewcmd-block">${cmd.cmd}</code>
                                    <button class="btn btn-outline-light copy-cmd-btn btn-sm position-absolute top-0 end-0 m-2" data-command='${cmd.command}'>
                                        <i class="bi bi-copy"></i>
                                    </button>
                                </div>
                            </div>
                            <p class="card-text text-light">
                            <div class="command-description markdown-content mb-3">${markdownDescription}</div>
                            </p>
                            <small class="text-muted position-absolute bottom-0 end-0 p-3 mt-5">
                                ${cmd.modified === 1 ? `<i class="bi bi-pencil-square me-1"></i>${window.i18n.translate("pages.viewCommands.cmdCard.lastEdited")} ${new Date(cmd.last_modified).toLocaleDateString()}` : 
                                `<i class="bi bi-clock me-1"></i>${window.i18n.translate("pages.viewCommands.cmdCard.createdAt")} ${new Date(cmd.created_at).toLocaleDateString()}`}
                            </small>
                        </div>
                    </div>`;
      commandsContainer.appendChild(commandCard);
    });
  }

  //desc: filter und suchfunktion, beides gleichzeitig möglich
  function applyFilter() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const selectedTechId = document.getElementById('technologyFilter').value;

    let filteredCommands = commandsArray;

    if (selectedTechId) {
      filteredCommands = filteredCommands.filter(cmd =>
        cmd.tech_id == selectedTechId || cmd.tech_id === parseInt(selectedTechId)
      );
    }

    if (searchTerm) {
      filteredCommands = filteredCommands.filter(cmd =>
        cmd.cmd_title.toLowerCase().includes(searchTerm) ||
        cmd.cmd.toLowerCase().includes(searchTerm) ||
        cmd.cmd_description.toLowerCase().includes(searchTerm) ||
        cmd.category_name.toLowerCase().includes(searchTerm)
      );
    }
    renderCommands(filteredCommands);
  }
  //desc: eventlistener für die command cards (löschen, bearbeiten, quelle öffnen, command kopieren)
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

  //desc: kopierfunktion für den command
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showFeedback({ success: true, message: `${window.i18n.translate("pages.viewCommands.messages.copySuccess")}` });
    } catch (error) {
      console.error('Fehler beim Kopieren:', error);
      showFeedback({ success: false, message: `${window.i18n.translate("pages.viewCommands.messages.copyError")}` });
    }
  }

  //desc: löscht einen command aus der db und verschiebt ihn in die deleted_commands tabelle
  async function deleteCommand(commandId) {
    try {
      const deletedCommandResult = await window.electronAPI.dbQuery(`
                SELECT 
                    c.cmd_id,
                    c.cmd_title,
                    c.cmd,
                    c.cmd_description,
                    c.cmd_source,
                    t.category_name,
                    t.category_color,
                    t.category_id
                FROM commands c
                JOIN categories t ON c.category_id = t.category_id
                WHERE c.cmd_id = ?
            `, [commandId]);
      const deletedCommand = deletedCommandResult[0];
      await window.electronAPI.dbQuery('DELETE FROM commands WHERE cmd_id = ?', [commandId]);
      //desc: gelöschter befehl wird in die deleted_commands tabelle verschoben
      console.table(deletedCommand);
      await window.electronAPI.dbQuery(`
                INSERT INTO deleted_commands 
                (
                  cmd_id, 
                  category_id, 
                  category_color,
                  category_name, 
                  cmd_title, 
                  cmd, 
                  cmd_description, 
                  cmd_source
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
        deletedCommand.cmd_id,
        deletedCommand.category_id,
        deletedCommand.category_color,
        deletedCommand.category_name,
        deletedCommand.cmd_title,
        deletedCommand.cmd,
        deletedCommand.cmd_description,
        deletedCommand.cmd_source
      ]);
      loadCommands();
      showFeedback({ success: true, message: `${window.i18n.translate("pages.viewCommands.messages.cmdDeleted")}` });
    } catch (error) {
      showFeedback({ success: false, message: `${window.i18n.translate("pages.viewCommands.messages.cmdDeleteError")}` });
    }
  }

  //desc: bearbeitet einen command, verwandelt die card in ein editierbares form
  async function editCommand(commandId) {
    const cmd = commandsArray.find(c => c.cmd_id == commandId);
    const editedCommand = document.getElementById(commandId);
    const technologies = await loadTechnologies();

    // Dropdown-Optionen generieren
    let techOptions = '';
    technologies.forEach(tech => {
      const selected = tech.category_name === cmd.category_name ? 'selected' : '';
      techOptions += `<option value="${tech.category_id}" ${selected}>${tech.category_name}</option>`;
    });

    editedCommand.innerHTML = `<div class="card h-100">
                        <div class="card-header d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <select class="form-select" id="edit-tech-${cmd.cmd_id}">
                                    ${techOptions}
                                </select>
                            </div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-success btn-sm save-command-btn" data-id="${cmd.cmd_id}">
                                    <i class="bi bi-check"></i>
                                </button>
                                <button class="btn btn-danger btn-sm cancel-edit-btn" data-id="${cmd.cmd_id}">
                                    <i class="bi bi-x"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                        <label class="form-label text-muted mb-1">${window.i18n.translate("pages.viewCommands.cmdCard.titleLabel")}</label>
                            <h5 class="card-title mb-3">
                                <input type="text" class="form-control" value="${cmd.cmd_title}" id="edit-titel-${cmd.cmd_id}">
                            </h5>
                            <div class="mb-3">
                                <label class="form-label text-muted mb-1">${window.i18n.translate("pages.viewCommands.cmdCard.cmdBoxLabel")}</label>
                                <div class="bg-dark text-white p-3 rounded position-relative">
                                    <textarea class="form-control bg-dark border-0 text-light font-monospace" id="edit-command-${cmd.cmd_id}" rows="2">${cmd.cmd}</textarea>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label text-muted mb-1">${window.i18n.translate("pages.viewCommands.cmdCard.descLabel")}</label>
                                <textarea class="form-control bg-dark border-secondary text-light" id="edit-beschreibung-${cmd.cmd_id}" rows="5">${cmd.cmd_description || ''}</textarea>
                                <small class="text-muted text-end d-block">${window.i18n.translate("pages.viewCommands.cmdCard.markdownSupported")}</small>
                                </div>
                            <div class="mb-3">
                                <label class="form-label text-muted mb-1">${window.i18n.translate("pages.viewCommands.cmdCard.sourceLabel")}</label>
                                <input type="url" class="form-control bg-dark border-secondary text-light" value="${cmd.cmd_source || ''}" id="edit-source-${cmd.cmd_id}">
                            </div>
                        </div>
                    </div>`;

    const markdownDescription = new EasyMDE({
      element: document.getElementById(`edit-beschreibung-${cmd.cmd_id}`),
      spellChecker: false,
      status: false,
      toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "preview", "guide"]
    });
    markdownDescription.codemirror.on('change', function() {
      markdownDescription.element.value = markdownDescription.value();
    });

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

  //desc: speichert die änderungen eines bearbeiteten commands
  async function saveCommand(commandId) {
    const tech_id = document.getElementById(`edit-tech-${commandId}`).value;
    const titel = document.getElementById(`edit-titel-${commandId}`).value;
    const command = document.getElementById(`edit-command-${commandId}`).value;
    const beschreibung = document.getElementById(`edit-beschreibung-${commandId}`).value;
    const source = document.getElementById(`edit-source-${commandId}`).value;
    try {
      const result = await window.electronAPI.dbQuery(
        'UPDATE commands SET category_id = ?, cmd_title = ?, cmd = ?, cmd_description = ?, cmd_source = ?, modified = 1 WHERE cmd_id = ?',
        [tech_id, titel, command, beschreibung, source, commandId]
      );
      loadCommands();
      showFeedback({ success: true, message: 'Command erfolgreich aktualisiert.' });
    } catch (error) {
      showFeedback({ success: false, message: 'Fehler beim Aktualisieren des Commands.' });
    }
  }

  //desc: lädt alle technologien aus der db und gibt sie zurück
  async function loadTechnologies() {
    try {
      const technologies = await window.electronAPI.dbQuery('SELECT * FROM categories ORDER BY category_name ASC');
      return technologies;
    } catch (error) {
      console.error('Fehler beim Laden der Technologien:', error);
    }
  }
});

