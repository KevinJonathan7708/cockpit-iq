function $(id) {
  return document.getElementById(id);
}
const appProfileLabel = $("appProfileLabel");
const profileVerificationNote = $("profileVerificationNote");
const takeoffBtn = $("takeoffBtn");
const landingBtn = $("landingBtn");
const labelsBtn = $("labelsBtn");
const checklist = $("checklist");
const title = $("procedureTitle");
const label = $("procedureLabel");
const progressText = $("progressText");
const nextBtn = $("nextBtn");
const resetBtn = $("resetBtn");
const boardToggle = $("boardToggle");
const kneeboard = document.querySelector(".kneeboard");
const cockpitImage = document.querySelector(".cockpit-img");
const cockpitFrame = document.querySelector(".cockpit-frame");
const topBar = document.querySelector(".topbar");
const procedureTargets = $("procedureTargets");
const testPanel = $("testPanel");
const testTitle = $("testTitle");
const testProgress = $("testProgress");
const testProgressBar = $("testProgressBar");
const testMistakesText = $("testMistakes");
const testMessage = $("testMessage");
const testRestart = $("testRestart");
const testResultDialog = $("testResultDialog");
const testResultLabel = $("testResultLabel");
const testResultTitle = $("testResultTitle");
const testResultDescription = $("testResultDescription");
const testResultScore = $("testResultScore");
const testSaveStatus = $("testSaveStatus");
const testResultIconPath = $("testResultIconPath");
const testResultRestart = $("testResultRestart");
const infoBox = $("infoBox");
const infoTitle = $("infoTitle");
const infoText = $("infoText");
const controlPanel = $("controlPanel");
const controlTitle = $("controlTitle");
const controlDescription = $("controlDescription");
const controlClose = $("controlClose");
const infoControls = $("infoControls");
const paperStamp = $("paperStamp");
const simReadout = {
  phase: $("simPhase"), airspeed: $("simAirspeed"), flaps: $("simFlaps"),
  power: $("simPower"), brake: $("simBrake"), trim: $("simTrim"),
  mixture: $("simMixture"), lights: $("simLights"), strobe: $("simStrobe"),
  xpdr: $("simXpdr"),
};

function fitCockpit() {
  if (!cockpitImage || !cockpitFrame || !topBar || !cockpitImage.naturalWidth) return;

  const availableHeight = Math.max(120, window.innerHeight - topBar.offsetHeight);
  const scale = Math.min(window.innerWidth / cockpitImage.naturalWidth, availableHeight / cockpitImage.naturalHeight);
  const width = Math.floor(cockpitImage.naturalWidth * scale);
  const height = Math.floor(cockpitImage.naturalHeight * scale);

  cockpitFrame.style.width = `${width}px`;
  cockpitFrame.style.height = `${height}px`;
  cockpitImage.style.width = `${width}px`;
  cockpitImage.style.height = `${height}px`;

  const buttons = document.querySelectorAll(".hotspot");
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const x = Number(button.dataset.x) * width / cockpitImage.naturalWidth;
    const y = Number(button.dataset.y) * height / cockpitImage.naturalHeight;
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.style.marginLeft = `${-button.offsetWidth / 2}px`;
    button.style.marginTop = `${-button.offsetHeight}px`;
  }
}

const supportedRequirements = [
  "brake", "flaps_takeoff", "flaps_landing", "flaps_up", "trim_takeoff",
  "trim_climb", "engine_setup", "lights_xpdr", "throttle_full",
  "throttle_reduce", "idle", "verify_takeoff", "centreline", "rotate",
  "climb_speed", "safe_flap_speed", "climb", "pattern", "vapp",
  "touchdown", "rollout", "clear",
];

const testActionsByRequirement = {
  brake: ["parking-brake"],
  flaps_takeoff: ["flaps"],
  flaps_landing: ["flaps"],
  flaps_up: ["flaps"],
  trim_takeoff: ["trim"],
  trim_climb: ["trim"],
  engine_setup: ["mixture"],
  lights_xpdr: ["lights", "strobes", "xpdr-code", "xpdr-mode"],
  throttle_full: ["throttle"],
  throttle_reduce: ["throttle"],
  idle: ["throttle"],
  verify_takeoff: ["engine"],
  centreline: ["pedals"],
  rotate: ["speed", "yoke"],
  climb_speed: ["speed", "speed-confirm"],
  safe_flap_speed: ["speed", "speed-confirm"],
  climb: ["yoke"],
  pattern: ["nav"],
  vapp: ["speed", "speed-confirm", "flaps"],
  touchdown: ["yoke"],
  rollout: ["pedals"],
  clear: ["pedals"],
};

const procedures = window.CockpitProfiles;
const query = new URLSearchParams(window.location.search);
const requestedProcedure = query.get("procedure");
let current = "explore";
if (requestedProcedure === "takeoff" || requestedProcedure === "landing" || requestedProcedure === "explore") {
  current = requestedProcedure;
}
const testMode = query.get("mode") === "test" && (current === "takeoff" || current === "landing");
let testMistakeCount = 0;
let testState = "active";
let testStartedAt = Date.now();
let infoTimer = null;
let infoHideTimer = null;
let lastHotspot = null;

const Sim = {
  airspeed: 0,
  flaps: 0,
  throttle: 20,
  brakeReleased: false,
  trim: "dn",
  mixtureRich: false,
  landingLights: false,
  strobeOn: false,
  xpdrAlt: false,
  xpdrCode: "",
  centrelineHeld: false,
  rotated: false,
  verified: false,
  safeFlapSpeed: false,
  climbSpeed: false,
  climbEstablished: false,
  patternJoined: false,
  stabilized: false,
  flared: false,
  brakesApplied: false,
  vacated: false,
};

