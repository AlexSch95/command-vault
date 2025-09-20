import { showFeedback } from "./shared.js";

document.addEventListener('DOMContentLoaded', () => {

    let newTechMode = false;
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
            newButton.textContent = 'Neu';
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