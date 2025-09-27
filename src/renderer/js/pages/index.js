import { loadGlobalTheme } from "../shared/shared.js";

document.addEventListener("DOMContentLoaded", async () => {
    if (window.i18n) {
        await window.i18n.ready;
    }

    loadGlobalTheme();

    const languageSwitchers = document.querySelectorAll('.language-switcher');
    languageSwitchers.forEach(switcher => {
        switcher.addEventListener('click', async (event) => {
            event.preventDefault();
            const selectedLang = switcher.getAttribute('data-language');
            await window.switchLanguage(selectedLang);
            window.i18n.updatePage();
        });
    });

});