function resetSim(type) {
  const landing = type === "landing";
  Sim.airspeed = landing ? 70 : 0;
  Sim.flaps = 0;
  Sim.throttle = landing ? 40 : 20;
  Sim.brakeReleased = landing;
  Sim.trim = landing ? "to" : "dn";
  Sim.mixtureRich = landing;
  Sim.landingLights = landing;
  Sim.strobeOn = landing;
  Sim.xpdrAlt = landing;
  Sim.xpdrCode = "";
  Sim.centrelineHeld = false;
  Sim.rotated = false;
  Sim.verified = false;
  Sim.safeFlapSpeed = false;
  Sim.climbSpeed = false;
  Sim.climbEstablished = false;
  Sim.patternJoined = false;
  Sim.stabilized = false;
  Sim.flared = false;
  Sim.brakesApplied = false;
  Sim.vacated = false;
}

function getRows() {
  const rows = [];
  if (!checklist) return rows;
  for (let i = 0; i < checklist.children.length; i++) {
    rows.push(checklist.children[i]);
  }
  return rows;
}

function currentRow() {
  const rows = getRows();
  for (let i = 0; i < rows.length; i++) {
    if (!rows[i].querySelector("input").checked) return rows[i];
  }
  return null;
}

function getCurrentRequirement() {
  const row = currentRow();
  if (!row) return undefined;
  return row.dataset.requires;
}

function isValidSquawk(value) {
  return /^[0-7]{4}$/.test(value);
}

function profileTargets() {
  if (!procedures || !procedures.profile) return null;
  return procedures.profile.targets;
}

function profileSettings() {
  if (!procedures || !procedures.profile) return null;
  return procedures.profile.settings;
}

function isSatisfied(requirement) {
  const targets = profileTargets();
  const settings = profileSettings();
  if (!targets || !settings) return false;

  switch (requirement) {
    case "brake": return Sim.brakeReleased;
    case "flaps_takeoff": return Sim.flaps === settings.takeoffFlaps;
    case "flaps_landing": return Sim.flaps === settings.landingFlaps;
    case "flaps_up": return Sim.flaps === 0;
    case "trim_takeoff": return Sim.trim === "to";
    case "trim_climb": return Sim.trim === "clb";
    case "engine_setup": return Sim.mixtureRich;
    case "lights_xpdr": return Sim.landingLights && Sim.strobeOn && Sim.xpdrAlt && isValidSquawk(Sim.xpdrCode);
    case "throttle_full": return Sim.throttle >= 95;
    case "throttle_reduce": return Sim.throttle <= 30;
    case "idle": return Sim.throttle <= 5;
    case "verify_takeoff": return Sim.verified && Sim.throttle >= 95;
    case "centreline": return Sim.centrelineHeld;
    case "rotate": return Sim.rotated;
    case "climb_speed": return Sim.climbSpeed && Sim.airspeed >= targets.climbMin && Sim.airspeed <= targets.climbMax;
    case "safe_flap_speed": return Sim.safeFlapSpeed && Sim.airspeed === targets.safeFlapTarget;
    case "climb": return Sim.climbEstablished;
    case "pattern": return Sim.patternJoined;
    case "vapp": return Sim.stabilized && Sim.airspeed >= targets.approachMin && Sim.airspeed <= targets.approachMax && Sim.flaps === settings.landingFlaps;
    case "touchdown": return Sim.flared;
    case "rollout": return Sim.brakesApplied;
    case "clear": return Sim.vacated;
    default: return false;
  }
}

function recordTestAttempt(action, correct, requirement) {
  if (!requirement) {
    const row = currentRow();
    if (row) requirement = row.dataset.requires;
  }
  if (!testMode || testState !== "active" || !requirement) return;
  const correctActions = testActionsByRequirement[requirement];
  if (correctActions && correctActions.indexOf(action) !== -1 && correct) return;

  testMistakeCount += 1;
  updateTestScore();
  if (testMistakeCount >= 3) {
    finishTest("failed");
  } else if (testMessage) {
    testMessage.textContent = `Incorrect action recorded. ${3 - testMistakeCount} ${3 - testMistakeCount === 1 ? "strike" : "strikes"} remaining.`;
  }
}

function updateTestScore() {
  if (!testMode) return;
  const rows = getRows();
  let done = 0;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].querySelector("input").checked) done++;
  }
  if (testProgress) testProgress.textContent = `${done} / ${rows.length}`;
  let trackWidth = 0;
  if (testProgressBar && testProgressBar.parentElement) {
    trackWidth = testProgressBar.parentElement.clientWidth;
  }
  const barWidth = rows.length ? trackWidth * done / rows.length : 0;
  if (testProgressBar) testProgressBar.style.width = `${barWidth}px`;
  if (testMistakesText) testMistakesText.textContent = `${testMistakeCount} / 3`;
}

