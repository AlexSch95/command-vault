// i18n.js
class I18n {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'en';
        this.translations = {};
        this.ready = this.loadLanguage(this.currentLanguage);
    }

    async loadLanguage(lang) {
        try {
            const response = await fetch(`../locales/${lang}.json`);
            this.translations = await response.json();
            this.currentLanguage = lang;
            this.saveLanguage(lang);
            return true;
        } catch (error) {
            console.error('Failed to load language:', error);
            if (lang !== 'en') {
                return await this.loadLanguage('en');
            }
            return false;
        }
    }

    translate(key) {
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        return value || key;
    }

    async switchLanguage(lang) {
        await this.loadLanguage(lang);
        this.updatePage();
    }

    updatePage() {
        // Alle Elemente mit data-i18n übersetzen
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Title Attribute
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.translate(key);
        });

        // Event für JavaScript-Updates
        if (typeof window.updateLanguage === 'function') {
            window.updateLanguage();
        }
    }

    initializeUI() {
        // Sprache wechseln
        window.switchLanguage = async (lang) => {
            await this.switchLanguage(lang);
            const currentLangElement = document.getElementById('currentLang');
            if (currentLangElement) {
                currentLangElement.textContent = lang.toUpperCase();
            }
        };

        // Auto-Initialisierung beim DOMContentLoaded
        document.addEventListener('DOMContentLoaded', async () => {
            await this.ready;
            this.updatePage();
            
            const currentLangElement = document.getElementById('currentLang');
            if (currentLangElement) {
                currentLangElement.textContent = this.getCurrentLanguage().toUpperCase();
            }
        });
    }

    getStoredLanguage() {
        return localStorage.getItem('command-vault-language');
    }

    saveLanguage(lang) {
        localStorage.setItem('command-vault-language', lang);
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

const i18nInstance = new I18n();
window.i18n = i18nInstance;

// Automatisch initialisieren
i18nInstance.initializeUI();