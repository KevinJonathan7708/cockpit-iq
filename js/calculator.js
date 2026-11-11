var calcBox = document.getElementById("calculator");

var glideDefaults = { altitude: "3000", ratio: "9", speed: "65" };
var altDefaults = { elevation: "1000", qnh: "1013", temp: "30" };

var tabRow = document.createElement("div");
tabRow.className = "calc-tabs";
tabRow.setAttribute("role", "group");
tabRow.setAttribute("aria-label", "Flight calculator type");

var glideTab = document.createElement("button");
glideTab.type = "button";
glideTab.className = "toggle-button";
glideTab.textContent = "Glide";

var altTab = document.createElement("button");
altTab.type = "button";
altTab.className = "toggle-button";
altTab.textContent = "Density altitude";

tabRow.appendChild(glideTab);
tabRow.appendChild(altTab);

var glidePanel = document.createElement("div");
glidePanel.setAttribute("role", "group");
glidePanel.setAttribute("aria-label", "Glide calculator");
var altPanel = document.createElement("div");
altPanel.setAttribute("role", "group");
altPanel.setAttribute("aria-label", "Density altitude calculator");

calcBox.appendChild(tabRow);
calcBox.appendChild(glidePanel);
calcBox.appendChild(altPanel);

function makeField(panel, id, labelText, value, errorId) {
  var box = document.createElement("div");
  box.className = "field";

  var label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = labelText;

  var input = document.createElement("input");
  input.id = id;
  input.type = "text";
  input.inputMode = "decimal";
  input.value = value;
  input.setAttribute("aria-describedby", errorId);
  input.setAttribute("aria-invalid", "false");

  box.appendChild(label);
  box.appendChild(input);
  panel.appendChild(box);
  return input;
}

function makeButton(panel, text, className) {
  var button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  panel.appendChild(button);
  return button;
}

function makeMessage(panel, className, id) {
  var box = document.createElement("p");
  box.className = className;
  box.id = id;
  box.setAttribute("aria-live", "polite");
  box.setAttribute("role", "status");
  panel.appendChild(box);
  return box;
}

var glideAlt = makeField(glidePanel, "glideAlt", "Height above ground (ft)", glideDefaults.altitude, "glideError");
var glideRatio = makeField(glidePanel, "glideRatio", "Glide ratio (distance : height)", glideDefaults.ratio, "glideError");
var glideSpeed = makeField(glidePanel, "glideSpeed", "Glide speed (knots)", glideDefaults.speed, "glideError");
var glideError = makeMessage(glidePanel, "error-msg", "glideError");
var glideRun = makeButton(glidePanel, "Calculate", "submit-button");
var glideReset = makeButton(glidePanel, "Reset", "toggle-button");
var glideResult = makeMessage(glidePanel, "calc-result", "glideResult");
var glideNote = document.createElement("small");
glideNote.textContent = "Still air, engine out. Ratio 9 is an example. Use the POH/AFM value for the real aircraft.";
glidePanel.appendChild(glideNote);

var altElevation = makeField(altPanel, "altElevation", "Airfield elevation (ft)", altDefaults.elevation, "altError");
var altQnh = makeField(altPanel, "altQnh", "Pressure setting QNH (hPa)", altDefaults.qnh, "altError");
var altTemp = makeField(altPanel, "altTemp", "Outside air temperature (°C)", altDefaults.temp, "altError");
var altError = makeMessage(altPanel, "error-msg", "altError");
var altRun = makeButton(altPanel, "Calculate", "submit-button");
var altReset = makeButton(altPanel, "Reset", "toggle-button");
var altResult = makeMessage(altPanel, "calc-result", "altResult");
var altNote = document.createElement("small");
altNote.textContent = "Rule-of-thumb estimate. Use the aircraft performance charts for the real aircraft.";
altPanel.appendChild(altNote);

function showTool(tool) {
  glidePanel.hidden = tool != "glide";
  altPanel.hidden = tool != "alt";
  glideTab.setAttribute("aria-pressed", tool == "glide" ? "true" : "false");
  altTab.setAttribute("aria-pressed", tool == "alt" ? "true" : "false");
}

function isNumber(input) {
  return input.value.trim() != "" && !isNaN(Number(input.value));
}