function finishTest(state) {
  if (!testMode || testState !== "active") return;
  testState = state;
  if (testPanel) {
    testPanel.classList.toggle("is-complete", state === "complete");
    testPanel.classList.toggle("is-failed", state === "failed");
  }
  if (testMessage) {
    if (state === "failed") testMessage.textContent = "You're out — three mistakes. Restart the test to try again.";
    else if (testMistakeCount === 0) testMessage.textContent = "Awesome job — you finished with zero mistakes.";
    else testMessage.textContent = `Procedure complete with ${testMistakeCount} ${testMistakeCount === 1 ? "mistake" : "mistakes"}. Restart to improve your score.`;
  }
  if (testResultDialog) testResultDialog.classList.toggle("is-failed", state === "failed");
  if (testResultIconPath) {
    const iconPath = state === "failed" ? "M16 16l16 16M32 16 16 32" : "M13 24l7 7 15-16";
    testResultIconPath.setAttribute("d", iconPath);
  }
  if (testResultScore) testResultScore.textContent = `${testMistakeCount} / 3`;
  if (state === "failed") {
    if (testResultLabel) testResultLabel.textContent = "TEST FAILED";
    if (testResultTitle) testResultTitle.textContent = "You're out";
    if (testResultDescription) testResultDescription.textContent = "You reached the limit of three mistakes. Restart the test when you're ready.";
  } else {
    if (testResultLabel) testResultLabel.textContent = "TEST COMPLETE";
    if (testResultTitle) testResultTitle.textContent = testMistakeCount === 0 ? "Awesome job!" : "Procedure complete";
    if (testResultDescription) {
      testResultDescription.textContent = testMistakeCount === 0
        ? "Flawless run. You completed the procedure without a mistake."
        : `You completed the procedure with ${testMistakeCount} ${testMistakeCount === 1 ? "mistake" : "mistakes"}. Try again to improve your score.`;
    }
  }
  saveTestResult(state);
  closeControlPanel();
  if (testResultDialog && typeof testResultDialog.showModal === "function" && !testResultDialog.open) {
    testResultDialog.showModal();
    if (testResultRestart) testResultRestart.focus();
  }
}

function saveTestResult(state) {
  if (!testMode || !testSaveStatus) return;
  const rows = getRows();
  let correctSteps = 0;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].querySelector("input").checked) correctSteps++;
  }
  const auth = window.CockpitAuth;
  if (!auth || !auth.configured) {
    testSaveStatus.textContent = "Result shown for this session only. Connect Supabase to save test history.";
    return;
  }

  testSaveStatus.textContent = "Saving this test result…";
  auth.saveTestAttempt({
    procedure: current,
    outcome: state === "complete" ? "completed" : "failed",
    correctSteps: correctSteps,
    totalSteps: rows.length,
    mistakes: testMistakeCount,
    durationSeconds: Math.max(0, Math.floor((Date.now() - testStartedAt) / 1000)),
  }).then((result) => {
    if (!result.saved) {
      testSaveStatus.textContent = "Result shown for this session only. Sign in to save it to your history.";
      return;
    }
    testSaveStatus.textContent = "Result saved to your account history.";
    window.dispatchEvent(new Event("cockpitiq:attempt-saved"));
  }).catch(() => {
    testSaveStatus.textContent = "Could not save this result. It remains visible for this session only.";
  });
}

function phaseForRequirement(requirement) {
  const phases = current === "takeoff"
    ? {
        brake: "Preflight", flaps_takeoff: "Preflight", trim_takeoff: "Preflight",
        engine_setup: "Preflight", lights_xpdr: "Preflight", throttle_full: "Takeoff roll",
        verify_takeoff: "Takeoff roll", centreline: "Takeoff roll", rotate: "Climb-out",
        climb_speed: "Climb-out", safe_flap_speed: "Climb-out", flaps_up: "Climb-out",
        trim_climb: "Climb-out", climb: "Climb-out",
      }
    : {
        pattern: "Approach", throttle_reduce: "Approach", flaps_landing: "Approach",
        vapp: "Approach", idle: "Landing", touchdown: "Landing",
        rollout: "Runway exit", clear: "Runway exit",
      };
  return phases[requirement] || "In progress";
}

function renderSimulatorReadout() {
  if (!simReadout.phase) return;
  const rows = getRows();
  const currentStep = currentRow();
  let requirement;
  if (currentStep) requirement = currentStep.dataset.requires;
  simReadout.phase.textContent = current === "explore"
    ? "Explore"
    : currentStep ? phaseForRequirement(requirement) : "Complete";

  const setValue = (key, value, ready = false) => {
    simReadout[key].textContent = value;
    simReadout[key].classList.toggle("is-set", ready);
  };

  const trimLabel = Sim.trim === "to" ? "Takeoff" : Sim.trim === "clb" ? "Climb" : "Down";
  const climbTrimNeeded = requirement === "trim_climb" || requirement === "climb" || (!currentStep && current === "takeoff" && rows.length > 0);
  const trimExpected = current === "landing" ? "to" : climbTrimNeeded ? "clb" : "to";
  const settings = profileSettings();
  const targets = profileTargets();
  if (!settings || !targets) return;
  let flapExpected = 0;
  if (current === "landing") flapExpected = settings.landingFlaps;
  else if (currentStep && requirement !== "flaps_up" && requirement !== "trim_climb" && requirement !== "climb") {
    flapExpected = settings.takeoffFlaps;
  }
  let speedReady = false;
  if (requirement === "rotate") speedReady = Sim.airspeed >= targets.rotation;
  else if (requirement === "climb_speed") speedReady = Sim.airspeed >= targets.climbMin && Sim.airspeed <= targets.climbMax;
  else if (requirement === "safe_flap_speed") speedReady = Sim.airspeed === targets.safeFlapTarget;
  else if (requirement === "vapp") speedReady = Sim.airspeed >= targets.approachMin && Sim.airspeed <= targets.approachMax;

  setValue("airspeed", `${Sim.airspeed} KIAS`, current !== "explore" && speedReady);
  setValue("flaps", `${Sim.flaps}°`, current !== "explore" && Sim.flaps === flapExpected);
  setValue("power", `${Sim.throttle}%`, current !== "explore" && (current === "takeoff" ? Sim.throttle >= 95 : Sim.throttle <= 30));
  setValue("brake", Sim.brakeReleased ? "Off" : "Set", current !== "explore" && Sim.brakeReleased);
  setValue("trim", trimLabel, current !== "explore" && Sim.trim === trimExpected);
  setValue("mixture", Sim.mixtureRich ? "Rich" : "Lean", Sim.mixtureRich);
  setValue("lights", Sim.landingLights ? "On" : "Off", Sim.landingLights);
  setValue("strobe", Sim.strobeOn ? "On" : "Off", Sim.strobeOn);
  setValue("xpdr", Sim.xpdrAlt ? "ALT" : "STBY", Sim.xpdrAlt && isValidSquawk(Sim.xpdrCode));
}

