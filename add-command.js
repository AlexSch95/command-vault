document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('add-command-btn').addEventListener('click', async (event) => {
        event.preventDefault();

        const tech = document.getElementById('tech');
        const title = document.getElementById('title');
        const command = document.getElementById('command');
        const description = document.getElementById('description');
        const source = document.getElementById('source');

        try {
            const result = await window.electronAPI.dbQuery('INSERT INTO commands (tech, titel, command, beschreibung, source) VALUES (?, ?, ?, ?, ?)', [tech.value, title.value, command.value, description.value, source.value]);
            console.log('Datenbank Ergebnis:', result)
            alert('Command erfolgreich hinzugefügt!');
            document.getElementById('add-command-form').reset();
        } catch (error) {
            console.error('Datenbank Fehler:', error);
        }
    });
    
    document.getElementById('reset-btn').addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById('add-command-form').reset();
    });



});