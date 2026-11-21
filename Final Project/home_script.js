(function initTheme() {
    const themeToggle = document.getElementById("home-themeToggle");

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
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );

        const label = themeToggle.querySelector(".theme-label");

        if (label) {
            label.textContent = isDark ? "Light" : "Dark";
        }

        try {
            localStorage.setItem("dark-theme", theme);
        } catch (error) {
        }
    }

    let savedTheme = null;

    try {
        savedTheme = localStorage.getItem("dark-theme");
    } catch (error) {
        savedTheme = null;
    }

    const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    setTheme(savedTheme || (prefersDark ? "dark" : "light"));

    themeToggle.addEventListener("click", () => {
        const isDark = body.classList.contains("dark-mode");
        setTheme(isDark ? "light" : "dark");
    });
})();