function tickIfCurrent(requirement) {
  const row = currentRow();
  if (!row || row.dataset.requires !== requirement || !isSatisfied(requirement)) return false;
  row.querySelector("input").checked = true;
  return true;
}

function syncAfterControlChange(requirements = []) {
  // Completed checklist rows record actions already performed; later control changes must not revoke them.
  for (let i = 0; i < requirements.length; i++) {
    tickIfCurrent(requirements[i]);
  }
  updateProgress();
}

function updateProgress() {
  renderSimulatorReadout();
  const rows = getRows();
  const explorer = current === "explore";
  let done = 0;
  let currentStep = null;
  for (let i = 0; i < rows.length; i++) {
    const checked = rows[i].querySelector("input").checked;
    if (checked) done++;
    else if (!currentStep) currentStep = rows[i];
  }
  const complete = !explorer && rows.length > 0 && done === rows.length;

  if (progressText) progressText.textContent = explorer ? "—" : `${done} / ${rows.length}`;
  if (paperStamp) paperStamp.classList.toggle("show", complete);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const checked = row.querySelector("input").checked;
    row.classList.toggle("done", checked);
    row.classList.toggle("locked", !checked && row !== currentStep);
    row.classList.toggle("current", row === currentStep);
    if (row === currentStep) row.setAttribute("aria-current", "step");
    else row.removeAttribute("aria-current");
  }

  if (currentStep && checklist.getClientRects().length) scrollStepIntoView(currentStep, "nearest");
  if (nextBtn) {
    nextBtn.hidden = explorer;
    nextBtn.disabled = complete;
    nextBtn.textContent = complete ? "Procedure complete ✓" : "Show current step ↓";
  }
  if (resetBtn) resetBtn.textContent = explorer ? "Reset controls" : "Restart";
  if (testMode) {
    updateTestScore();
    if (complete && testState === "active") finishTest("complete");
  }
}

function scrollStepIntoView(row, align = "nearest") {
  if (!row || !checklist) return;
  const rowRect = row.getBoundingClientRect();
  const listRect = checklist.getBoundingClientRect();
  let offset = 0;
  if (align === "center") offset = rowRect.top - listRect.top - (listRect.height - rowRect.height) / 2;
  else if (rowRect.top < listRect.top) offset = rowRect.top - listRect.top;
  else if (rowRect.bottom > listRect.bottom) offset = rowRect.bottom - listRect.bottom;
  if (offset) checklist.scrollBy({ top: offset, behavior: "smooth" });
}

function showInfo(name, text, hold = false) {
  if (infoTitle) infoTitle.textContent = name;
  if (infoText) infoText.textContent = text;
  if (infoBox) infoBox.classList.add("show");
  clearTimeout(infoTimer);
  clearTimeout(infoHideTimer);
  if (!hold) infoTimer = setTimeout(hideInfo, 4500);
}

function hideInfo(restoreFocus = false) {
  clearTimeout(infoTimer);
  clearTimeout(infoHideTimer);
  if (infoBox) infoBox.classList.remove("show");
  if (restoreFocus && lastHotspot && lastHotspot.isConnected) lastHotspot.focus();
}

function scheduleInfoHide() {
  clearTimeout(infoHideTimer);
  infoHideTimer = setTimeout(() => {
    hideInfo();
  }, 140);
}

function openControlPanel(name, text, op) {
  if (controlTitle) controlTitle.textContent = name;
  if (controlDescription) controlDescription.textContent = text;
  if (controlPanel) controlPanel.hidden = false;
  renderControlPanel(op);
  if (infoControls) {
    const firstControl = infoControls.querySelector("input, select, button");
    if (firstControl) firstControl.focus();
  }
}

function closeControlPanel(restoreFocus = false) {
  if (controlPanel) controlPanel.hidden = true;
  if (infoControls) infoControls.innerHTML = "";
  if (restoreFocus && lastHotspot && lastHotspot.isConnected) lastHotspot.focus();
}

function makeField(labelText) {
  const field = document.createElement("div");
  field.className = "control-field";
  const label = document.createElement("div");
  label.className = "control-field-label";
  const text = document.createElement("span");
  text.textContent = labelText;
  label.appendChild(text);
  field.appendChild(label);
  return { field, label };
}

function addHint(parent, text) {
  const hint = document.createElement("p");
  hint.className = "control-hint";
  hint.textContent = text;
  parent.appendChild(hint);
  return hint;
}

function addRangeControl(options) {
  const parts = makeField(options.name);
  const field = parts.field;
  const label = parts.label;
  const output = document.createElement("output");
  output.value = options.format(options.value);
  output.textContent = output.value;
  label.appendChild(output);
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(options.min);
  input.max = String(options.max);
  input.step = String(options.step);
  input.value = String(options.value);
  input.setAttribute("aria-label", options.name);
  let requirementAtInteraction = null;
  const rememberRequirement = () => {
    if (requirementAtInteraction === null) requirementAtInteraction = getCurrentRequirement();
  };
  input.addEventListener("pointerdown", rememberRequirement);
  input.addEventListener("keydown", rememberRequirement);
  input.addEventListener("input", () => {
    rememberRequirement();
    const numericValue = Number(input.value);
    output.value = options.format(numericValue);
    output.textContent = output.value;
    options.onInput(numericValue);
  });
  input.addEventListener("change", () => {
    let requirement = requirementAtInteraction;
    if (requirement === null || typeof requirement === "undefined") {
      requirement = getCurrentRequirement();
    }
    requirementAtInteraction = null;
    if (options.onCommit) options.onCommit(requirement);
  });
  field.appendChild(input);
  if (options.hint) addHint(field, options.hint);
  infoControls.appendChild(field);
  return input;
}

