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
        const li = document.createElement("li");
        li.innerHTML = `<a href="https://www.odoo.sh/project/${favorite}" target="_blank">${favorite}</a>`;
        // li.innerHTML = `<a href="https://github.com/Minijump/${favorite}" target="_blank">${favorite}</a>`;
        projectsContainer.appendChild(li);
    }
});
