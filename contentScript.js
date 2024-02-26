const CHROME_STORAGE_FAVORITES_KEY = "starredProjects"
const STARRED_CLASS = "fa-star";
const NON_STARRED_CLASS = "fa-star-o";

const generateFavoriteElement = (isStarred = false) => {
    const star = document.createElement("div");
    const currentClass = isStarred ? STARRED_CLASS : NON_STARRED_CLASS;

    star.innerHTML = `<i class="fa ${currentClass}" aria-hidden="true"></i>`
    star.className = "x-odoo-sh-favorite-icon p-2";
    star.title = "Click to star project";
    return star;
};

const getFavoritesProjects = async () => {
    const data = await chrome.storage.local.get(CHROME_STORAGE_FAVORITES_KEY);
    return data[CHROME_STORAGE_FAVORITES_KEY] || [];
};

const setFavoritesProjects = async (projects) => {
    projects = [...new Set(projects)];
    return await chrome.storage.local.set({[CHROME_STORAGE_FAVORITES_KEY]: projects})
};

/**
 * This function checks if the current view is a cards view or a list view.
 * It does this by checking the class name of the first child of the element with class "o_sh_projects_layout".
 * If the class name includes "btn-primary", it means the current view is a cards view.
 * The first child of the element represents the cards view and the second child represents the list view.
 *
 * @returns {boolean} - Returns true if the current view is a cards view, false otherwise.
 *
 * @example
 * const isCardsView = isCardsViewList();
 * if (isCardsView) {
 *     console.log("The current view is a cards view.");
 * } else {
 *     console.log("The current view is a list view.");
 * }
 */
const isCardLayout = () => {
    return document.querySelector(".o_sh_projects_layout").children[0].className.includes("btn-primary");
};

const sortProjects = (projects) => {
    return projects.toSorted((a, b) => {
        const aHasStar = a.querySelector(".fa-star") !== null;
        const bHasStar = b.querySelector(".fa-star") !== null;
        return bHasStar - aHasStar
    });
};

const toggleStar = (star) => {
    const isStarred = star.classList.contains(STARRED_CLASS);
    if (isStarred) {
        star.classList.remove(STARRED_CLASS);
        star.classList.add(NON_STARRED_CLASS);
    } else {
        star.classList.remove(NON_STARRED_CLASS);
        star.classList.add(STARRED_CLASS);
    }
};

const addFavorite = async (projectName) => {
    const favorites = await getFavoritesProjects();
    return await setFavoritesProjects([projectName, ...favorites])
};

const removeFavorite = async (projectName) => {
    const favorites = await getFavoritesProjects();
    const newFavorites = favorites.filter(favorite => favorite !== projectName);
    return await setFavoritesProjects(newFavorites)
};

const handleFavoriteClick = (event, projectName) => {
    const starContainer = event.currentTarget;
    const star = starContainer.querySelector("i");
    const isStarred = star.classList.contains(STARRED_CLASS);

    toggleStar(star);

    if (isStarred) {
        return removeFavorite(projectName);
    } else {
        return addFavorite(projectName);
    }
};

const initOdooSh = async () => {
    const starExists = document.querySelector(".x-odoo-sh-favorite-image");

    if (!starExists) {
        const projectsNodes = isCardLayout() ? document.querySelectorAll("div.o_project_card_container") : document.querySelectorAll("tr.o_project_card_container")
        if (projectsNodes.length === 0) {
            return;
        }
        const projects = Array.from(projectsNodes);
        const projectsContainer = document.querySelector(".o_project_cards");
        const favorites = await getFavoritesProjects();

        // Add star to each cards
        for (const project of projects) {
            const projectName = project.dataset.name;
            const buttonsRow = project.querySelector("div.card > div > div");

            if (buttonsRow) {
                buttonsRow.classList.add("x-odoo-sh-fix-card-buttons-row"); // Attempt to fix misalignement
                const dropdown = buttonsRow.querySelector(".o_project_dropdown");
                dropdown.classList.remove("p-2");
                dropdown.classList.add("x-odoo-sh-fix-card-dropdown");

                const star = generateFavoriteElement(favorites.includes(projectName));
                buttonsRow.appendChild(star);

                star.addEventListener("click", (event) => handleFavoriteClick(event, projectName).then(() => sortProjects(projects).forEach(element => projectsContainer.appendChild(element))));
            }
        }

        sortProjects(projects).forEach(element => projectsContainer.appendChild(element));
    }
};

initOdooSh().catch((error) => console.error(error));
