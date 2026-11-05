const $ = (id) => document.getElementById(id);
const appProfileLabel = $("appProfileLabel");
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

const supportedRequirements = new Set([
  "brake", "flaps_takeoff", "flaps_landing", "flaps_up", "trim_takeoff",
  "trim_climb", "engine_setup", "lights_xpdr", "throttle_full",
  "throttle_reduce", "idle", "verify_takeoff", "centreline", "rotate",
  "climb_speed", "safe_flap_speed", "climb", "pattern", "vapp",
  "touchdown", "rollout", "clear",
]);

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
let current = ["takeoff", "landing", "explore"].includes(requestedProcedure) ? requestedProcedure : "explore";
const testMode = query.get("mode") === "test" && ["takeoff", "landing"].includes(current);
let testMistakeCount = 0;
let testState = "active";
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
  Object.assign(Sim, {
    airspeed: type === "landing" ? 70 : 0,
    flaps: 0,
    throttle: type === "landing" ? 40 : 20,
    brakeReleased: type === "landing",
    trim: type === "landing" ? "to" : "dn",
    mixtureRich: type === "landing",
    landingLights: type === "landing",
    strobeOn: type === "landing",
    xpdrAlt: type === "landing",
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
  });
}

function getRows() {
  return [...(checklist?.children ?? [])];
}

function currentRow() {
  return getRows().find((row) => !row.querySelector("input").checked);
}

function isValidSquawk(value) {
  return /^[0-7]{4}$/.test(value);
}

function profileTargets() {
  return procedures?.profile?.targets;
}

function profileSettings() {
  return procedures?.profile?.settings;
}

function isSatisfied(requirement) {
  switch (requirement) {
    case "brake": return Sim.brakeReleased;
    case "flaps_takeoff": return Sim.flaps === profileSettings()?.takeoffFlaps;
    case "flaps_landing": return Sim.flaps === profileSettings()?.landingFlaps;
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
    case "climb_speed": return Sim.climbSpeed && Sim.airspeed >= profileTargets()?.climbMin && Sim.airspeed <= profileTargets()?.climbMax;
    case "safe_flap_speed": return Sim.safeFlapSpeed && Sim.airspeed === profileTargets()?.safeFlapTarget;
    case "climb": return Sim.climbEstablished;
    case "pattern": return Sim.patternJoined;
    case "vapp": return Sim.stabilized && Sim.airspeed >= profileTargets()?.approachMin && Sim.airspeed <= profileTargets()?.approachMax && Sim.flaps === profileSettings()?.landingFlaps;
    case "touchdown": return Sim.flared;
    case "rollout": return Sim.brakesApplied;
    case "clear": return Sim.vacated;
    default: return false;
  }
}

function recordTestAttempt(action, correct, requirement = currentRow()?.dataset.requires) {
  if (!testMode || testState !== "active" || !requirement) return;
  if (testActionsByRequirement[requirement]?.includes(action) && correct) return;

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
  const done = rows.filter((row) => row.querySelector("input").checked).length;
  if (testProgress) testProgress.textContent = `${done} / ${rows.length}`;
  if (testProgressBar) testProgressBar.style.width = `${rows.length ? (done / rows.length) * 100 : 0}%`;
  if (testMistakesText) testMistakesText.textContent = `${testMistakeCount} / 3`;
}

