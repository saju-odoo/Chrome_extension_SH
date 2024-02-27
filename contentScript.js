const CHROME_STORAGE_FAVORITES_KEY = "starredProjects";
const STARRED_CLASS = "fa-star";
const NON_STARRED_CLASS = "fa-star-o";

const generateFavoriteElement = (type, isStarred = false) => {
    const currentClass = isStarred ? STARRED_CLASS : NON_STARRED_CLASS;
    if (type === "card") {
        const star = document.createElement("div");
        star.innerHTML = `<i class="fa ${currentClass}" aria-hidden="true"></i>`
        star.className = "x-odoo-sh-favorite-icon p-2";
        star.title = "Click to star project";
        return star;
    }

    if (type === "list") {
        const star = document.createElement("i");
        star.classList.add("fa", currentClass, "pr-2", "x-odoo-sh-favorite-icon-list");
        star.ariaHidden = "true";
        star.title = "Click to star project";
        return star;
    }
};

const getFavoritesProjects = async () => {
    const data = await chrome.storage.local.get(CHROME_STORAGE_FAVORITES_KEY);
    return data[CHROME_STORAGE_FAVORITES_KEY] || [];
};

const setFavoritesProjects = async (projects) => {
    projects = [...new Set(projects)];
    return await chrome.storage.local.set({[CHROME_STORAGE_FAVORITES_KEY]: projects})
};

const sortProjects = (a, b) => {
    const aHasStar = a.querySelector(".fa-star") !== null;
    const bHasStar = b.querySelector(".fa-star") !== null;
    if (aHasStar && bHasStar) {
        const aName = a.dataset.name;
        const bName = b.dataset.name;
        return aName.localeCompare(bName);
    }
    return bHasStar - aHasStar;
};

const toggleStar = (stars, projectName) => {
    const isStarred = stars[0].classList.contains(STARRED_CLASS);
    if (isStarred) {
        stars.forEach((star) => {
            star.classList.remove(STARRED_CLASS);
            star.classList.add(NON_STARRED_CLASS);
        });
        return removeFavorite(projectName);
    } else {
        stars.forEach((star) => {
            star.classList.remove(NON_STARRED_CLASS);
            star.classList.add(STARRED_CLASS);
        });
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
    const projectsContainer = document.querySelector(".o_project_cards");
    const tableBody = projectsContainer.querySelector("div.o_sh_display_list > table > tbody");

    const starContainer = event.currentTarget;
    const star = starContainer.querySelector("i") || starContainer;
    let otherStar;
    if (event.currentTarget.nodeName === "I"){ // Event comes from list view
        otherStar = document.querySelector(`div.o_project_card_container[data-name="${projectName}"] .x-odoo-sh-favorite-icon i`);
    } else { // Event comes from cards view
        otherStar = document.querySelector(`tr.o_project_card_container[data-name="${projectName}"] th i`);
    }

    return toggleStar([star, otherStar], projectName).then(() => {
        const projectsCardsNodes = document.querySelectorAll("div.o_project_card_container");
        const projectsListNodes = document.querySelectorAll("tr.o_project_card_container");
        const projectsCards = Array.from(projectsCardsNodes);
        const projectsList = Array.from(projectsListNodes);
        projectsCards.toSorted(sortProjects).forEach(element => projectsContainer.appendChild(element));
        projectsList.toSorted(sortProjects).forEach(element => tableBody.appendChild(element));
    });
};

const handleProjectListPage = async () => {
    const projectsCardsNodes = document.querySelectorAll("div.o_project_card_container");
    const projectsListNodes = document.querySelectorAll("tr.o_project_card_container");

    if (projectsCardsNodes.length === 0 && projectsListNodes.length === 0) {
        return;
    }

    const projectsCards = Array.from(projectsCardsNodes);
    const projectsList = Array.from(projectsListNodes);
    const projectsContainer = document.querySelector(".o_project_cards");
    const tableBody = projectsContainer.querySelector("div.o_sh_display_list > table > tbody");
    const favorites = await getFavoritesProjects();

    // Add star to each cards
    for (const projectCard of projectsCards) {
        const projectName = projectCard.dataset.name;
        const buttonsRow = projectCard.querySelector("div.card > div > div");

        if (buttonsRow) {
            buttonsRow.classList.add("x-odoo-sh-fix-card-buttons-row"); // Attempt to fix misalignement
            const dropdown = buttonsRow.querySelector(".o_project_dropdown");
            dropdown.classList.remove("p-2");
            dropdown.classList.add("x-odoo-sh-fix-card-dropdown");

            const star = generateFavoriteElement("card", favorites.includes(projectName));
            buttonsRow.appendChild(star);

            star.addEventListener("click", (event) => handleFavoriteClick(event, projectName));
        }
    }
    projectsCards.toSorted(sortProjects).forEach(element => projectsContainer.appendChild(element));

    for (const projectRow of projectsList) {
        const projectName = projectRow.dataset.name;

        const nameCell = projectRow.querySelector("th");

        if (nameCell) {
            const star = generateFavoriteElement("list", favorites.includes(projectName));
            nameCell.prepend(star);

            star.addEventListener("click", (event) => handleFavoriteClick(event, projectName));
        }
    }
    projectsList.toSorted(sortProjects).forEach(element => tableBody.appendChild(element));
};

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

initOdooSh().catch((error) => console.warn(error));