function addToggleControl(options) {
  const parts = makeField(options.name);
  const field = parts.field;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "control-button";
  let value = options.value;
  const render = () => {
    button.textContent = value ? options.onLabel : options.offLabel;
    button.setAttribute("aria-pressed", String(value));
    button.setAttribute("aria-label", `${options.name}: ${value ? options.onLabel : options.offLabel}`);
  };
  render();
  button.addEventListener("click", () => {
    value = !value;
    render();
    options.onChange(value);
  });
  field.appendChild(button);
  infoControls.appendChild(field);
  return button;
}

function addControlFeedback(text = "") {
  const feedback = document.createElement("p");
  feedback.className = "control-feedback";
  feedback.setAttribute("aria-live", "polite");
  feedback.textContent = text;
  infoControls.appendChild(feedback);
  return feedback;
}

function renderControlPanel(op) {
  if (infoControls) infoControls.innerHTML = "";
  switch (op) {
    case "throttle":
      addRangeControl({
        name: "Throttle", min: 0, max: 100, step: 1, value: Sim.throttle,
        format: (value) => `${value}%`,
        onInput: (value) => {
          Sim.throttle = value;
          syncAfterControlChange(["throttle_full", "throttle_reduce", "idle"]);
        },
        onCommit: (requirement) => recordTestAttempt("throttle", isSatisfied(requirement), requirement),
        hint: "0% is idle; 100% is full simulated power.",
      });
      break;
    case "flaps":
      addRangeControl({
        name: "Flap setting", min: 0, max: 30, step: 10, value: Sim.flaps,
        format: (value) => `${value}°`,
        onInput: (value) => {
          Sim.flaps = value;
          syncAfterControlChange(["flaps_takeoff", "flaps_landing", "flaps_up"]);
        },
        onCommit: (requirement) => recordTestAttempt("flaps", isSatisfied(requirement), requirement),
        hint: "Detents: 0°, 10°, 20°, and 30°.",
      });
      break;
    case "speed": {
      addRangeControl({
        name: "Simulated airspeed", min: 0, max: 120, step: 1, value: Sim.airspeed,
        format: (value) => `${value} KIAS`,
        onInput: (value) => {
          Sim.airspeed = value;
          Sim.climbSpeed = false;
          Sim.safeFlapSpeed = false;
          Sim.stabilized = false;
          syncAfterControlChange(["rotate"]);
        },
        onCommit: (requirement) => {
          if (requirement !== "rotate" && requirement !== "climb_speed" &&
              requirement !== "safe_flap_speed" && requirement !== "vapp") {
            recordTestAttempt("speed", false, requirement);
          }
        },
        hint: "Set a training indication. This slider does not model aircraft aerodynamics.",
      });
      const feedback = addControlFeedback();
      const confirm = document.createElement("button");
      confirm.type = "button";
      confirm.className = "control-button";
      confirm.textContent = "Confirm current reading";
      confirm.addEventListener("click", () => {
        const requirement = getCurrentRequirement();
        if (requirement === "climb_speed") Sim.climbSpeed = true;
        else if (requirement === "safe_flap_speed") Sim.safeFlapSpeed = true;
        else if (requirement === "vapp") Sim.stabilized = true;
        else {
          recordTestAttempt("speed-confirm", false, requirement);
          feedback.textContent = "Airspeed is set. Use this marker when the checklist asks for a speed check.";
          return;
        }
        recordTestAttempt("speed-confirm", isSatisfied(requirement), requirement);
        syncAfterControlChange([requirement]);
        feedback.textContent = getCurrentRequirement() === requirement
          ? "That reading is outside the current profile target. Adjust it and confirm again."
          : "Reading confirmed for the current step.";
      });
      infoControls.appendChild(confirm);
      break;
    }
    case "mixture":
      addToggleControl({
        name: "Mixture", value: Sim.mixtureRich, onLabel: "Full rich", offLabel: "Lean",
        onChange: (value) => {
          Sim.mixtureRich = value;
          const requirement = getCurrentRequirement();
          recordTestAttempt("mixture", Sim.mixtureRich, requirement);
          syncAfterControlChange(["engine_setup"]);
        },
      });
      break;
    case "trim": {
      const parts = makeField("Elevator trim");
      const field = parts.field;
      const fieldLabel = parts.label;
      const select = document.createElement("select");
      select.setAttribute("aria-label", "Elevator trim position");
      const trimOptions = [["dn", "Down"], ["to", "Takeoff"], ["clb", "Climb"]];
      for (let i = 0; i < trimOptions.length; i++) {
        const value = trimOptions[i][0];
        const text = trimOptions[i][1];
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        select.appendChild(option);
      }
      select.value = Sim.trim;
      select.addEventListener("change", () => {
        Sim.trim = select.value;
        const requirement = getCurrentRequirement();
        recordTestAttempt("trim", isSatisfied(requirement), requirement);
        syncAfterControlChange(["trim_takeoff", "trim_climb"]);
      });
      fieldLabel.removeChild(fieldLabel.firstChild);
      field.appendChild(select);
      infoControls.appendChild(field);
      break;
    }
    case "lights":
      addToggleControl({
        name: "Landing / taxi lights", value: Sim.landingLights,
        onLabel: "On", offLabel: "Off",
        onChange: (value) => {
          Sim.landingLights = value;
          const requirement = getCurrentRequirement();
          recordTestAttempt("lights", Sim.landingLights, requirement);
          syncAfterControlChange(["lights_xpdr"]);
        },
      });
      break;
    case "strobes":
      addToggleControl({
        name: "Strobes", value: Sim.strobeOn, onLabel: "On", offLabel: "Off",
        onChange: (value) => {
          Sim.strobeOn = value;
          const requirement = getCurrentRequirement();
          recordTestAttempt("strobes", Sim.strobeOn, requirement);
          syncAfterControlChange(["lights_xpdr"]);
        },
      });
      break;
    case "xpdr": {
      const parts = makeField("Assigned transponder code");
      const field = parts.field;
      const label = parts.label;
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "numeric";
      input.maxLength = 4;
      input.pattern = "[0-7]{4}";
      input.placeholder = "Four digits, 0–7";
      input.value = Sim.xpdrCode;
      input.setAttribute("aria-label", "Assigned four-digit transponder code");
      let requirementAtCodeEdit = null;
      input.addEventListener("focus", () => {
        requirementAtCodeEdit = getCurrentRequirement();
      });
      input.addEventListener("change", () => {
        let requirement = requirementAtCodeEdit;
        if (requirement === null || typeof requirement === "undefined") {
          requirement = getCurrentRequirement();
        }
        requirementAtCodeEdit = null;
        recordTestAttempt("xpdr-code", isValidSquawk(Sim.xpdrCode), requirement);
      });
      label.removeChild(label.firstChild);
      field.appendChild(input);
      const codeFeedback = addControlFeedback();
      input.addEventListener("input", () => {
        Sim.xpdrCode = input.value.trim();
        codeFeedback.textContent = Sim.xpdrCode === "" || isValidSquawk(Sim.xpdrCode)
          ? "Enter the code assigned for your training scenario."
          : "Use four digits from 0 through 7.";
        syncAfterControlChange(["lights_xpdr"]);
      });
      infoControls.appendChild(field);
      infoControls.appendChild(codeFeedback);
      addToggleControl({
        name: "Transponder mode", value: Sim.xpdrAlt, onLabel: "ALT", offLabel: "STBY",
        onChange: (value) => {
          Sim.xpdrAlt = value;
          const requirement = getCurrentRequirement();
          recordTestAttempt("xpdr-mode", Sim.xpdrAlt, requirement);
          syncAfterControlChange(["lights_xpdr"]);
        },
      });
      break;
    }
    case "parking-brake":
      addToggleControl({
        name: "Parking brake", value: !Sim.brakeReleased,
        onLabel: "Set", offLabel: "Released",
        onChange: (value) => {
          Sim.brakeReleased = !value;
          const requirement = getCurrentRequirement();
          recordTestAttempt("parking-brake", Sim.brakeReleased, requirement);
          syncAfterControlChange(["brake"]);
        },
      });
      break;
    default:
      break;
  }
}

