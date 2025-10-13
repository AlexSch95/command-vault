## 📖 Übersicht

Command Vault ist eine lokale Desktop-Anwendung, die dir dabei hilft, deine häufig verwendeten Befehle zu speichern, zu organisieren und schnell wiederzufinden. Vergiss nie wieder einen wichtigen Befehl!

### 🏠 **Hauptfunktionalitäten**
- **Befehle speichern**: Speichere Commands mit Titel, Beschreibung und Quell-Links
- **Kategorie-Management**: Organisiere Befehle nach Kategorien (Git, Linux, Docker, etc.)
- **Intelligente Suche**: Finde Befehle schnell über ihren Titel, den Befehl oder die Beschreibung
- **One-Click Copy**: Kopiere Commands direkt in die Zwischenablage
- **Lokale Speicherung**: Alle Daten werden lokal in einer SQLite-Datenbank gespeichert
- **Mehrere Sprachen**: 1-Klick-Sprachänderung (Aktuell Verfügbar: Deutsch, Englisch)

### 🎨 **Theme & Personalisierung**
- **Vordefinierte Themes**: Light-, Dark-, Coffee- und Navytheme
- **Custom Themes**: Vollständig anpassbare Farbschemata
- **Live Preview**: Themes werden sofort angewendet
- **Persistente Einstellungen**: Themes bleiben nach Neustart erhalten

### ⚙️ **Erweiterte Funktionen**
- **CRUD-Operationen**: Erstellen, Bearbeiten, Löschen von Befehlen und Kategorien
- **Inline-Editing**: Bearbeite Befehle direkt in der Übersicht
- **Markdown**: Beschreibungen unterstützen Markdown
- **Modal-Bestätigungen**: Sichere Lösch-Dialoge mit Bestätigungseingabe
- **Responsive Design**: Funktioniert auf verschiedenen Bildschirmgrößen
- **Datenbankwipe**: Die Datenbank kann direkt über die Einstellungen bereinigt werden
- **In-App Backup Wiederherstellung**: Backups können ohne lästiges verschieben oder umbenennen direkt in den Einstellungen wiederhergestellt oder gelöscht werden
- **Papierkorb**: Gelöschte Befehle verweilen in der Datenbank und können innerhalb der Einstellungen wiederhergestellt oder endgültig gelöscht werden.
- **Updates**: Die Anwendung kann völlig unkompliziert auf den neuesten Stand gebracht werden (siehe Einstellungen)

# 🛠️ Tech-Stack

### **Frontend**
- **HTML5** - Struktur und Semantik
- **CSS3** - Styling mit Custom Properties (CSS Variables)
- **JavaScript (ES6+)** - Moderne JavaScript-Features und Module
- **Bootstrap 5** - Responsive UI-Framework
- **Bootstrap Icons** - Umfangreiche Icon-Bibliothek
- **Marked.js** - Markdown Parser für formatierte Beschreibungen

### **Backend/Desktop**
- **Electron** - Cross-Platform Desktop App Framework
- **Node.js** - JavaScript Runtime
- **SQLite3** - Lokale Datenbank für Datenpersistierung
- **IPC (Inter-Process Communication)** - Sichere Kommunikation zwischen Main- und Renderer-Process

### **Datenbank und User-Theme**
- **Speicherort**: Die Datenbank, Datenbank-Backups und das User-Theme wird in folgendem Pfad gespeichert
```
%APPDATA%/command-vault/
```
## 🚀 Installation & Setup (für Developer)

### **Voraussetzungen**
- Node.js (Version 14 oder höher)
- npm

### **In der Entwicklungsumgebung**
```bash
# Repository klonen
git clone https://github.com/AlexSch95/command-vault.git
cd command-vault

# Dependencies installieren
npm install

# App ohne Build starten
npm run start
```

## 🎯 Verwendung

### **1. Erste Kategorie erstellen**
1. Öffne die Einstellungen (Zahnrad-Icon in der Navbar)
2. Scrolle zu "Kategorie verwalten"
3. Klicke auf "Neue Kategorie"
4. Gib einen Namen ein (z.B. "Git", "Linux", "Docker")
5. Wähle eine Farbe für die Kategorie
6. Speichere die Kategorie

### **2. Ersten Befehl hinzufügen**
1. Navigiere zu "Befehl hinzufügen"
2. Wähle eine der erstellten Kategorien aus
3. Gib Titel, Befehl und Beschreibung ein
4. Optional: Füge einen Quell-Link hinzu
5. Speichere den Befehl

### **3. Befehle durchsuchen**
1. Gehe zu "Befehle anzeigen"
2. Nutze die Suchfunktion oder Filter nach Kategorie
3. Klicke auf das Kopier-Icon um Commands zu kopieren
4. Bearbeite oder lösche Befehle direkt

### **4. Theme anpassen**
1. Öffne die Einstellungen (Zahnrad-Icon)
2. Scrolle zu "Farben"
3. Wähle Light/Dark Mode oder
4. Erstelle ein custom Theme mit eigenen Farben
5. Klicke "Übernehmen" - Theme wird sofort aktiv

### **5. Kategorien verwalten**
1. In den Einstellungen findest du "Kategorie verwalten"
2. Wähle eine existierende Kategorie zum Bearbeiten
3. Ändere Name oder Farbe nach Belieben
4. Lösche Kategorien (⚠️ entfernt auch alle zugehörigen Commands)

## 💡 Tipps

- **Nutze aussagekräftige Titel** für deine Commands
- **Organisiere mit Kategorien** für bessere Übersicht
- **Verwende Beschreibungen** für komplexere Commands
- **Teste deine Themes** in verschiedenen Bereichen der App
- **Erstelle regelmäßig Backups** deiner Datenbank

---

**Entwickelt mit ❤️ für Entwickler, die ihre Commands nie wieder vergessen wollen!**

## Credits
[Vault icons created by Driss Lebbat - Flaticon](https://www.flaticon.com/free-icons/vault)
