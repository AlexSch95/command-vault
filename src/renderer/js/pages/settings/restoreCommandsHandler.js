import { showFeedback } from "../../shared/shared.js";

if (window.i18n) {
  await window.i18n.ready;
}

export function init() {
  loadDeletedCommands();
}

async function loadDeletedCommands() {
  try {
    const deletedCommandsContainer = document.getElementById('restore-commands-container');
    const deletedCommands = await window.electronAPI.dbQuery('SELECT * FROM deleted_commands ORDER BY deleted_at DESC');
    deletedCommandsContainer.innerHTML = '';
    if (deletedCommands.length === 0) {
      deletedCommandsContainer.innerHTML = `<p class="text-muted">${window.i18n.translate("pages.settings.restorecommand.noDeletedCommands")}</p>`;
      return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
                <tr>
                    <th>${window.i18n.translate("pages.settings.restorecommand.tableHeaders.category")}</th>
                    <th>${window.i18n.translate("pages.settings.restorecommand.tableHeaders.command")}</th>
                    <th>${window.i18n.translate("pages.settings.restorecommand.tableHeaders.deletedAt")}</th>
                    <th>${window.i18n.translate("pages.settings.restorecommand.tableHeaders.actions")}</th>
                </tr>
            `;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    deletedCommands.forEach(cmd => {
      const row = document.createElement('tr');
      row.innerHTML = `
                    <td><span class="badge" style="background-color: ${cmd.category_color};"><span class="fs-5">${cmd.category_name}</span></span></td>
                    <td>${cmd.cmd.length > 9 ? cmd.cmd.substring(0, 9) + '...' : cmd.cmd}</td>
                    <td>${new Date(cmd.deleted_at).toLocaleDateString()}</td>
                    <td class="text-center">
                        <button class="btn btn-success btn-sm restore-command-btn" data-id="${cmd.cmd_id}">
                            <i class="bi bi-arrow-counterclockwise"></i>
                        </button>
                        <button class="btn btn-danger btn-sm fully-delete-cmd-btn" data-id="${cmd.cmd_id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    deletedCommandsContainer.appendChild(table);
  } catch (error) {
    console.error('Fehler beim Laden der gelöschten Commands:', error);
    const container = document.getElementById('restore-commands-container');
    container.innerHTML = `<p class="text-danger">Fehler beim Laden der gelöschten Befehle.</p>`;
  }
}

export async function restoreCommand(commandId) {
  try {
    const result = await window.electronAPI.dbQuery('SELECT * FROM deleted_commands WHERE cmd_id = ?', [commandId]);
    const cmd = result[0];
    await window.electronAPI.dbQuery(`INSERT INTO commands
                (category_id, cmd_title, cmd, cmd_description, cmd_source)
                VALUES (?, ?, ?, ?, ?)`, [cmd.category_id, cmd.cmd_title, cmd.cmd, cmd.cmd_description, cmd.cmd_source]);
    await window.electronAPI.dbQuery('DELETE FROM deleted_commands WHERE cmd_id = ?', [commandId]);
    showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.restorecommand.messages.restoreSuccess")}` });
  } catch (error) {
    console.log('Fehler beim Wiederherstellen des Commands:', error);
    showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.restorecommand.messages.restoreError")}` });
  } finally {
    loadDeletedCommands();
  }
}

export async function fullyDeleteCommand(commandId) {
  try {
    const result = await window.electronAPI.dbQuery('DELETE FROM deleted_commands WHERE cmd_id = ?', [commandId]);
    showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.restorecommand.messages.fullyDeleteSuccess")}` });
  } catch (error) {
    console.log('Fehler beim Löschen des Commands:', error);
    showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.restorecommand.messages.fullyDeleteError")}` });
  } finally {
    loadDeletedCommands();
  }
}