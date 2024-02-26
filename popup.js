const CHROME_STORAGE_FAVORITES_KEY = "starredProjects";

const getFavoritesProjects = async () => {
    const data = await chrome.storage.local.get(CHROME_STORAGE_FAVORITES_KEY);
    return data[CHROME_STORAGE_FAVORITES_KEY].sort() || [];
};
document.addEventListener("DOMContentLoaded", async function() {
    const favorites = await getFavoritesProjects();
    const projectsContainer = document.getElementById("projects");
    for (const favorite of favorites) {
        const li = document.createElement("li");
        li.innerHTML = `<a href="https://www.odoo.sh/project/${favorite}" target="_blank">${favorite}</a>`;
        projectsContainer.appendChild(li);
    }
});
