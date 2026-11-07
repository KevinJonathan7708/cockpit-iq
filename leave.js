let allowNavigation = false;

function inMiddle() {
  const allSteps = document.querySelectorAll("#checklist input");
  const doneSteps = document.querySelectorAll("#checklist input:checked");
  const testPanel = document.getElementById("testPanel");

  // Completed or failed tests no longer have progress to lose.
  if (testPanel?.classList.contains("is-failed") || testPanel?.classList.contains("is-complete")) {
    return false;
  }

  return doneSteps.length > 0 && doneSteps.length < allSteps.length;
}

function leaveMessage() {
  const isTest = new URLSearchParams(window.location.search).get("mode") === "test";
  return isTest
    ? "You are in the middle of a test. If you leave, your test progress will be lost. Leave anyway?"
    : "You are in the middle of a session. If you leave, your progress will be lost. Leave anyway?";
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || !inMiddle()) return;
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

  const destination = new URL(link.href, window.location.href);
  const current = new URL(window.location.href);
  if (destination.origin === current.origin &&
      destination.pathname === current.pathname &&
      destination.search === current.search) return;

  if (!window.confirm(leaveMessage())) {
    event.preventDefault();
    return;
  }

  // The click already got the custom confirmation; avoid a second browser prompt.
  allowNavigation = true;
});

// Browsers require their own generic prompt for Back, refresh, and closing the tab.
window.addEventListener("beforeunload", (event) => {
  if (allowNavigation || !inMiddle()) return;
  event.preventDefault();
  event.returnValue = "";
});
