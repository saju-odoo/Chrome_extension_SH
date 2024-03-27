const CHROME_STORAGE_FAVORITES_KEY = "starredProjects";
const CHROME_STORAGE_SETTINGS_KEY = "settings";
const CHROME_STORAGE_SETTINGS_DEBUG_MODE_KEY = "enableDebugMode";

const getSettings = async () => {
    const data = await chrome.storage.local.get(CHROME_STORAGE_SETTINGS_KEY);
    return data[CHROME_STORAGE_SETTINGS_KEY] || {};
}

const setDebugMode = async (enableDebugMode) => {
    const settings = await getSettings();
    const newSettings = {
        ...settings,
        [CHROME_STORAGE_SETTINGS_DEBUG_MODE_KEY]: enableDebugMode
    }
    return await chrome.storage.local.set({[CHROME_STORAGE_SETTINGS_KEY]: newSettings})
};

const getFavoritesProjects = async () => {
    const data = await chrome.storage.local.get(CHROME_STORAGE_FAVORITES_KEY);
    return data[CHROME_STORAGE_FAVORITES_KEY]?.sort() || [];
};
document.addEventListener("DOMContentLoaded", async function() {
    const favorites = await getFavoritesProjects();
    const settings = await getSettings();
    // // Comments are tests for people who do not have access to odoo sh
    // const favorites = [
    //     'Odoo-electricity-app',
    //     'Electricity_cons_Bitcoin',
    //     'Portfolio_Optimization',
    // ];
    const projectsContainer = document.getElementById("projects");
    for (const favorite of favorites) {
        const a = document.createElement("a");
        a.href = `https://www.odoo.sh/project/${favorite}`;
        a.target = "_blank";
        a.innerHTML = `<li>${favorite}</li>`;
        projectsContainer.appendChild(a);
    }

    if (settings !== undefined && settings[CHROME_STORAGE_SETTINGS_DEBUG_MODE_KEY]) {
        document.getElementById("debug-mode").value = settings[CHROME_STORAGE_SETTINGS_DEBUG_MODE_KEY];
    }

    const debugModeSelect = document.getElementById("debug-mode");
    debugModeSelect.addEventListener("change", async (event) => {
        let selectedValue = event.target.value;
        if (selectedValue === "0") {
            selectedValue = false;
        }
        await setDebugMode(selectedValue);
    })
});
