const CHROME_STORAGE_SETTINGS_KEY = "settings";

const scriptEl = document.createElement("script");
scriptEl.src = chrome.runtime.getURL("scripts/odooWebsites.js");
(document.head || document.documentElement).appendChild(scriptEl);

chrome.storage.local.get(CHROME_STORAGE_SETTINGS_KEY, (data) => {
    document.body.dataset.defaultDebugMode = data[CHROME_STORAGE_SETTINGS_KEY]?.enableDebugMode || "0";
})
