import { showFeedback, loadGlobalTheme } from "./shared.js";

document.addEventListener('DOMContentLoaded', () => {
    loadGlobalTheme();
    setupCurrentColors();

    async function setupCurrentColors() {
        try {
            const savedTheme = await window.electronAPI.loadTheme();
            
            if (savedTheme) {
                document.getElementById('bg-primary-color').value = savedTheme.bgPrimary;
                document.getElementById('bg-secondary-color').value = savedTheme.bgSecondary;
                document.getElementById('border-color').value = savedTheme.borderColor;
                document.getElementById('text-primary-color').value = savedTheme.textPrimary;
                document.getElementById('accent-color').value = savedTheme.accentColor;
            }
        } catch (error) {
            console.error('Fehler beim Laden des globalen Themes:', error);
        }
    }


    async function saveTheme() {
        try {
            const themeData = {
                bgPrimary: document.getElementById('bg-primary-color').value,
                bgSecondary: document.getElementById('bg-secondary-color').value,
                borderColor: document.getElementById('border-color').value,
                textPrimary: document.getElementById('text-primary-color').value,
                accentColor: document.getElementById('accent-color').value,
                timestamp: new Date().toISOString()
            };

            console.log(themeData);
            
            const result = await window.electronAPI.saveTheme(themeData);
            
            if (result.success) {
                // Theme sofort anwenden
                applyTheme(themeData);
                showFeedback(result);
            } else {
                showFeedback(result);
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Themes:', error);
            showFeedback({ success: false, message: 'Fehler beim Speichern des Themes.' });
        }
    }


    function applyTheme(themeData) {
        // CSS Custom Properties dynamisch setzen
        const root = document.documentElement;
        root.style.setProperty('--bg-primary', themeData.bgPrimary);
        root.style.setProperty('--bg-secondary', themeData.bgSecondary);
        root.style.setProperty('--border-color', themeData.borderColor);
        root.style.setProperty('--text-primary', themeData.textPrimary);
        root.style.setProperty('--accent-color', themeData.accentColor);
    }

    async function applyLightMode() {
        // Light Mode Theme Farben
        const lightTheme = {
            bgPrimary: '#ffffff',        // Weißer Hintergrund
            bgSecondary: '#f8f9fa',      // Sehr helles Grau für Cards
            borderColor: '#dee2e6',      // Helles Grau für Rahmen
            textPrimary: '#212529',      // Dunkler Text
            accentColor: '#21b9ffff'       // Himmelsblau
        };

        // Color Picker aktualisieren
        document.getElementById('bg-primary-color').value = lightTheme.bgPrimary;
        document.getElementById('bg-secondary-color').value = lightTheme.bgSecondary;
        document.getElementById('border-color').value = lightTheme.borderColor;
        document.getElementById('text-primary-color').value = lightTheme.textPrimary;
        document.getElementById('accent-color').value = lightTheme.accentColor;

        // Theme anwenden
        applyTheme(lightTheme);

        // Theme speichern
        try {
            const themeData = {
                ...lightTheme,
                timestamp: new Date().toISOString()
            };
            
            const result = await window.electronAPI.saveTheme(themeData);
            if (result.success) {
                showFeedback({ success: true, message: 'Light Mode aktiviert!' });
            } else {
                showFeedback(result);
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Light Themes:', error);
            showFeedback({ success: false, message: 'Fehler beim Speichern des Themes.' });
        }
    }

    async function applyDarkMode() {
        // Dark Mode Theme Farben (Deep Navy Theme)
        const darkTheme = {
            bgPrimary: '#0f172a',        // Tiefes Navy
            bgSecondary: '#1e293b',      // Navy-Grau
            borderColor: '#334155',      // Heller Navy
            textPrimary: '#f1f5f9',      // Sehr helles Grau
            accentColor: '#0d6efd'       
        };

        // Color Picker aktualisieren
        document.getElementById('bg-primary-color').value = darkTheme.bgPrimary;
        document.getElementById('bg-secondary-color').value = darkTheme.bgSecondary;
        document.getElementById('border-color').value = darkTheme.borderColor;
        document.getElementById('text-primary-color').value = darkTheme.textPrimary;
        document.getElementById('accent-color').value = darkTheme.accentColor;

        // Theme anwenden
        applyTheme(darkTheme);

        // Theme speichern
        try {
            const themeData = {
                ...darkTheme,
                timestamp: new Date().toISOString()
            };
            
            const result = await window.electronAPI.saveTheme(themeData);
            if (result.success) {
                showFeedback({ success: true, message: 'Dark Mode aktiviert!' });
            } else {
                showFeedback(result);
            }
        } catch (error) {
            console.error('Fehler beim Speichern des Dark Themes:', error);
            showFeedback({ success: false, message: 'Fehler beim Speichern des Themes.' });
        }
    }

    document.getElementById('save-theme-btn').addEventListener('click', saveTheme);
    document.getElementById('light-mode-btn').addEventListener('click', applyLightMode);
    document.getElementById('dark-mode-btn').addEventListener('click', applyDarkMode);
});