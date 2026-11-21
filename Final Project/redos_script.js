"use strict";

const $ = (id) => document.getElementById(id);

const vulnerableBtn = $("vulnerableBtn");
const fixedBtn = $("fixedBtn");
const normalBtn = $("normalBtn");
const mediumBtn = $("mediumBtn");
const heavyBtn = $("heavyBtn");
const resetBtn = $("resetBtn");

const codeDisplay = $("codeDisplay");
const executionTime = $("executionTime");
const processingStatus = $("processingStatus");
const traceSteps = $("traceSteps");
const resultBar = $("resultBar");
const inputPreview = $("inputPreview");
const codeExplanation = $("codeExplanation");
const codeModeLabel = $("codeModeLabel");

const TIMEOUT_MS = 1500;
const KEYS = ["normal", "medium", "heavy"];

const PAYLOADS = {
  normal: {
    input: "Bank2026",
    label: "Normal Input"
  },

  medium: {
    input: "Bank2026Bank2026?",
    label: "Medium Attack"
  },

  heavy: {
    input: "Bank2026Bank2026Bank2026?",
    label: "Heavy Attack"
  }
};

const timedOut = {
  vulnerable: {},
  fixed: {}
};

const chartCanvas = $("timeChart");

const chart =
  chartCanvas && typeof Chart !== "undefined"
    ? new Chart(chartCanvas, {
        type: "line",

        data: {
          labels: ["Normal", "Medium", "Heavy"],

          datasets: [
            {
              label: "Vulnerable",
              data: [null, null, null],
              borderColor: "#ff4444",
              backgroundColor: "#ff4444",
              tension: 0.2,
              spanGaps: false,

              pointRadius: (ctx) =>
                timedOut.vulnerable[KEYS[ctx.dataIndex]]
                  ? 8
                  : 4,

              pointStyle: (ctx) =>
                timedOut.vulnerable[KEYS[ctx.dataIndex]]
                  ? "triangle"
                  : "circle"
            },
            {
              label: "Fixed",
              data: [null, null, null],
              borderColor: "#00cc55",
              backgroundColor: "#00cc55",
              tension: 0.2,
              spanGaps: false,

              pointRadius: (ctx) =>
                timedOut.fixed[KEYS[ctx.dataIndex]]
                  ? 8
                  : 4,

              pointStyle: (ctx) =>
                timedOut.fixed[KEYS[ctx.dataIndex]]
                  ? "triangle"
                  : "circle"
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          scales: {
            x: {
              ticks: {},
              grid: {}
            },

            y: {
              type: "linear",
              ticks: {},
              grid: {},
              title: {
                display: true,
                text: "Execution Time (ms)"
              }
            }
          },

          plugins: {
            legend: {
              labels: {}
            },

            tooltip: {
              callbacks: {
                label(ctx) {
                  const mode =
                    ctx.datasetIndex === 0
                      ? "vulnerable"
                      : "fixed";

                  const key = KEYS[ctx.dataIndex];

                  if (timedOut[mode][key]) {
                    return `${ctx.dataset.label}: ≥ ${TIMEOUT_MS} ms (Timed Out)`;
                  }

                  return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(6)} ms`;
                }
              }
            }
          }
        }
      })
    : null;

  function applyChartTheme(isDark) {
  if (!chart) return;

  const text = isDark ? "#e5e7eb" : "#374151";

  const grid = isDark
    ? "rgba(255,255,255,0.12)"
    : "rgba(0,0,0,0.1)";

  chart.options.scales.x.ticks.color = text;
  chart.options.scales.x.grid.color = grid;

  chart.options.scales.y.ticks.color = text;
  chart.options.scales.y.grid.color = grid;
  chart.options.scales.y.title.color = text;

  chart.options.plugins.legend.labels.color = text;

  chart.update("none");
}

function updateChart(key, mode, time, isTimeout = false) {
  if (!chart) return;

  const row = mode === "vulnerable" ? 0 : 1;
  const col = KEYS.indexOf(key);

  if (col === -1) return;

  timedOut[mode][key] = isTimeout;

  chart.data.datasets[row].data[col] =
    isTimeout
      ? TIMEOUT_MS
      : (Number.isFinite(time) && time >= 0 ? time : null);

  chart.update("none");
}

function clearChart() {
  timedOut.vulnerable = {};
  timedOut.fixed = {};

  if (!chart) return;

  chart.data.datasets.forEach((dataset) => {
    dataset.data = [null, null, null];
  });

  chart.update("none");
}

(function initTheme() {
  const themeToggle = document.getElementById("redos-themeToggle");
  const KEY    = "security-labs-theme";

  if (!themeToggle) return;

  const body = document.body;

  function setTheme(theme) {
    const isDark = theme === "dark";

    body.classList.toggle("dark-mode", isDark);

    themeToggle.setAttribute(
      "aria-pressed",
      String(isDark)
    );
    themeToggle.setAttribute(
      "aria-label",
      isDark
        ? "Switch to light mode"
        : "Switch to dark mode"
    );

    const label = themeToggle.querySelector(".theme-label");

    if (label) {
      label.textContent = isDark ? "Light" : "Dark";
    }

    try {
      localStorage.setItem("dark-theme",theme);
    } catch (error) {
    }

    applyChartTheme(isDark);
  }

  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("dark-theme");
  } catch (error) {
    savedTheme = null;
  }

  const prefersDark =
    window.matchMedia &&
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

  setTheme(
    savedTheme || (prefersDark ? "dark" : "light")
  );

  themeToggle.addEventListener("click", () => {
    const isDark =
      body.classList.contains("dark-mode");
    setTheme(isDark ? "light" : "dark");
  });
})();

let currentMode = "vulnerable";
let currentWorker = null;
let currentWorkerUrl = null;
let timer = null;
let runId = 0;

function displayCode() {
  const vulnerable = currentMode === "vulnerable";

  const regexLine = vulnerable
    ? "  const regex = /^([a-zA-Z0-9]+)+$/;"
    : "  const regex = /^[a-zA-Z0-9]+$/;";

  const lines = [
    "function validateUsername(username) {",
    "  const input = String(username);",
    "  if (input.length === 0) {",
    "    return false;",
    "  }",
    regexLine,
    "  const isValid = regex.test(input);",
    "  return isValid;",
    "}"
  ];

  codeDisplay.replaceChildren();

  lines.forEach((line, index) => {
    const row = document.createElement("span");
    row.className = "code-row";

    if (index === 5) {
      row.classList.add(vulnerable ? "code-vulnerable" : "code-fixed");
    }

    const number = document.createElement("span");
    number.className = "line-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const content = document.createElement("span");
    content.textContent = line;

    row.append(number, content);
    codeDisplay.append(row);
  });

  codeModeLabel.textContent = vulnerable
    ? "Vulnerable code"
    : "Fixed code";

  codeModeLabel.className = vulnerable
    ? "tag tag-danger"
    : "tag tag-success";

  codeExplanation.textContent = vulnerable
    ? "Line 6: Nested quantifiers (+ inside +) allow many ways to match the same characters, potentially causing catastrophic backtracking."
    : "Line 6: Removing nested repetition prevents catastrophic backtracking while preserving the same username validation rules.";
}

function addStep(message, status = "") {
  const pill = document.createElement("span");
  pill.className = `pill ${status}`;
  pill.textContent = message;
  traceSteps.append(pill);
}

function setRunning(running) {
  [
    normalBtn,
    mediumBtn,
    heavyBtn,
    vulnerableBtn,
    fixedBtn
  ].forEach((button) => {
    button.disabled = running;
  });
}

function stopWorker() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }

  if (currentWorker !== null) {
    currentWorker.terminate();
    currentWorker = null;
  }

  if (currentWorkerUrl !== null) {
    URL.revokeObjectURL(currentWorkerUrl);
    currentWorkerUrl = null;
  }
}

function resetResults() {
  runId++;

  stopWorker();
  setRunning(false);

  executionTime.textContent = "— ms";
  processingStatus.textContent = "Ready";

  inputPreview.textContent = "Choose a payload above";

  traceSteps.replaceChildren();
  addStep("Waiting for input...");

  resultBar.className = "result-bar";
  resultBar.textContent = "Run a test to see the result.";
}

function changeMode(mode) {
  currentMode = mode;

  vulnerableBtn.classList.toggle("active-vulnerable",mode === "vulnerable");

  fixedBtn.classList.toggle("active-fixed",mode === "fixed");

  vulnerableBtn.setAttribute("aria-pressed",String(mode === "vulnerable"));

  fixedBtn.setAttribute("aria-pressed",String(mode === "fixed"));

  resetResults();
  displayCode();
}

function createWorker() {
  const source = `
    self.onmessage = function (event) {
      const { input, mode } = event.data;

      const regex = mode === "vulnerable"
        ? /^([a-zA-Z0-9]+)+$/
        : /^[a-zA-Z0-9]+$/;

      const start = performance.now();

      const valid = input.length > 0 && regex.test(input);

      const elapsed = performance.now() - start;

      self.postMessage({
        valid,
        elapsed
      });
    };
  `;

  const blob = new Blob([source],{ type: "text/javascript" });

  const url = URL.createObjectURL(blob);

  try {
    const worker = new Worker(url);
    currentWorkerUrl = url;
    return worker;
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function runTest(key) {
  resetResults();

  const thisRun = runId;
  const mode = currentMode;
  const payload = PAYLOADS[key];

  inputPreview.textContent = payload.input;

  setRunning(true);
  processingStatus.textContent = "Running";

  traceSteps.replaceChildren();

  addStep(`${payload.label} selected`, "ok");
  addStep("Validation started", "wait");

  if (key !== "normal") {
    addStep("Invalid ? suffix detected in input", "wait");
  }

  resultBar.className = "result-bar";
  resultBar.textContent = "Processing input...";

  let worker;

  try {
    worker = createWorker();
  } catch (error) {
    setRunning(false);

    processingStatus.textContent = "Error";

    addStep("Worker could not start", "bad");

    resultBar.className = "result-bar danger";
    resultBar.textContent =
      "Worker unavailable. Open the lab using a local development server.";

    return;
  }

  currentWorker = worker;

  timer = setTimeout(() => {
    if (thisRun !== runId) return;

    stopWorker();
    setRunning(false);

    executionTime.textContent = `≥ ${TIMEOUT_MS} ms`;
    processingStatus.textContent = "Timed Out";

    updateChart(key, mode, TIMEOUT_MS, true);

    addStep("Safety limit reached", "bad");

    resultBar.className = "result-bar danger";

    resultBar.textContent = mode === "vulnerable"
      ? "ReDoS effect: the vulnerable validator did not finish before the safety limit."
      : "Validation did not finish before the safety limit.";

  }, TIMEOUT_MS);

  worker.onmessage = ({ data }) => {
    if (thisRun !== runId) return;

    stopWorker();
    setRunning(false);

    const formattedTime = data.elapsed.toFixed(6);

    executionTime.textContent = `${formattedTime} ms`;

    processingStatus.textContent = "Completed";

    updateChart(key, mode, data.elapsed, false);

    addStep("Regex finished", "ok");

    addStep(
      data.valid ? "Username accepted" : "Username rejected",
      data.valid ? "ok" : "bad"
    );

    if (data.valid) {
      resultBar.className = "result-bar success";
      resultBar.textContent = "Valid username accepted.";
    } else if (mode === "fixed" && key !== "normal") {
      resultBar.className = "result-bar success";
      resultBar.textContent = `Attack input rejected efficiently in ${formattedTime} ms.`;
    } else {
      resultBar.className = "result-bar danger";
      resultBar.textContent = `Invalid username rejected after ${formattedTime} ms. Compare with Fixed mode.`;
    }
  };

  worker.onerror = () => {
    if (thisRun !== runId) return;

    stopWorker();
    setRunning(false);

    processingStatus.textContent = "Error";

    if (chart) {
      const row =
        mode === "vulnerable" ? 0 : 1;

      const col = KEYS.indexOf(key);

      if (col !== -1) {
        chart.data.datasets[row].data[col] = null;
        timedOut[mode][key] = false;
        chart.update("none");
      }
    }

    addStep("Worker error", "bad");

    resultBar.className = "result-bar danger";
    resultBar.textContent = "The test failed. Check your browser console.";
  };

  worker.postMessage({
    input: payload.input,
    mode
  });
}

vulnerableBtn.addEventListener("click",
  () => changeMode("vulnerable")
);

fixedBtn.addEventListener("click",
  () => changeMode("fixed")
);

normalBtn.addEventListener("click",
  () => runTest("normal")
);

mediumBtn.addEventListener("click",
  () => runTest("medium")
);

heavyBtn.addEventListener("click",
  () => runTest("heavy")
);

resetBtn.addEventListener("click", () => {
  resetResults();
  clearChart();
});
changeMode("vulnerable");
