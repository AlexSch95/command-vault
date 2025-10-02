import { showFeedback } from "../../shared/shared.js";

if (window.i18n) {
  await window.i18n.ready;
}

let newTechMode = false;

export function init() {
  loadCategories();
}

export async function loadCategories() {
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
      document.getElementById('delete-technology-btn').disabled = true;
      techSelect.innerHTML = `<option value="">${window.i18n.translate("pages.settings.categories.noCategories")}</option>`;
    } else {
      techSelect.innerHTML = `<option value="">${window.i18n.translate("pages.settings.categories.categoryPlaceholder")}</option>`;
      technologies.forEach(tech => {
        const option = document.createElement('option');
        option.value = tech.tech_id;
        option.textContent = tech.tech_name;
        option.dataset.color = tech.color;
        techSelect.appendChild(option);
      });
    }


    const newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.textContent = `${window.i18n.translate("pages.settings.categories.buttons.addNew")}`;
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
      document.getElementById('delete-technology-btn').disabled = true;
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

export async function addCategory() {
  const tech = document.getElementById('tech');
  const color = document.getElementById('color');
  if (newTechMode === true && tech.value != '') {
    try {
      const result = await window.electronAPI.dbQuery('INSERT INTO technologies (tech_name, color) VALUES (?, ?)', [tech.value, color.value]);
      showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.categories.messages.categorySaved")}` });
      document.getElementById('add-technology-form').reset();
    } catch (error) {
      console.error('Datenbank Fehler:', error);
      showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.categories.messages.categorySaveError")}` });
    }
  } else if (newTechMode === false && tech.value != '') {
    try {
      const result = await window.electronAPI.dbQuery('UPDATE technologies SET color = ? WHERE tech_id = ?', [color.value, tech.value]);
      showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.categories.messages.categoryUpdated")}` });
      document.getElementById('add-technology-form').reset();
    } catch (error) {
      console.error('Datenbank Fehler:', error);
      showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.categories.messages.categoryUpdateError")}` });
    }
  } else if (tech.value == '') {
    showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.categories.messages.noCategorySelected")}` });
  }
  loadCategories();
}

export async function deleteCategory() {
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
                            <h5 class="modal-title text-light">${window.i18n.translate("pages.settings.categories.modal.title")}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-light">
                            <p>${window.i18n.translate("pages.settings.categories.modal.warning")}</p>
                            <p>${window.i18n.translate("pages.settings.categories.modal.confirmThisp1")}
                            "<strong>${techName}</strong>" 
                            ${window.i18n.translate("pages.settings.categories.modal.confirmThisp2")}</p>
                            <input type="text" class="form-control bg-dark border-secondary text-light mt-3" 
                                   id="confirmTechName" placeholder="${techName}" autocomplete="off">
                        </div>
                        <div class="modal-footer border-secondary">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            ${window.i18n.translate("pages.settings.categories.modal.cancelButton")}
                            </button>
                            <button type="button" class="btn btn-danger" id="confirmDelete" disabled>
                            ${window.i18n.translate("pages.settings.categories.modal.deleteButton")}
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
          showFeedback({ success: true, message: `${window.i18n.translate("pages.settings.categories.messages.categoryDeleted")}` });
          document.getElementById('add-technology-form').reset();
          loadCategories();
          bootstrapModal.hide();
        } catch (error) {
          console.error('Datenbank Fehler:', error);
          showFeedback({ success: false, message: `${window.i18n.translate("pages.settings.categories.messages.categoryDeleteError")}` });
        }
      }
    });

    // Modal nach Schließen entfernen
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }
}