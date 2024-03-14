const CHROME_STORAGE_FAVORITES_KEY = "starredProjects";

const getFavoritesProjects = async () => {
    const data = await chrome.storage.local.get(CHROME_STORAGE_FAVORITES_KEY);
    return data[CHROME_STORAGE_FAVORITES_KEY].sort() || [];
};
document.addEventListener("DOMContentLoaded", async function() {
    const favorites = await getFavoritesProjects();
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
});
