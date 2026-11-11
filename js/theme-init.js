(function () {
  try {
    var savedTheme = localStorage.getItem("cockpitTheme");
    if (savedTheme === "light" || savedTheme === "dark") document.documentElement.dataset.theme = savedTheme;
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = savedTheme === "light" ? "#f2efe8" : "#161513";
  } catch (error) {
    // CSS uses the dark palette by default when storage is unavailable.
  }
})();
