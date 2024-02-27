const CHROME_STORAGE_FAVORITES_KEY = "starredProjects";
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
    const layout = document.querySelector(".o_sh_projects_layout");
    if (!layout) {
        return false;
    }
    return layout.children[0].className.includes("btn-primary");
};

const sortProjects = (a, b) => {
    const aHasStar = a.querySelector(".fa-star") !== null;
    const bHasStar = b.querySelector(".fa-star") !== null;
    return bHasStar - aHasStar;
};

const toggleStar = (star, projectName) => {
    const isStarred = star.classList.contains(STARRED_CLASS);
    if (isStarred) {
        star.classList.remove(STARRED_CLASS);
        star.classList.add(NON_STARRED_CLASS);
        return removeFavorite(projectName);
    } else {
        star.classList.remove(NON_STARRED_CLASS);
        star.classList.add(STARRED_CLASS);
        return addFavorite(projectName);
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
    return toggleStar(star, projectName);
};

const handleProjectListPage = async () => {
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

                star.addEventListener("click", (event) => handleFavoriteClick(event, projectName).then(() => projects.toSorted(sortProjects).forEach(element => projectsContainer.appendChild(element))));
            }
        }

        projects.toSorted(sortProjects).forEach(element => projectsContainer.appendChild(element));
}};

const handleProjectPage = async () => {
    const wrapper = document.querySelector("#wrapwrap");
    const favorites = await getFavoritesProjects();

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName.toLowerCase() === "header") {
                        const projectMenu = document.querySelector("div.project-menu");
                        const tableBody = projectMenu.querySelector("table tbody");
                        const projects = Array.from(tableBody.children);
                        projects.toSorted((a, b) => {
                            const aIsFavorite = favorites.some((fav) => a.children[1].innerText === fav);
                            const bIsFavorite = favorites.some((fav) => b.children[1].innerText === fav);
                            if (aIsFavorite) {
                                if (a.children[0].children.length === 0) {
                                    const star = document.createElement("i");
                                    star.className = "fa fa-star text-warning";
                                    a.children[0].append(star)
                                } else if (a.children[0].children.length === 1 && !a.children[0].children[0].className.includes("fa-star")) {
                                    a.children[0].children[0].classList.remove("fa-check");
                                    a.children[0].children[0].classList.add("fa-star");
                                }
                            }
                            return bIsFavorite - aIsFavorite;
                        }).forEach((project) => tableBody.append(project));
                        observer.disconnect();
                    }
                });
            }
        });
    });

    observer.observe(wrapper, { attributes: true, childList: true, subtree: true });
};

const initOdooSh = async () => {
    if (window.location.href === "https://www.odoo.sh/project") {
        return handleProjectListPage();
    } else if (window.location.href.startsWith("https://www.odoo.sh/project/")) {
        return handleProjectPage();
    }
};

initOdooSh().catch((error) => console.error(error));
