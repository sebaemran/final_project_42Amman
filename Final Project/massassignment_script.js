const themeToggle = document.getElementById("mass-themeToggle");
const body = document.body;

function setTheme(theme) {
    const isDark = theme === "dark";

    body.classList.toggle("dark-mode", isDark);

    themeToggle.setAttribute("aria-pressed", String(isDark));

    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    const label = themeToggle.querySelector(".theme-label");

    if (label) {
        label.textContent = isDark ? "Light" : "Dark";
    }

    localStorage.setItem("dark-theme", theme);
}

const savedTheme = localStorage.getItem("dark-theme");

const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

setTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
    const isDark = body.classList.contains("dark-mode");

    setTheme(isDark ? "light" : "dark");
});

const originalUser = {
    username: "sally",
    email: "sally@gmail.com",
    role: "user",
    isAdmin: false
};

let vulnerableUser = { ...originalUser };
let fixedUser = { ...originalUser };

function vulnerableUpdate(requestBody) {

    Object.assign(vulnerableUser, requestBody);

}

function fixedUpdate(requestBody) {

    const allowedFields = ["username", "email"];

    allowedFields.forEach(field => {

        if (requestBody[field] !== undefined) {

            fixedUser[field] = requestBody[field];

        }

    });

}

const payloads = {

    normal: {
        username: "sally",
        email: "sally@gmail.com"
    },

    attack: {
        role: "admin",
        isAdmin: true
    }

};

function runPayload(type) {

    const payload = payloads[type];

    if (!payload) return;

    vulnerableUpdate(payload);

    fixedUpdate(payload);

    document.getElementById("requestBody").textContent =
        JSON.stringify(payload, null, 2);

    updateScreen();

    updateFinalResult(type);

}

function updateScreen() {
    document.getElementById("vUsername").textContent =
        vulnerableUser.username;

    document.getElementById("vEmail").textContent =
        vulnerableUser.email;

    document.getElementById("vRole").textContent =
        vulnerableUser.role;

    document.getElementById("vAdmin").textContent =
        vulnerableUser.isAdmin;


    document.getElementById("fUsername").textContent =
        fixedUser.username;

    document.getElementById("fEmail").textContent =
        fixedUser.email;

    document.getElementById("fRole").textContent =
        fixedUser.role;

    document.getElementById("fAdmin").textContent =
        fixedUser.isAdmin;
}

function updateFinalResult(type) {

    const vulnerableStatus =
        document.getElementById("vulnerableStatus");

    const fixedStatus =
        document.getElementById("fixedStatus");

    const vulnerableMessage =
        document.getElementById("vulnerableMessage");

    const fixedMessage =
        document.getElementById("fixedMessage");

    const finalResult =
        document.getElementById("finalResult");

    vulnerableStatus.className = "result-status";

    fixedStatus.className = "result-status";

    if (type === "normal") {

        vulnerableStatus.textContent = "SUCCESS";

        vulnerableStatus.classList.add("status-success");

        fixedStatus.textContent = "SUCCESS";

        fixedStatus.classList.add("status-success");


        vulnerableMessage.textContent =
            "Normal update accepted successfully.";


        fixedMessage.textContent =
            "Normal update accepted successfully.";


        finalResult.querySelector("h3").textContent =
            "Both applications accepted the normal update.";


        finalResult.querySelector("p").textContent =
            "The username and email were updated in both implementations.";

    } else {

        vulnerableStatus.textContent = "VULNERABLE";

        vulnerableStatus.classList.add("status-danger");

        fixedStatus.textContent = "BLOCKED";

        fixedStatus.classList.add("status-success");

        vulnerableMessage.textContent =
            "The attack changed role to admin and isAdmin to true!";

        fixedMessage.textContent =
            "The fixed application blocked both unauthorized properties.";

        finalResult.querySelector("h3").textContent =
            "Both sensitive properties were changed only in the vulnerable application!";

        finalResult.querySelector("p").textContent =
            "The allowlist protected role and isAdmin in the fixed application.";
    }
}

function resetSimulation() {

    vulnerableUser = { ...originalUser };

    fixedUser = { ...originalUser };

    document.getElementById("requestBody").textContent =
        JSON.stringify(payloads.normal, null, 2);

    document.getElementById("vulnerableStatus").textContent =
        "WAITING";

    document.getElementById("fixedStatus").textContent =
        "WAITING";

    document.getElementById("vulnerableStatus").className =
        "result-status neutral";

    document.getElementById("fixedStatus").className =
        "result-status neutral";

    document.getElementById("vulnerableMessage").textContent =
        "Waiting for a request...";

    document.getElementById("fixedMessage").textContent =
        "Waiting for a request...";

    document.getElementById("finalResult").querySelector("h3").textContent =
        "Run a request to see what happens";

    document.getElementById("finalResult").querySelector("p").textContent =
        "The vulnerable and fixed applications process the same request differently.";

    updateScreen();
}


document.querySelectorAll(".payload-button[data-payload]").forEach(button => {

    button.addEventListener("click", function () {

        runPayload(this.dataset.payload);

    });

});

document.getElementById("resetButton").addEventListener("click", resetSimulation);

function setupSwitch(switchId) {
    const switchContainer = document.getElementById(switchId);
    if (!switchContainer) return;
    const switchButtons = switchContainer.querySelectorAll(".switch-button");

    switchButtons.forEach(button => {
        const targetId = button.dataset.target;
        
        if (button.classList.contains("active")) {
            if (targetId.includes("vulnerable")) {
                button.classList.add("active-vulnerable");
                button.classList.remove("active-fixed");
            } else {
                button.classList.add("active-fixed");
                button.classList.remove("active-vulnerable");
            }
        }

        button.addEventListener("click", function () {
            switchButtons.forEach(otherButton => {
                const card = document.getElementById(otherButton.dataset.target);
                if (card) card.hidden = true;
                
                otherButton.classList.remove("active", "active-vulnerable", "active-fixed");
                otherButton.setAttribute("aria-pressed", "false");
            });

            const targetCard = document.getElementById(targetId);
            if (targetCard) targetCard.hidden = false;

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            if (targetId.includes("vulnerable")) {
    button.classList.add("active-vulnerable");
    button.classList.remove("active-fixed");
} else {
    button.classList.add("active-fixed");
    button.classList.remove("active-vulnerable");
}
        });
    });
}

setupSwitch("codeSwitch");

setupSwitch("resultSwitch");

updateScreen();

resetSimulation();