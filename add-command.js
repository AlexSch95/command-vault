import { showFeedback, loadGlobalTheme } from "./shared.js";

//desc: lädt alles erst, wenn das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', async () => {

    if (window.i18n) {
        await window.i18n.ready;
    }

    const languageSwitchers = document.querySelectorAll('.language-switcher');
    languageSwitchers.forEach(switcher => {
        switcher.addEventListener('click', async (event) => {
            event.preventDefault();
            const selectedLang = switcher.getAttribute('data-language');
            await window.switchLanguage(selectedLang);
            window.i18n.updatePage();
        });
    });
    
    
    //desc: initiales laden des contents, theme wird geladen und alle technologien
    loadGlobalTheme();
    loadTechnologies();

    //desc: eventlistener auf den form button zum eintragen eines neuen commands
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
            showFeedback({ success: true, message: `${window.i18n ? window.i18n.translate("messages.commandSaved") : "Befehl erfolgreich hinzugefügt!"}` });
            document.getElementById('add-command-form').reset();
        } catch (error) {
            console.error('Datenbank Fehler:', error);
            showFeedback({ success: false, message: `${window.i18n ? window.i18n.translate("messages.commandSaveError") : "Fehler beim Hinzufügen des Befehls."}` });
        }
    });

    //desc: um das form zu resetten
    document.getElementById('reset-btn').addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById('add-command-form').reset();
    });

    //desc: lädt alle technologien aus der db und füllt den select tag mit den technologien
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

