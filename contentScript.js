(() => {
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value } = obj;

        if (type === "NEW"){
            shLoaded();
        }
    });

    const shLoaded = () => {
        const starExists = document.getElementsByClassName("star")[0];

        if (!starExists) {
            // Set star image
            const star = document.createElement("img");
            star.style.width = "25px";
            star.style.height = "25px";
            star.src = chrome.runtime.getURL("assets/star.png");
            star.className = "ytp-button " + "star";
            star.title = "Click to star project";

            // Add star to each cards
            card_containers = document.getElementsByClassName("o_project_card_container");
            for (let i = 0; i < card_containers.length; i++) {
                const card_container = card_containers[i];
                const firstDivA = card_container.querySelector("div");
                const firstDiv = firstDivA.querySelector("div");
                if (firstDiv) {
                    const clonedStar = star.cloneNode(true);
                    firstDiv.appendChild(clonedStar); // Append the star image inside the first div

                    clonedStar.addEventListener("mouseover", () => {
                        clonedStar.style.opacity = "0.7";
                        //clonedStar.style.backgroundColor = "lightgray";
                    });
                    clonedStar.addEventListener("mouseout", () => {
                        clonedStar.style.opacity = "1";
                        //clonedStar.style.backgroundColor = "";
                    });
                    clonedStar.addEventListener("click", addNewStarEventHandler(card_container));
                }
            }
        }
    }

    const addNewStarEventHandler = (card) => {
        const project = card;

         // Storing the project name in Chrome storage
        chrome.storage.sync.get(["starredProjects"], function(result) {
            let starredProjects = result.starredProjects || [];
            starredProjects.push(project);
            chrome.storage.sync.set({ "starredProjects": starredProjects }, function() {
                console.log('Project stared');
            });
        });
    }

    shLoaded();
})();