function finishTest(state) {
  if (!testMode || testState !== "active") return;
  testState = state;
  testPanel?.classList.toggle("is-complete", state === "complete");
  testPanel?.classList.toggle("is-failed", state === "failed");
  if (testMessage) {
    if (state === "failed") testMessage.textContent = "You're out — three mistakes. Restart the test to try again.";
    else if (testMistakeCount === 0) testMessage.textContent = "Awesome job — you finished with zero mistakes.";
    else testMessage.textContent = `Procedure complete with ${testMistakeCount} ${testMistakeCount === 1 ? "mistake" : "mistakes"}. Restart to improve your score.`;
  }
  testResultDialog?.classList.toggle("is-complete", state === "complete");
  testResultDialog?.classList.toggle("is-failed", state === "failed");
  testResultIconPath?.setAttribute("d", state === "failed" ? "M16 16l16 16M32 16 16 32" : "M13 24l7 7 15-16");
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
  closeControlPanel();
  if (typeof testResultDialog?.showModal === "function" && !testResultDialog.open) {
    testResultDialog.showModal();
    testResultRestart?.focus();
  }
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
  const requirement = currentStep?.dataset.requires;
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
  const flapExpected = current === "landing"
    ? settings?.landingFlaps
    : ["flaps_up", "trim_climb", "climb"].includes(requirement) || !currentStep ? 0 : settings?.takeoffFlaps;
  const speedReady = requirement === "rotate" ? Sim.airspeed >= targets?.rotation
    : requirement === "climb_speed" ? Sim.airspeed >= targets?.climbMin && Sim.airspeed <= targets?.climbMax
      : requirement === "safe_flap_speed" ? Sim.airspeed === targets?.safeFlapTarget
        : requirement === "vapp" ? Sim.airspeed >= targets?.approachMin && Sim.airspeed <= targets?.approachMax : false;

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

function revalidateCompletedRows() {
  const rows = getRows();
  const firstInvalid = rows.findIndex((row) => {
    const box = row.querySelector("input");
    return box.checked && !isSatisfied(row.dataset.requires);
  });
  if (firstInvalid < 0) return;
  rows.slice(firstInvalid).forEach((row) => {
    row.querySelector("input").checked = false;
  });
}

function tickIfCurrent(requirement) {
  const row = currentRow();
  if (!row || row.dataset.requires !== requirement || !isSatisfied(requirement)) return false;
  row.querySelector("input").checked = true;
  return true;
}

function syncAfterControlChange(requirements = []) {
  // A test records completed actions; later phases legitimately change earlier settings.
  if (!testMode) revalidateCompletedRows();
  requirements.forEach(tickIfCurrent);
  updateProgress();
}

function updateProgress() {
  renderSimulatorReadout();
  const rows = getRows();
  const explorer = current === "explore";
  const done = rows.filter((row) => row.querySelector("input").checked).length;
  const currentStep = rows.find((row) => !row.querySelector("input").checked);
  const complete = !explorer && rows.length > 0 && done === rows.length;

  if (progressText) progressText.textContent = explorer ? "—" : `${done} / ${rows.length}`;
  paperStamp?.classList.toggle("show", complete);
  rows.forEach((row) => {
    const checked = row.querySelector("input").checked;
    row.classList.toggle("done", checked);
    row.classList.toggle("locked", !checked && row !== currentStep);
    row.classList.toggle("current", row === currentStep);
    if (row === currentStep) row.setAttribute("aria-current", "step");
    else row.removeAttribute("aria-current");
  });

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
  infoBox?.classList.remove("show");
  if (restoreFocus && lastHotspot?.isConnected) lastHotspot.focus();
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
}

function closeControlPanel(restoreFocus = false) {
  if (controlPanel) controlPanel.hidden = true;
  infoControls?.replaceChildren();
  if (restoreFocus && lastHotspot?.isConnected) lastHotspot.focus();
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

function addRangeControl({ name, min, max, step, value, format, onInput, onCommit, hint }) {
  const { field, label } = makeField(name);
  const output = document.createElement("output");
  output.value = format(value);
  output.textContent = output.value;
  label.appendChild(output);
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.setAttribute("aria-label", name);
  let requirementAtInteraction = null;
  const rememberRequirement = () => {
    if (requirementAtInteraction === null) requirementAtInteraction = currentRow()?.dataset.requires ?? "";
  };
  input.addEventListener("pointerdown", rememberRequirement);
  input.addEventListener("keydown", rememberRequirement);
  input.addEventListener("input", () => {
    rememberRequirement();
    const numericValue = Number(input.value);
    output.value = format(numericValue);
    output.textContent = output.value;
    onInput(numericValue);
  });
  input.addEventListener("change", () => {
    const requirement = requirementAtInteraction ?? currentRow()?.dataset.requires;
    requirementAtInteraction = null;
    onCommit?.(requirement);
  });
  field.appendChild(input);
  if (hint) addHint(field, hint);
  infoControls.appendChild(field);
  return input;
}

function addToggleControl({ name, value, onLabel, offLabel, onChange }) {
  const { field } = makeField(name);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "control-button";
  const render = () => {
    button.textContent = value ? onLabel : offLabel;
    button.setAttribute("aria-pressed", String(value));
    button.setAttribute("aria-label", `${name}: ${value ? onLabel : offLabel}`);
  };
  render();
  button.addEventListener("click", () => {
    value = !value;
    render();
    onChange(value);
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
  infoControls?.replaceChildren();
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
          if (!["rotate", "climb_speed", "safe_flap_speed", "vapp"].includes(requirement)) {
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
        const requirement = currentRow()?.dataset.requires;
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
        feedback.textContent = currentRow()?.dataset.requires === requirement
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
          const requirement = currentRow()?.dataset.requires;
          recordTestAttempt("mixture", Sim.mixtureRich, requirement);
          syncAfterControlChange(["engine_setup"]);
        },
      });
      break;
    case "trim": {
      const { field, label: fieldLabel } = makeField("Elevator trim");
      const select = document.createElement("select");
      select.setAttribute("aria-label", "Elevator trim position");
      [["dn", "Down"], ["to", "Takeoff"], ["clb", "Climb"]].forEach(([value, text]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        select.appendChild(option);
      });
      select.value = Sim.trim;
      select.addEventListener("change", () => {
        Sim.trim = select.value;
        const requirement = currentRow()?.dataset.requires;
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
          const requirement = currentRow()?.dataset.requires;
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
          const requirement = currentRow()?.dataset.requires;
          recordTestAttempt("strobes", Sim.strobeOn, requirement);
          syncAfterControlChange(["lights_xpdr"]);
        },
      });
      break;
    case "xpdr": {
      const { field, label } = makeField("Assigned transponder code");
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
        requirementAtCodeEdit = currentRow()?.dataset.requires ?? "";
      });
      input.addEventListener("change", () => {
        const requirement = requirementAtCodeEdit ?? currentRow()?.dataset.requires;
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
          const requirement = currentRow()?.dataset.requires;
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
          const requirement = currentRow()?.dataset.requires;
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
  const expected = currentRow()?.dataset.requires;
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
  const completed = getRows().find((row) => row.dataset.requires === requirement)?.querySelector("input")?.checked;
  if (completed) showInfo(successTitle, successText);
  else showInfo(successTitle, "Check the simulated indication, then try this action again.");
  return Boolean(completed);
}

function handleCockpitOp(op, name, text) {
  const requirement = currentRow()?.dataset.requires;
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
        const rotationSpeed = profileTargets()?.rotation;
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
  kneeboard?.classList.remove("expanded", "collapsed");
  boardToggle?.setAttribute("aria-expanded", "false");
  const toggleLabel = boardToggle?.querySelector("span");
  if (toggleLabel) toggleLabel.textContent = "Open checklist";
}

function loadProcedure(type) {
  if (type !== "explore" && !procedures?.[type]) return;
  current = type;
  testMistakeCount = 0;
  testState = "active";
  testPanel?.classList.remove("is-complete", "is-failed");
  if (kneeboard) kneeboard.hidden = testMode;
  if (testPanel) testPanel.hidden = !testMode;
  resetSim(type);
  hideInfo();
  closeControlPanel();
  clearBoardState();

  const data = type === "explore"
    ? {
        title: "Cockpit Explorer",
        label: "Explore panel controls and simulated states",
        speedTarget: "",
        verticalTarget: "",
        steps: [],
      }
    : {
        ...procedures[type],
        speedTarget: type === "takeoff"
          ? `Rotation ${procedures.profile.targets.rotation} KIAS · Climb ${procedures.profile.targets.climbMin}–${procedures.profile.targets.climbMax} KIAS`
          : `Approach ${procedures.profile.targets.approachMin}–${procedures.profile.targets.approachMax} KIAS · Flaps ${procedures.profile.settings.landingFlaps}°`,
      };

  takeoffBtn?.classList.toggle("active", type === "takeoff");
  landingBtn?.classList.toggle("active", type === "landing");
  takeoffBtn?.setAttribute("href", `trainer.html?procedure=takeoff${testMode ? "&mode=test" : ""}`);
  landingBtn?.setAttribute("href", `trainer.html?procedure=landing${testMode ? "&mode=test" : ""}`);
  if (type === "takeoff") takeoffBtn?.setAttribute("aria-current", "page");
  else takeoffBtn?.removeAttribute("aria-current");
  if (type === "landing") landingBtn?.setAttribute("aria-current", "page");
  else landingBtn?.removeAttribute("aria-current");
  if (title) title.textContent = data.title;
  if (testTitle) testTitle.textContent = data.title.replace(/ Checklist$/, " test");
  if (testMessage) testMessage.textContent = "Use the cockpit controls to complete each action in order.";
  document.title = `${data.title} · CockpitIQ`;
  if (label) label.textContent = data.label;

  procedureTargets?.replaceChildren();
  [["Speed", data.speedTarget], ["Flight path", data.verticalTarget]].forEach(([name, value]) => {
    if (!value) return;
    const target = document.createElement("span");
    target.className = "target-chip";
    const targetName = document.createElement("small");
    targetName.textContent = name;
    const targetValue = document.createElement("strong");
    targetValue.textContent = value;
    target.append(targetName, targetValue);
    procedureTargets.appendChild(target);
  });

  checklist.replaceChildren();
  data.steps.forEach((item) => {
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
    textWrap.append(name, description, control);
    row.append(box, textWrap);
    checklist.appendChild(row);
  });
  updateProgress();
}

function isValidProcedures(data) {
  const profile = data?.profile;
  if (!profile || typeof profile.aircraft !== "string" || typeof profile.configuration !== "string" || typeof profile.sourceNote !== "string") return false;
  const targetKeys = ["rotation", "climbMin", "climbMax", "safeFlapTarget", "approachMin", "approachMax"];
  const settingKeys = ["takeoffFlaps", "landingFlaps"];
  if (!profile.targets || !targetKeys.every((key) => Number.isFinite(profile.targets[key]))) return false;
  if (!profile.settings || !settingKeys.every((key) => Number.isFinite(profile.settings[key]))) return false;
  const targets = profile.targets;
  if (targets.rotation < 0 || targets.rotation > 120 || targets.climbMin < 0 || targets.climbMin > targets.climbMax || targets.climbMax > 120) return false;
  if (targets.safeFlapTarget < 0 || targets.safeFlapTarget > 120 || targets.approachMin < 0 || targets.approachMin > targets.approachMax || targets.approachMax > 120) return false;
  if (!settingKeys.every((key) => [0, 10, 20, 30].includes(profile.settings[key]))) return false;
  return ["takeoff", "landing"].every((type) => {
    const procedure = data[type];
    return Boolean(
      procedure && typeof procedure.title === "string" && typeof procedure.label === "string" &&
      Array.isArray(procedure.steps) && procedure.steps.length > 0 &&
      procedure.steps.every((step) => step && typeof step.name === "string" &&
        typeof step.description === "string" && typeof step.requires === "string" &&
        typeof step.control === "string" && supportedRequirements.has(step.requires))
    );
  });
}

boardToggle?.addEventListener("click", () => {
  const expanded = !kneeboard?.classList.contains("expanded");
  kneeboard?.classList.toggle("expanded", expanded);
  kneeboard?.classList.toggle("collapsed", !expanded);
  boardToggle.setAttribute("aria-expanded", String(expanded));
  const text = boardToggle.querySelector("span");
  if (text) text.textContent = expanded ? "Close checklist" : "Open checklist";
});

kneeboard?.addEventListener("pointerenter", () => {
  if (!window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 761px)").matches || kneeboard.classList.contains("collapsed")) return;
  boardToggle?.setAttribute("aria-expanded", "true");
  if (!kneeboard.classList.contains("expanded")) {
    const text = boardToggle?.querySelector("span");
    if (text) text.textContent = "Pin checklist open";
  }
});

kneeboard?.addEventListener("pointerleave", () => {
  const pinned = kneeboard.classList.contains("expanded");
  kneeboard.classList.remove("collapsed");
  if (!pinned) {
    boardToggle?.setAttribute("aria-expanded", "false");
    const text = boardToggle?.querySelector("span");
    if (text) text.textContent = "Open checklist";
  }
});

nextBtn?.addEventListener("click", () => {
  const row = currentRow();
  if (!row) {
    showInfo("Complete", "Procedure complete. Return to the home screen to choose another activity.");
    return;
  }
  scrollStepIntoView(row, "center");
  showInfo("Current step", `${row.querySelector("strong").textContent}. Operate or confirm the relevant cockpit control.`);
});

resetBtn?.addEventListener("click", () => loadProcedure(current));
testRestart?.addEventListener("click", () => loadProcedure(current));
testResultRestart?.addEventListener("click", () => {
  testResultDialog?.close();
  loadProcedure(current);
});

document.querySelectorAll(".hotspot").forEach((button) => {
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
    tag?.appendChild(kind);
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
    if (["throttle", "flaps", "speed", "mixture", "trim", "lights", "strobes", "xpdr", "parking-brake"].includes(op)) {
      hideInfo();
      openControlPanel(name, text, op);
    } else if (op === "none") {
      showInfo(name, `${text} Information only; this marker does not change a simulated state.`);
    } else {
      handleCockpitOp(op, name, text);
    }
  });
});

labelsBtn?.addEventListener("click", () => {
  const enabled = !document.body.classList.contains("show-hotspot-labels");
  document.body.classList.toggle("show-hotspot-labels", enabled);
  labelsBtn.setAttribute("aria-pressed", String(enabled));
  labelsBtn.setAttribute("aria-label", enabled ? "Hide cockpit control labels" : "Show cockpit control labels");
});

controlClose?.addEventListener("click", () => closeControlPanel(true));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (controlPanel && !controlPanel.hidden) closeControlPanel(true);
    if (infoBox?.classList.contains("show")) hideInfo(true);
  }
});

if (isValidProcedures(procedures)) {
  appProfileLabel.textContent = `${procedures.profile.aircraft} · Training profile`;
  loadProcedure(current);
} else {
  loadProcedure("explore");
  showInfo("Profile unavailable", "The local training profile could not be loaded. Check that data/procedures.js is beside trainer.html.");
}
