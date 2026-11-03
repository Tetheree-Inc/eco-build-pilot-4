(function () {
  "use strict";

  var STORAGE_KEY = "eco-pilot-theme";

  function readStoredTheme() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      if (value === "light" || value === "dark") {
        return value;
      }
    } catch (err) {
      /* localStorage unavailable */
    }
    return null;
  }

  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function resolveTheme() {
    return readStoredTheme() || systemTheme();
  }

  function otherTheme(theme) {
    return theme === "light" ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }

  function toggleLabelFor(theme) {
    return theme === "light"
      ? "Switch to dark theme"
      : "Switch to light theme";
  }

  function syncToggleButton(button, theme) {
    if (!button) {
      return;
    }
    var next = otherTheme(theme);
    button.setAttribute("aria-label", toggleLabelFor(theme));
    button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    button.setAttribute("data-theme-current", theme);
    button.setAttribute("data-theme-next", next);
    var visible = button.querySelector(".theme-toggle__text");
    if (visible) {
      visible.textContent = theme === "light" ? "Dark" : "Light";
    }
    var icon = button.querySelector(".theme-toggle__icon");
    if (icon) {
      icon.textContent = theme === "light" ? "☾" : "☀";
    }
  }

  function persistTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      /* ignore */
    }
  }

  function initThemeToggle() {
    var button = document.getElementById("theme-toggle");
    var theme = resolveTheme();
    applyTheme(theme);
    syncToggleButton(button, theme);

    if (!button) {
      return;
    }

    function activate() {
      var current = document.documentElement.getAttribute("data-theme");
      if (current !== "light" && current !== "dark") {
        current = resolveTheme();
      }
      var next = otherTheme(current);
      applyTheme(next);
      persistTheme(next);
      syncToggleButton(button, next);
    }

    button.addEventListener("click", activate);

    var media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", function () {
      if (readStoredTheme()) {
        return;
      }
      var updated = systemTheme();
      applyTheme(updated);
      syncToggleButton(button, updated);
    });
  }

  window.ecoPilotTheme = {
    STORAGE_KEY: STORAGE_KEY,
    resolveTheme: resolveTheme,
    applyTheme: applyTheme,
    initThemeToggle: initThemeToggle,
  };
})();
