var menuBtn = document.getElementById("menuBtn");
var drawer = document.getElementById("drawer");

function setMenu(open) {
  if (open) {
    drawer.classList.add("open");
  }
  else {
    drawer.classList.remove("open");
  }
  menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  menuBtn.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
}

menuBtn.addEventListener("click", function () {
  setMenu(!drawer.classList.contains("open"));
});

document.addEventListener("keydown", function (event) {
  if (event.key == "Escape") {
    setMenu(false);
  }
});

var data = window.CockpitProfiles;

if (data) {
  document.getElementById("takeoffCount").textContent = data.takeoff.steps.length;
  document.getElementById("landingCount").textContent = data.landing.steps.length;

  var targets = data.profile.targets;
  var verification = data.profile.verification;
  document.getElementById("refRotation").textContent = targets.rotation + " KIAS";
  document.getElementById("refClimb").textContent = targets.climbMin + "-" + targets.climbMax + " KIAS";
  document.getElementById("refFlap").textContent = targets.safeFlapTarget + " KIAS";
  document.getElementById("refApproach").textContent = targets.approachMin + "-" + targets.approachMax + " KIAS";
  var verificationMessage = document.getElementById("profileVerification");
  var verified = window.isAircraftProfileVerified(data.profile);
  verificationMessage.textContent = verified
    ? verification.note
    : verification.status === "verified"
      ? "Verification record incomplete. Treat this profile as unverified and follow the applicable aircraft manual and instructor guidance."
      : verification.note;
  verificationMessage.classList.toggle("is-verified", verified);
}