function clearInvalid(inputs) {
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].setAttribute("aria-invalid", "false");
  }
}

function runGlide() {
  glideResult.textContent = "";
  glideError.textContent = "";
  clearInvalid([glideAlt, glideRatio, glideSpeed]);

  if (!isNumber(glideAlt) || Number(glideAlt.value) <= 0 || Number(glideAlt.value) > 50000) {
    glideAlt.setAttribute("aria-invalid", "true");
    glideError.textContent = "Enter a height between 1 and 50000 ft.";
    return;
  }
  if (!isNumber(glideRatio) || Number(glideRatio.value) <= 0 || Number(glideRatio.value) > 40) {
    glideRatio.setAttribute("aria-invalid", "true");
    glideError.textContent = "Enter a glide ratio between 1 and 40.";
    return;
  }
  if (!isNumber(glideSpeed) || Number(glideSpeed.value) <= 0 || Number(glideSpeed.value) > 300) {
    glideSpeed.setAttribute("aria-invalid", "true");
    glideError.textContent = "Enter a glide speed between 1 and 300 knots.";
    return;
  }

  var distance = Number(glideAlt.value) * Number(glideRatio.value) / 6076;
  var minutes = distance / Number(glideSpeed.value) * 60;

  glideResult.textContent = "Glide distance: " + distance.toFixed(1) + " nm. Time aloft: " + minutes.toFixed(1) + " min.";
}

function runAltitude() {
  altResult.textContent = "";
  altError.textContent = "";
  clearInvalid([altElevation, altQnh, altTemp]);

  if (!isNumber(altElevation) || Number(altElevation.value) < -1000 || Number(altElevation.value) > 20000) {
    altElevation.setAttribute("aria-invalid", "true");
    altError.textContent = "Enter an elevation between -1000 and 20000 ft.";
    return;
  }
  if (!isNumber(altQnh) || Number(altQnh.value) < 900 || Number(altQnh.value) > 1100) {
    altQnh.setAttribute("aria-invalid", "true");
    altError.textContent = "Enter a QNH between 900 and 1100 hPa.";
    return;
  }
  if (!isNumber(altTemp) || Number(altTemp.value) < -60 || Number(altTemp.value) > 60) {
    altTemp.setAttribute("aria-invalid", "true");
    altError.textContent = "Enter a temperature between -60 and 60 °C.";
    return;
  }

  var pressureAlt = Number(altElevation.value) + (1013 - Number(altQnh.value)) * 30;
  var isaTemp = 15 - 2 * pressureAlt / 1000;
  var densityAlt = pressureAlt + 120 * (Number(altTemp.value) - isaTemp);

  altResult.textContent = "Pressure altitude: " + Math.round(pressureAlt) + " ft. Density altitude: " + Math.round(densityAlt) + " ft.";
}

function resetGlide() {
  glideAlt.value = glideDefaults.altitude;
  glideRatio.value = glideDefaults.ratio;
  glideSpeed.value = glideDefaults.speed;
  glideError.textContent = "";
  glideResult.textContent = "";
  clearInvalid([glideAlt, glideRatio, glideSpeed]);
}

function resetAltitude() {
  altElevation.value = altDefaults.elevation;
  altQnh.value = altDefaults.qnh;
  altTemp.value = altDefaults.temp;
  altError.textContent = "";
  altResult.textContent = "";
  clearInvalid([altElevation, altQnh, altTemp]);
}

function runOnEnter(event) {
  if (event.key == "Enter") {
    if (!glidePanel.hidden) {
      runGlide();
    }
    else {
      runAltitude();
    }
  }
}

var allInputs = [glideAlt, glideRatio, glideSpeed, altElevation, altQnh, altTemp];
for (var i = 0; i < allInputs.length; i++) {
  allInputs[i].addEventListener("keydown", runOnEnter);
}

glideTab.addEventListener("click", function () {
  showTool("glide");
});
altTab.addEventListener("click", function () {
  showTool("alt");
});
glideRun.addEventListener("click", runGlide);
altRun.addEventListener("click", runAltitude);
glideReset.addEventListener("click", resetGlide);
altReset.addEventListener("click", resetAltitude);

showTool("glide");