function momentary(requirement, setFlag, successTitle, successText, action) {
  const expected = getCurrentRequirement();
  if (expected !== requirement) {
    recordTestAttempt(action, false, expected);
    return false;
  }
  setFlag();
  const satisfied = isSatisfied(requirement);
  recordTestAttempt(action, satisfied, expected);
  if (testMode && !satisfied) {
    if (requirement === "verify_takeoff") Sim.verified = false;
    if (requirement === "rotate") Sim.rotated = false;
  }
  syncAfterControlChange([requirement]);
  let completed = false;
  const rows = getRows();
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].dataset.requires === requirement) {
      completed = rows[i].querySelector("input").checked;
      break;
    }
  }
  if (completed) showInfo(successTitle, successText);
  else showInfo(successTitle, "Check the simulated indication, then try this action again.");
  return Boolean(completed);
}

function handleCockpitOp(op, name, text) {
  const requirement = getCurrentRequirement();
  switch (op) {
    case "engine":
      if (requirement === "verify_takeoff") {
        momentary("verify_takeoff", () => { Sim.verified = true; }, "Engine check", "Takeoff power verified at the tachometer.", op);
      } else {
        recordTestAttempt(op, false, requirement);
        showInfo(name, text);
      }
      break;
    case "nav":
      if (requirement === "pattern") {
        momentary("pattern", () => { Sim.patternJoined = true; }, "Pattern", "Pattern or approach joined.", op);
      } else {
        recordTestAttempt(op, false, requirement);
        showInfo(name, text);
      }
      break;
    case "pedals":
      if (requirement === "centreline") {
        momentary("centreline", () => { Sim.centrelineHeld = true; }, "Rudder", "Centerline held with rudder pedals.", op);
      } else if (requirement === "rollout") {
        momentary("rollout", () => { Sim.brakesApplied = true; }, "Rollout", "Braking with directional control.", op);
      } else if (requirement === "clear") {
        momentary("clear", () => { Sim.vacated = true; }, "Runway", "Runway vacated and clear.", op);
      } else {
        recordTestAttempt(op, false, requirement);
        showInfo(name, text);
      }
      break;
    case "yoke":
      if (requirement === "rotate") {
        const targets = profileTargets();
        const rotationSpeed = targets ? targets.rotation : 0;
        if (Sim.airspeed < rotationSpeed) {
          recordTestAttempt(op, false, requirement);
          showInfo("Rotation", `Wait until the airspeed reaches ${rotationSpeed} KIAS; it is currently ${Sim.airspeed} KIAS.`);
          break;
        }
        momentary("rotate", () => { Sim.rotated = true; }, "Rotation", "Rotation confirmed at the profile reference speed.", op);
      } else if (requirement === "climb") {
        momentary("climb", () => { Sim.climbEstablished = true; }, "Climb", "Positive climb confirmed.", op);
      } else if (requirement === "touchdown") {
        momentary("touchdown", () => { Sim.flared = true; }, "Flare", "Flare and main-wheel touchdown confirmed.", op);
      } else {
        recordTestAttempt(op, false, requirement);
        showInfo(name, text);
      }
      break;
    default:
      showInfo(name, text);
      break;
  }
}

