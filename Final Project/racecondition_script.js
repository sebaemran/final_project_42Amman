const vulnerableCode = [
    "function runVulnerable(numberOfRequests) {",
    "const requests = [];",
    "for (let i = 0; i < numberOfRequests; i++) {",
    "    requests.push({",
    "        name: `Request ${String.fromCharCode(65 + i)}`,",
    "        readBalance: balance,",
    "        approved: balance >= 100",
    "   });",
    "}",
    "requests.forEach(request => {",
    "    if (request.approved) {",
    "        cashPaid += 100;",
    "        balance = 0;",
    "        addRequest(request.name, [",
    "            { text: read balance  request.readBalance, type: ok }",
    "            { text: check ok type: ok }",
    "            { text: paid $100 type: ok }",
    "        ]);",
    "    } else {",
    "        addRequest(request.name, [",
    "           { text: read balance request.readBalance type: ok}",
    "           { text: insufficient balance type: fail}",
    "       ]);",
    "   }",
    "});"
];

const fixedCode = [
"    function runFixed(numberOfRequests) {",
"    for (let i = 0; i < numberOfRequests; i++) {",
"        const name = `Request ${String.fromCharCode(65 + i)}`;",
"        const currentBalance = balance;",
"        if (currentBalance >= 100) {",
"            balance -= 100;",
"            cashPaid += 100;",
"            addRequest(name, [",
"                { text: read balance currentBalance, type: ok },",
"                { text: check ok, type: ok },",
"                { text: paid $100, type: ok }",
"            ]);",
"        } else {",
"            addRequest(name, [",
"                { text: read balance currentBalance, type: wait },",
"                { text: check failed , type: fail },",
"                { text: rejected , type: fail },",
"            ]);",
"        }",
"    }",
"    updateStats();",
"    showResult(",
    "    `Protected: only $${cashPaid} was paid out. The account balance cannot go below $0.`,",
        "success",
"    );",
"}"
];

let mode = "vulnerable";

let balance = 100;
let cashPaid = 0;

const balanceElement = document.getElementById("balance");
const cashElement = document.getElementById("cashPaid");
const codeViewer = document.getElementById("codeViewer");
const requestLog = document.getElementById("requestLog");
const resultMessage = document.getElementById("resultMessage");

function updateCode() {

    const lines = mode === "vulnerable"
        ? vulnerableCode
        : fixedCode;

    codeViewer.innerHTML = "";

    lines.forEach((line, index) => {

        const span = document.createElement("span");

        span.className = "code-line";

        if (mode === "vulnerable" && index === 2) {
            span.classList.add("vulnerable");
        }

        if (mode === "fixed" && index === 4) {
            span.classList.add("fixed");
        }

        span.textContent = line;

        codeViewer.appendChild(span);

    });
    const codeModeLabel = document.getElementById("codeModeLabel");
    if (mode === "vulnerable") {
        codeModeLabel.textContent = "Vulnerable code";
        codeModeLabel.className = "tag tag-danger";
    } else {
        codeModeLabel.textContent = "Fixed code";
        codeModeLabel.className = "tag tag-success";
    }

    document.getElementById("vulnerableTab")
        .classList.toggle("active", mode === "vulnerable");

    document.getElementById("fixedTab")
        .classList.toggle("active", mode === "fixed");

}

function updateStats() {

    balanceElement.textContent =
        "$" + balance;

    cashElement.textContent =
        "$" + cashPaid;

}

function addRequest(name, steps) {

    const card = document.createElement("div");

    card.className = "request-card";

    const title = document.createElement("div");

    title.className = "request-title";
    title.textContent = name;

    const stepContainer = document.createElement("div");

    stepContainer.className = "request-steps";

    steps.forEach(step => {

        const item = document.createElement("span");

        item.className = step.type;
        item.textContent = step.text;

        stepContainer.appendChild(item);

    });

    card.appendChild(title);
    card.appendChild(stepContainer);

    requestLog.appendChild(card);

}

function showResult(message, type) {

    resultMessage.textContent = message;
    resultMessage.className = "result " + type;

}

function resetValues() {

    balance = 100;
    cashPaid = 0;

    updateStats();

    requestLog.innerHTML = "";

    showResult("Running a new test...", "");

}

function runVulnerable(numberOfRequests) {
    const requests = [];

    for (let i = 0; i < numberOfRequests; i++) {

        requests.push({
            name: `Request ${String.fromCharCode(65 + i)}`,
            readBalance: balance,
            approved: balance >= 100
        });

    }
    requests.forEach(request => {

        if (request.approved) {

            cashPaid += 100;

            balance = 0;

            addRequest(request.name, [
                { text: "read balance " + request.readBalance, type: "ok" },
                { text: "check ok", type: "ok" },
                { text: "paid $100", type: "ok" }
            ]);

        } else {

            addRequest(request.name, [
                { text: "read balance " + request.readBalance, type: "ok" },
                { text: "insufficient balance", type: "fail" }
            ]);

        }

    });

    updateStats();

    if (cashPaid > 100) {

        showResult(
            `Exploit worked: $${cashPaid} paid out from a $100 account.`,
            "danger"
        );

    } else {

        showResult(
            "Withdrawal completed. No double withdrawal occurred.",
            ""
        );

    }

}

function runFixed(numberOfRequests) {

    for (let i = 0; i < numberOfRequests; i++) {

        const name = `Request ${String.fromCharCode(65 + i)}`;

        const currentBalance = balance;

        if (currentBalance >= 100) {

            balance -= 100;

            cashPaid += 100;

            addRequest(name, [
                { text: "read balance " + currentBalance, type: "ok" },
                { text: "check ok", type: "ok" },
                { text: "paid $100", type: "ok" }
            ]);

        } else {

            addRequest(name, [
                { text: "read balance " + currentBalance, type: "wait" },
                { text: "check failed", type: "fail" },
                { text: "rejected", type: "fail" }
            ]);

        }

    }

    updateStats();

    showResult(
        `Protected: only $${cashPaid} was paid out. The account balance cannot go below $0.`,
        "success"
    );

}

function runTest(numberOfRequests) {

    resetValues();

    if (mode === "vulnerable") {
        runVulnerable(numberOfRequests);
    } else {
        runFixed(numberOfRequests);
    }

}

document.getElementById("doubleBtn")
    .addEventListener("click", () => runTest(2));

document.getElementById("singleBtn")
    .addEventListener("click", () => runTest(1));

document.getElementById("vulnerableTab")
    .addEventListener("click", () => {

        mode = "vulnerable";

        resetValues();
        updateCode();

    });

document.getElementById("fixedTab")
    .addEventListener("click", () => {

        mode = "fixed";

        resetValues();
        updateCode();

    });

document.getElementById("resetBtn")
    .addEventListener("click", () => {

        resetValues();

    });

updateCode();
updateStats();

const themeToggle = document.getElementById("race-themeToggle");
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
  if (label) label.textContent = isDark ? "Light" : "Dark";

  localStorage.setItem("dark-theme", theme);
}

const savedTheme = localStorage.getItem("dark-theme");
const prefersDark = window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

setTheme(savedTheme || (prefersDark ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const isDark = body.classList.contains("dark-mode");
  setTheme(isDark ? "light" : "dark");
});