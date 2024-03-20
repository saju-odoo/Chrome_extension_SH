const WINDOW_ODOO = window.hasOwnProperty("odoo") && window.odoo;

const getDefaultDebugMode = () => {
    return document.body.dataset.defaultDebugMode;
}

const initOdooWebsites = async () => {
    const defaultDebugMode = getDefaultDebugMode();
    if (WINDOW_ODOO && defaultDebugMode && (
        (defaultDebugMode !== "0" && defaultDebugMode !== WINDOW_ODOO.debug) ||
        (defaultDebugMode === "0" && WINDOW_ODOO.debug !== "")
    )) {
        const tabUrl = new URL(window.location.href);
        const params = new URLSearchParams(tabUrl.search);
        params.set("debug", defaultDebugMode);
        window.location.href = tabUrl.origin + tabUrl.pathname + `?${params.toString()}` + tabUrl.hash;
    }
}

initOdooWebsites().catch((e) => console.error(e));