function clearBoardState() {
  if (kneeboard) kneeboard.classList.remove("expanded", "collapsed");
  if (boardToggle) boardToggle.setAttribute("aria-expanded", "false");
  const toggleLabel = boardToggle ? boardToggle.querySelector("span") : null;
  if (toggleLabel) toggleLabel.textContent = "Open checklist";
}

function loadProcedure(type) {
  if (type !== "explore" && (!procedures || !procedures[type])) return;
  current = type;
  testMistakeCount = 0;
  testState = "active";
  testStartedAt = Date.now();
  if (testSaveStatus) testSaveStatus.textContent = "";
  if (testPanel) testPanel.classList.remove("is-complete", "is-failed");
  if (kneeboard) kneeboard.hidden = testMode;
  if (testPanel) testPanel.hidden = !testMode;
  resetSim(type);
  hideInfo();
  closeControlPanel();
  clearBoardState();

  let data;
  if (type === "explore") {
    data = {
      title: "Cockpit Explorer",
      label: "Explore panel controls and simulated states",
      speedTarget: "",
      verticalTarget: "",
      steps: [],
    };
  } else {
    const procedure = procedures[type];
    let speedTarget;
    if (type === "takeoff") {
      speedTarget = `Rotation ${procedures.profile.targets.rotation} KIAS · Climb ${procedures.profile.targets.climbMin}–${procedures.profile.targets.climbMax} KIAS`;
    } else {
      speedTarget = `Approach ${procedures.profile.targets.approachMin}–${procedures.profile.targets.approachMax} KIAS · Flaps ${procedures.profile.settings.landingFlaps}°`;
    }
    data = {
      title: procedure.title,
      label: procedure.label,
      verticalTarget: procedure.verticalTarget,
      steps: procedure.steps,
      speedTarget: speedTarget,
    };
  }

  if (takeoffBtn) {
    takeoffBtn.classList.toggle("active", type === "takeoff");
    takeoffBtn.setAttribute("href", `trainer.html?procedure=takeoff${testMode ? "&mode=test" : ""}`);
    if (type === "takeoff") takeoffBtn.setAttribute("aria-current", "page");
    else takeoffBtn.removeAttribute("aria-current");
  }
  if (landingBtn) {
    landingBtn.classList.toggle("active", type === "landing");
    landingBtn.setAttribute("href", `trainer.html?procedure=landing${testMode ? "&mode=test" : ""}`);
    if (type === "landing") landingBtn.setAttribute("aria-current", "page");
    else landingBtn.removeAttribute("aria-current");
  }
  if (title) title.textContent = data.title;
  if (testTitle) testTitle.textContent = data.title.replace(/ Checklist$/, " test");
  if (testMessage) testMessage.textContent = "Use the cockpit controls to complete each action in order.";
  document.title = `${data.title} · CockpitIQ`;
  if (label) label.textContent = data.label;

  if (procedureTargets) {
    procedureTargets.innerHTML = "";
    if (data.speedTarget) addTargetChip("Speed", data.speedTarget);
    if (data.verticalTarget) addTargetChip("Flight path", data.verticalTarget);
  }

  checklist.innerHTML = "";
  for (let i = 0; i < data.steps.length; i++) {
    const item = data.steps[i];
    const row = document.createElement("div");
    row.className = "check-item locked";
    row.dataset.requires = item.requires;
    row.setAttribute("role", "listitem");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.disabled = true;
    box.setAttribute("aria-label", item.name);
    const textWrap = document.createElement("div");
    textWrap.className = "check-text";
    const name = document.createElement("strong");
    name.textContent = item.name;
    const description = document.createElement("small");
    description.textContent = item.description;
    const control = document.createElement("small");
    control.className = "step-control";
    control.textContent = `Control: ${item.control}`;
    textWrap.appendChild(name);
    textWrap.appendChild(description);
    textWrap.appendChild(control);
    row.appendChild(box);
    row.appendChild(textWrap);
    checklist.appendChild(row);
  }
  updateProgress();
}

function addTargetChip(name, value) {
  const target = document.createElement("span");
  target.className = "target-chip";
  const targetName = document.createElement("small");
  targetName.textContent = name;
  const targetValue = document.createElement("strong");
  targetValue.textContent = value;
  target.appendChild(targetName);
  target.appendChild(targetValue);
  procedureTargets.appendChild(target);
}

function isValidProcedures(data) {
  if (!data || !data.profile) return false;
  const profile = data.profile;
  if (!profile || typeof profile.aircraft !== "string" || typeof profile.configuration !== "string" || typeof profile.sourceNote !== "string") return false;
  const verification = profile.verification;
  if (!verification || (verification.status !== "unverified" && verification.status !== "verified") ||
      typeof verification.note !== "string" || !Array.isArray(verification.references) ||
      !Array.isArray(verification.supplements) || typeof verification.manualTitle !== "string" ||
      typeof verification.manualRevision !== "string" || typeof verification.aircraftApplicability !== "string" ||
      typeof verification.reviewerRole !== "string" || typeof verification.reviewedOn !== "string") return false;
  if (verification.status === "verified" && !window.isAircraftProfileVerified(profile)) return false;
  const targetKeys = ["rotation", "climbMin", "climbMax", "safeFlapTarget", "approachMin", "approachMax"];
  const settingKeys = ["takeoffFlaps", "landingFlaps"];
  if (!profile.targets || !profile.settings) return false;
  for (let i = 0; i < targetKeys.length; i++) {
    if (typeof profile.targets[targetKeys[i]] !== "number" || !isFinite(profile.targets[targetKeys[i]])) return false;
  }
  for (let i = 0; i < settingKeys.length; i++) {
    if (typeof profile.settings[settingKeys[i]] !== "number" || !isFinite(profile.settings[settingKeys[i]])) return false;
  }
  const targets = profile.targets;
  if (targets.rotation < 0 || targets.rotation > 120 || targets.climbMin < 0 || targets.climbMin > targets.climbMax || targets.climbMax > 120) return false;
  if (targets.safeFlapTarget < 0 || targets.safeFlapTarget > 120 || targets.approachMin < 0 || targets.approachMin > targets.approachMax || targets.approachMax > 120) return false;
  const flapOptions = [0, 10, 20, 30];
  for (let i = 0; i < settingKeys.length; i++) {
    if (flapOptions.indexOf(profile.settings[settingKeys[i]]) === -1) return false;
  }

  const procedureNames = ["takeoff", "landing"];
  for (let i = 0; i < procedureNames.length; i++) {
    const type = procedureNames[i];
    const procedure = data[type];
    if (!procedure || typeof procedure.title !== "string" || typeof procedure.label !== "string") return false;
    if (!Array.isArray(procedure.steps) || procedure.steps.length === 0) return false;
    for (let j = 0; j < procedure.steps.length; j++) {
      const step = procedure.steps[j];
      if (!step || typeof step.name !== "string" || typeof step.description !== "string" ||
          typeof step.requires !== "string" || typeof step.control !== "string" ||
          supportedRequirements.indexOf(step.requires) === -1) return false;
    }
  }
  return true;
}

