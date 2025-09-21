import { showFeedback, loadGlobalTheme } from "./shared.js";

document.addEventListener('DOMContentLoaded', () => {
    loadGlobalTheme();
    loadTechnologies();

    document.getElementById('add-command-btn').addEventListener('click', async (event) => {
        event.preventDefault();

        const tech = document.getElementById('tech');
        const title = document.getElementById('title');
        const command = document.getElementById('command');
        const description = document.getElementById('description');
        const source = document.getElementById('source');

        try {
            const result = await window.electronAPI.dbQuery('INSERT INTO commands (tech_id, titel, command, beschreibung, source) VALUES (?, ?, ?, ?, ?)', [tech.value, title.value, command.value, description.value, source.value]);
            console.log('Datenbank Ergebnis:', result)
            showFeedback({ success: true, message: 'Command erfolgreich hinzugefügt!' });
            document.getElementById('add-command-form').reset();
        } catch (error) {
            console.error('Datenbank Fehler:', error);
            showFeedback({ success: false, message: 'Fehler beim Hinzufügen des Commands.' });
        }
    });
    
    document.getElementById('reset-btn').addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById('add-command-form').reset();
    });

    async function loadTechnologies() { 
        try {
            const technologies = await window.electronAPI.dbQuery('SELECT * FROM technologies ORDER BY tech_name ASC');
            const techSelect = document.getElementById('tech');
            console.log(technologies);
            technologies.forEach(tech => {
                const option = document.createElement('option');
                option.value = tech.tech_id;
                option.textContent = tech.tech_name;
                techSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Fehler beim Laden der Technologien:', error);
        }
    }

});

            
