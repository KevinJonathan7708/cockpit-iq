(function () {
  var themeButton = document.getElementById("themeBtn");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeButton) return;

  function readTheme() {
    try {
      return localStorage.getItem("cockpitTheme") === "light" ? "light" : "dark";
    } catch (error) {
      return document.documentElement.dataset.theme === "light" ? "light" : "dark";
    }
  }

  function applyTheme(theme, persist) {
    var selectedTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = selectedTheme;
    themeButton.textContent = selectedTheme === "dark" ? "Light mode" : "Dark mode";
    themeButton.setAttribute("aria-label", "Switch to " + (selectedTheme === "dark" ? "light" : "dark") + " theme");
    if (themeMeta) {
      themeMeta.content = selectedTheme === "dark" ? "#161513" : "#f2efe8";
    }
    if (persist) {
      try {
        localStorage.setItem("cockpitTheme", selectedTheme);
      } catch (error) {
        // The theme still works for this page when browser storage is unavailable.
      }
    }
  }

  applyTheme(readTheme(), false);
  themeButton.addEventListener("click", function () {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
  });
})();
