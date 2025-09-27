# Command Vault

Eine moderne Electron-App zur Verwaltung und Organisation deiner wichtigsten Programmierbefehle.

## 📖 Übersicht

Command Vault ist eine lokale Desktop-Anwendung, die dir dabei hilft, deine häufig verwendeten Befehle zu speichern, zu organisieren und schnell wiederzufinden. Vergiss nie wieder einen wichtigen Befehl!

## ✨ Features

### 🏠 **Hauptfunktionalitäten**
- **Befehle speichern**: Speichere Commands mit Titel, Beschreibung und Quell-Links
- **Technologie-Management**: Organisiere Befehle nach Technologien (Git, Linux, Docker, etc.)
- **Intelligente Suche**: Finde Befehle schnell über Titel, Command oder Technologie
- **One-Click Copy**: Kopiere Commands direkt in die Zwischenablage
- **Lokale Speicherung**: Alle Daten werden lokal in einer SQLite-Datenbank gespeichert
- **Update-Funktion**: Automatische Updates können über den Einstellungsbereich durchgeführt werden 

### 🎨 **Theme & Personalisierung**
- **Vordefinierte Themes**: Light-, Dark-, Coffee- und Navytheme
- **Custom Themes**: Vollständig anpassbare Farbschemata
- **Live Preview**: Themes werden sofort angewendet
- **Persistente Einstellungen**: Themes bleiben nach Neustart erhalten

### ⚙️ **Erweiterte Funktionen**
- **CRUD-Operationen**: Erstellen, Bearbeiten, Löschen von Commands und Technologien
- **Inline-Editing**: Bearbeite Commands direkt in der Übersicht
- **Markdown**: Beschreibungen unterstützen Markdown
- **Modal-Bestätigungen**: Sichere Lösch-Dialoge mit Bestätigungseingabe
- **Responsive Design**: Funktioniert auf verschiedenen Bildschirmgrößen
- **Datenbank-Management**: Datenbank-Backups und Bereinigung über die App möglich
- **Updates**: Automatische Updatefunktion

## 🛠️ Technologien

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

### **Architektur**
- **IPC (Inter-Process Communication)** - Sichere Kommunikation zwischen Main- und Renderer-Process
- **Modular JavaScript** - ES6 Module-System

### **Datenbank und User-Theme**
- **Speicherort**: Die Datenbank und das User-Theme wird in folgendem Pfad gespeichert
```
%APPDATA%/command-vault/
```

## 🗄️ Datenbankschema

```sql
-- Technologien (Git, Linux, Docker, etc.)
CREATE TABLE technologies (
    tech_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tech_name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Commands/Befehle
CREATE TABLE commands (
    command_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tech_id INTEGER NOT NULL,
    titel TEXT NOT NULL,
    command TEXT NOT NULL,
    beschreibung TEXT,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tech_id) REFERENCES technologies(tech_id) ON DELETE CASCADE
);
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

## 📂 Projektstruktur

```
command-vault/
├── main.js                   # Electron Main Process
├── preload.js                # Preload Script für IPC
├── index.html                # Hauptseite
├── add-command.html          # Befehle hinzufügen
├── view-commands.html        # Befehle anzeigen
├── settings.html             # Einstellungen & Theme-Management
├── styles.css                # Globale Styles & CSS Variables
├── index.js                  # Homepage Logic
├── add-command.js            # Command-Erstellung Logic
├── view-commands.js          # Command-Anzeige & Filter Logic
├── settings.js               # Settings & Theme Logic
├── shared.js                 # Geteilte Utilities (Theme-Loading, Feedback)
├── node_modules/             # Dependencies (Bootstrap, Icons etc.)
├── database.db               # SQLite Datenbank (wird automatisch erstellt)
├── user-theme.json           # Gespeicherte Theme-Einstellungen
├── package.json              # Node.js Dependencies & Scripts
└── README.md                 # Dokumentation
```

## 🎯 Verwendung

### **1. Erste Technologie erstellen**
1. Öffne die Einstellungen (Zahnrad-Icon in der Navbar)
2. Scrolle zu "Technologien verwalten"
3. Klicke auf "Neue Technologie"
4. Gib einen Namen ein (z.B. "Git", "Linux", "Docker")
5. Wähle eine Farbe für die Technologie
6. Speichere die Technologie

### **2. Ersten Befehl hinzufügen**
1. Navigiere zu "Befehl hinzufügen"
2. Wähle eine der erstellten Technologien aus
3. Gib Titel, Command und Beschreibung ein
4. Optional: Füge einen Quell-Link hinzu
5. Speichere den Befehl

### **3. Befehle durchsuchen**
1. Gehe zu "Befehle anzeigen"
2. Nutze die Suchfunktion oder Filter nach Technologie
3. Klicke auf das Kopier-Icon um Commands zu kopieren
4. Bearbeite oder lösche Befehle direkt

### **4. Theme anpassen**
1. Öffne die Einstellungen (Zahnrad-Icon)
2. Scrolle zu "Farben"
3. Wähle Light/Dark Mode oder
4. Erstelle ein custom Theme mit eigenen Farben
5. Klicke "Übernehmen" - Theme wird sofort aktiv

### **5. Technologien verwalten**
1. In den Einstellungen findest du "Technologien verwalten"
2. Wähle eine existierende Technologie zum Bearbeiten
3. Ändere Name oder Farbe nach Belieben
4. Lösche Technologien (⚠️ entfernt auch alle zugehörigen Commands)

## 💡 Tipps

- **Nutze aussagekräftige Titel** für deine Commands
- **Organisiere mit Technologien** für bessere Übersicht
- **Verwende Beschreibungen** für komplexere Commands
- **Teste deine Themes** in verschiedenen Bereichen der App
- **Erstelle regelmäßig Backups** deiner Datenbank

---

**Entwickelt mit ❤️ für Entwickler, die ihre Commands nie wieder vergessen wollen!**

## Credits
[Vault icons created by Smashicons - Flaticon](https://www.flaticon.com/free-icons/vault)
