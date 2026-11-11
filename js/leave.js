var allowNavigation = false;

function inMiddle() {
  var allSteps = document.querySelectorAll("#checklist input");
  var doneSteps = document.querySelectorAll("#checklist input:checked");
  var testPanel = document.getElementById("testPanel");

  if (testPanel && (testPanel.classList.contains("is-failed") || testPanel.classList.contains("is-complete"))) {
    return false;
  }

  return doneSteps.length > 0 && doneSteps.length < allSteps.length;
}

function leaveMessage() {
  var isTest = new URLSearchParams(window.location.search).get("mode") == "test";
  if (isTest) {
    return "You are in the middle of a test. If you leave, your test progress will be lost. Leave anyway?";
  }
  return "You are in the middle of a session. If you leave, your progress will be lost. Leave anyway?";
}

document.addEventListener("click", function (event) {
  var link = event.target.closest("a[href]");
  if (!link || !inMiddle()) {
    return;
  }
  if (event.button != 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    return;
  }
  if (link.hasAttribute("download") || (link.target && link.target != "_self")) {
    return;
  }

  var destination = new URL(link.href, window.location.href);
  var current = new URL(window.location.href);
  if (destination.origin == current.origin &&
      destination.pathname == current.pathname &&
      destination.search == current.search) {
    return;
  }

  if (!window.confirm(leaveMessage())) {
    event.preventDefault();
    return;
  }

  allowNavigation = true;
});

window.addEventListener("beforeunload", function (event) {
  if (allowNavigation || !inMiddle()) {
    return;
  }
  event.preventDefault();
  event.returnValue = "";
});
