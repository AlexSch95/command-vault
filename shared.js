//desc: feedback funktion
export function showFeedback(result) {
  // responseBody dekonstruieren
  const { success, message } = result;
  // Error Alert Elemente Laden
  const errorText = document.getElementById("errorText");
  const errorBox = document.getElementById("errorMessage");
  if (success === true) {
    errorText.textContent = message;
    errorBox.classList.add("alert-success");
  } else if (success === false) {
    errorText.textContent = message;
    errorBox.classList.add("alert-danger");
  }
  errorBox.classList.remove("d-none");
  errorBox.classList.add("show");
  setTimeout(() => {
    errorText.textContent = "";
    errorBox.classList.add("d-none");
    errorBox.classList.remove("show", "alert-danger", "alert-success");
  }, 3000);
}

//desc: lädt das gespeicherte theme und wendet es an
export async function loadGlobalTheme() {
    try {
        const savedTheme = await window.electronAPI.loadTheme();
        
        if (savedTheme) {
            const root = document.documentElement;
            root.style.setProperty('--bg-primary', savedTheme.bgPrimary);
            root.style.setProperty('--bg-secondary', savedTheme.bgSecondary);
            root.style.setProperty('--border-color', savedTheme.borderColor);
            root.style.setProperty('--text-primary', savedTheme.textPrimary);
            root.style.setProperty('--accent-color', savedTheme.accentColor);
        }
    } catch (error) {
        console.error('Fehler beim Laden des globalen Themes:', error);
    }
}