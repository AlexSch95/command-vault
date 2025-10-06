import { showFeedback, loadGlobalTheme, getAppVersion } from "../shared/shared.js";

//desc: lädt alles erst, wenn das DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', async () => {

  if (window.i18n) {
    await window.i18n.ready;
  }

  
  //desc: initiales laden des contents, theme wird geladen und alle technologien
  let markdownDescription;
  
  await getAppVersion();
  loadGlobalTheme();
  loadTechnologies();
  loadMarkdownEditor();

  function loadMarkdownEditor() {
    markdownDescription = new EasyMDE({
      element: document.getElementById('description'),
      spellChecker: false,
      status: false,
      toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "preview", "guide"]
    });
  }


  document.getElementById("settingsButton").addEventListener("click", () => {
    document.getElementById("mainContentOverlay").classList.add("overlay-darken");
    window.electronAPI.openSettingsWindow();
  });

  window.electronAPI.onSettingsClosed(() => {
    document.getElementById("mainContentOverlay").classList.remove("overlay-darken");
    loadGlobalTheme();
    loadTechnologies();
  });

  const languageSwitchers = document.querySelectorAll('.language-switcher');
  languageSwitchers.forEach(switcher => {
    switcher.addEventListener('click', async (event) => {
      event.preventDefault();
      const selectedLang = switcher.getAttribute('data-language');
      await window.switchLanguage(selectedLang);
      window.i18n.updatePage();
    });
  });

  document.getElementById("minimize-btn").addEventListener("click", () => {
    window.electronAPI.minimizeWindow();
  });
  document.getElementById("close-btn").addEventListener("click", () => {
    window.electronAPI.closeWindow();
  });


  //desc: eventlistener auf den form button zum eintragen eines neuen commands
  document.getElementById('add-command-btn').addEventListener('click', async (event) => {
    event.preventDefault();
    markdownDescription.toTextArea();
    const tech = document.getElementById('tech');
    const title = document.getElementById('title');
    const command = document.getElementById('command');
    const description = document.getElementById('description');
    const source = document.getElementById('source');

    try {
      const result = await window.electronAPI.dbQuery('INSERT INTO commands (category_id, cmd_title, cmd, cmd_description, cmd_source) VALUES (?, ?, ?, ?, ?)', [tech.value, title.value, command.value, description.value, source.value]);
      console.log('Datenbank Ergebnis:', result)
      showFeedback({ success: true, message: `${window.i18n.translate("pages.addCommand.messages.cmdSaved")}` });
      document.getElementById('add-command-form').reset();
      loadMarkdownEditor()
    } catch (error) {
      console.error('Datenbank Fehler:', error);
      showFeedback({ success: false, message: `${window.i18n.translate("pages.addCommand.messages.cmdSaveError")}` });
    }
  });

  //desc: um das form zu resetten
  document.getElementById('reset-btn').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('add-command-form').reset();
    markdownDescription.value('');
  });

  //desc: lädt alle technologien aus der db und füllt den select tag mit den technologien
  async function loadTechnologies() {
    try {
      const technologies = await window.electronAPI.dbQuery('SELECT * FROM categories ORDER BY category_name ASC');
      const techOptions = document.getElementById('tech-options');
      if (technologies.length < 1) {
        techOptions.innerHTML = `<span class="me-4 text-primary">${window.i18n.translate("pages.addCommand.form.noTechPlaceholder")}</span>`;
        return;
      }
      techOptions.innerHTML = '';
      const techSelect = document.createElement('select');
      techSelect.className = 'form-select-lg form-select bg-dark border-secondary text-primary';
      techSelect.id = 'tech';
      techSelect.required = true;
      techOptions.appendChild(techSelect);
      technologies.forEach(tech => {
        const option = document.createElement('option');
        option.value = tech.category_id;
        option.textContent = tech.category_name;
        techSelect.appendChild(option);
      });
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
    }
  }
});