boardToggle.addEventListener("click", () => {
  const expanded = !kneeboard.classList.contains("expanded");
  kneeboard.classList.toggle("expanded", expanded);
  kneeboard.classList.toggle("collapsed", !expanded);
  boardToggle.setAttribute("aria-expanded", String(expanded));
  const text = boardToggle.querySelector("span");
  if (text) text.textContent = expanded ? "Close checklist" : "Open checklist";
});

kneeboard.addEventListener("pointerenter", () => {
  if (!window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 761px)").matches || kneeboard.classList.contains("collapsed")) return;
  boardToggle.setAttribute("aria-expanded", "true");
  if (!kneeboard.classList.contains("expanded")) {
    const text = boardToggle.querySelector("span");
    if (text) text.textContent = "Pin checklist open";
  }
});

kneeboard.addEventListener("pointerleave", () => {
  const pinned = kneeboard.classList.contains("expanded");
  kneeboard.classList.remove("collapsed");
  if (!pinned) {
    boardToggle.setAttribute("aria-expanded", "false");
    const text = boardToggle.querySelector("span");
    if (text) text.textContent = "Open checklist";
  }
});

nextBtn.addEventListener("click", () => {
  const row = currentRow();
  if (!row) {
    showInfo("Complete", "Procedure complete. Return to the home screen to choose another activity.");
    return;
  }
  scrollStepIntoView(row, "center");
  showInfo("Current step", `${row.querySelector("strong").textContent}. Operate or confirm the relevant cockpit control.`);
});

resetBtn.addEventListener("click", () => loadProcedure(current));
testRestart.addEventListener("click", () => loadProcedure(current));
testResultRestart.addEventListener("click", () => {
  testResultDialog.close();
  loadProcedure(current);
});

const hotspotButtons = document.querySelectorAll(".hotspot");
for (let i = 0; i < hotspotButtons.length; i++) {
  const button = hotspotButtons[i];
  const name = button.dataset.name;
  const text = button.dataset.info || `${name}.`;
  const op = button.dataset.op || "none";
  button.setAttribute("aria-label", name);
  if (op === "none") {
    button.classList.add("info-only");
    const tag = button.querySelector(".tag");
    const kind = document.createElement("small");
    kind.className = "marker-kind";
    kind.textContent = "Info";
    if (tag) tag.appendChild(kind);
  }
  button.addEventListener("mouseenter", () => showInfo(name, text, true));
  button.addEventListener("mouseleave", scheduleInfoHide);
  button.addEventListener("focus", () => {
    lastHotspot = button;
    showInfo(name, text, true);
  });
  button.addEventListener("blur", scheduleInfoHide);
  button.addEventListener("click", () => {
    if (testMode && testState !== "active") return;
    lastHotspot = button;
    if (op === "throttle" || op === "flaps" || op === "speed" || op === "mixture" ||
        op === "trim" || op === "lights" || op === "strobes" || op === "xpdr" || op === "parking-brake") {
      hideInfo();
      openControlPanel(name, text, op);
    } else if (op === "none") {
      showInfo(name, `${text} Information only; this marker does not change a simulated state.`);
    } else {
      handleCockpitOp(op, name, text);
    }
  });
}

labelsBtn.addEventListener("click", () => {
  const enabled = !document.body.classList.contains("show-hotspot-labels");
  document.body.classList.toggle("show-hotspot-labels", enabled);
  labelsBtn.setAttribute("aria-pressed", String(enabled));
  labelsBtn.setAttribute("aria-label", enabled ? "Hide cockpit control labels" : "Show cockpit control labels");
});

controlClose.addEventListener("click", () => closeControlPanel(true));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (controlPanel && !controlPanel.hidden) closeControlPanel(true);
    if (infoBox && infoBox.classList.contains("show")) hideInfo(true);
  }
});

if (cockpitImage.complete) fitCockpit();
else cockpitImage.addEventListener("load", fitCockpit);
window.addEventListener("resize", () => {
  fitCockpit();
  updateTestScore();
});

if (isValidProcedures(procedures)) {
  const verification = procedures.profile.verification;
  const profileStatus = verification.status === "verified" ? "Verified profile" : "Generic profile · unverified";
  appProfileLabel.textContent = `${procedures.profile.aircraft} · ${profileStatus}`;
  if (profileVerificationNote) {
    profileVerificationNote.textContent = verification.note;
    profileVerificationNote.classList.toggle("is-verified", verification.status === "verified");
  }
  loadProcedure(current);
} else {
  loadProcedure("explore");
  showInfo("Profile unavailable", "The local training profile could not be loaded. Check that js/procedures.js exists.");
}
