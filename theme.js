const themeBtn = document.getElementById("themeBtn");

function applyTheme(day) {
  document.body.classList.toggle("day-mode", day);
  themeBtn.textContent = day ? "Dark mode" : "Light mode";
  localStorage.setItem("cockpitTheme", day ? "day" : "night");
}

applyTheme(localStorage.getItem("cockpitTheme") === "day");

themeBtn.addEventListener("click", () => {
  applyTheme(!document.body.classList.contains("day-mode"));
});
