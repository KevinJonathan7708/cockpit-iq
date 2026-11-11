(function () {
  var accountStatus = document.getElementById("accountStatus");
  var accountSignInLink = document.getElementById("accountSignInLink");
  var clearHistoryBtn = document.getElementById("clearHistoryBtn");
  var historyList = document.getElementById("historyList");
  var historyStatus = document.getElementById("historyStatus");
  var loadMoreHistoryBtn = document.getElementById("loadMoreHistoryBtn");
  var signOutBtn = document.getElementById("signOutBtn");
  var welcomeName = document.getElementById("welcomeName");
  var auth = window.CockpitAuth;
  var historyPageSize = 30;
  var historyOffset = 0;
  var dashboardGeneration = 0;
  var historyGeneration = 0;

  var formMessage = document.getElementById("formMessage");
  if (window.location.search.indexOf("verified=1") !== -1 && formMessage) {
    formMessage.textContent = "Email confirmed. You can now sign in.";
  }

  if (!accountStatus && !historyList && !signOutBtn) return;

  function setStatus(target, message, error) {
    if (!target) return;
    target.textContent = message;
    target.classList.toggle("is-error", Boolean(error));
  }

  function formatDate(value) {
    var date = new Date(value);
    if (isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleString();
  }

  function formatDuration(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    return minutes ? minutes + " min " + remainingSeconds + " sec" : remainingSeconds + " sec";
  }

  function renderAttempt(attempt) {
    var item = document.createElement("li");
    item.className = "attempt-record";

    var heading = document.createElement("h3");
    heading.textContent = attempt.procedure === "takeoff" ? "Takeoff test" : "Landing test";

    var result = document.createElement("p");
    result.className = "attempt-result";
    result.textContent = (attempt.outcome === "completed" ? "Completed" : "Failed") +
      " · " + attempt.score_percent + "% · " + attempt.correct_steps + "/" + attempt.total_steps + " steps";

    var details = document.createElement("p");
    details.className = "attempt-details";
    details.textContent = attempt.mistakes + " mistakes · " + formatDuration(attempt.duration_seconds) +
      " · " + formatDate(attempt.completed_at);

    var remove = document.createElement("button");
    remove.type = "button";
    remove.className = "attempt-delete";
    remove.textContent = "Delete result";
    remove.setAttribute("aria-label", "Delete " + (attempt.procedure === "takeoff" ? "takeoff" : "landing") + " test result from " + formatDate(attempt.completed_at));
    remove.addEventListener("click", async function () {
      remove.disabled = true;
      try {
        await auth.deleteTestAttempt(attempt.id);
        await loadHistory();
      } catch (error) {
        remove.disabled = false;
        setStatus(historyStatus, "Could not delete that result. " + error.message, true);
      }
    });

    item.appendChild(heading);
    item.appendChild(result);
    item.appendChild(details);
    item.appendChild(remove);
    return item;
  }

  async function loadHistory(append) {
    if (!historyList || !historyStatus || !auth || !auth.configured) return;
    var requestId = ++historyGeneration;
    setStatus(historyStatus, "Loading saved results…", false);
    if (!append) {
      historyOffset = 0;
      historyList.innerHTML = "";
    }
    if (loadMoreHistoryBtn) loadMoreHistoryBtn.disabled = true;
    try {
      var attempts = await auth.listTestAttempts(historyPageSize, historyOffset);
      if (requestId !== historyGeneration) return;
      if (!attempts.length && historyOffset === 0) {
        setStatus(historyStatus, "No saved test results yet.", false);
        if (clearHistoryBtn) clearHistoryBtn.hidden = true;
        if (loadMoreHistoryBtn) loadMoreHistoryBtn.hidden = true;
        return;
      }
      for (var i = 0; i < attempts.length; i++) {
        historyList.appendChild(renderAttempt(attempts[i]));
      }
      historyOffset += attempts.length;
      setStatus(historyStatus, "Showing " + historyOffset + " saved test result" + (historyOffset === 1 ? "." : "s."), false);
      if (clearHistoryBtn) clearHistoryBtn.hidden = false;
      if (loadMoreHistoryBtn) loadMoreHistoryBtn.hidden = attempts.length < historyPageSize;
    } catch (error) {
      if (requestId !== historyGeneration) return;
      setStatus(historyStatus, "Could not load your results. " + error.message, true);
      if (clearHistoryBtn) clearHistoryBtn.hidden = true;
      if (!append && loadMoreHistoryBtn) loadMoreHistoryBtn.hidden = true;
    } finally {
      if (requestId === historyGeneration && loadMoreHistoryBtn) loadMoreHistoryBtn.disabled = false;
    }
  }

  async function renderDashboard() {
    var requestId = ++dashboardGeneration;
    if (!auth || !auth.configured) {
      historyGeneration++;
      setStatus(accountStatus, "Accounts are not connected yet. The trainer still works, but results cannot be saved.", false);
      setStatus(historyStatus, "Configure Supabase to save and view test results.", false);
      if (accountSignInLink) accountSignInLink.hidden = true;
      if (signOutBtn) signOutBtn.hidden = true;
      if (clearHistoryBtn) clearHistoryBtn.hidden = true;
      if (loadMoreHistoryBtn) loadMoreHistoryBtn.hidden = true;
      return;
    }

    try {
      var result = await auth.client.auth.getSession();
      if (result.error) throw result.error;
      if (requestId !== dashboardGeneration) return;
      var session = result.data.session;
      if (!session) {
        historyGeneration++;
        setStatus(accountStatus, "You are signed out. Sign in to save and view test results.", false);
        setStatus(historyStatus, "Sign in to see your saved test results.", false);
        if (accountSignInLink) accountSignInLink.hidden = false;
        if (signOutBtn) signOutBtn.hidden = true;
        if (clearHistoryBtn) clearHistoryBtn.hidden = true;
        if (loadMoreHistoryBtn) loadMoreHistoryBtn.hidden = true;
        if (welcomeName) welcomeName.textContent = "trainee";
        if (historyList) historyList.innerHTML = "";
        return;
      }

      var name = "trainee";
      if (session.user.user_metadata && session.user.user_metadata.display_name) {
        name = session.user.user_metadata.display_name;
      } else if (session.user.email) {
        name = session.user.email.split("@")[0];
      }
      setStatus(accountStatus, "Signed in as " + name + ". Your test results are private to this account.", false);
      if (welcomeName) welcomeName.textContent = name;
      if (accountSignInLink) accountSignInLink.hidden = true;
      if (signOutBtn) signOutBtn.hidden = false;
      await loadHistory();
    } catch (error) {
      if (requestId !== dashboardGeneration) return;
      historyGeneration++;
      if (historyList) historyList.innerHTML = "";
      if (clearHistoryBtn) clearHistoryBtn.hidden = true;
      if (loadMoreHistoryBtn) loadMoreHistoryBtn.hidden = true;
      setStatus(accountStatus, "Could not check your account. " + error.message, true);
      setStatus(historyStatus, "Your saved results are unavailable until the account connection works.", true);
    }
  }

  if (signOutBtn) signOutBtn.addEventListener("click", async function () {
    signOutBtn.disabled = true;
    try {
      await auth.signOut();
      await renderDashboard();
    } catch (error) {
      setStatus(accountStatus, "Could not sign out. " + error.message, true);
    } finally {
      signOutBtn.disabled = false;
    }
  });

  if (clearHistoryBtn) clearHistoryBtn.addEventListener("click", async function () {
    if (!window.confirm("Delete all of your saved test results? This cannot be undone.")) return;
    clearHistoryBtn.disabled = true;
    try {
      await auth.deleteAllTestAttempts();
      await loadHistory();
    } catch (error) {
      setStatus(historyStatus, "Could not delete your test history. " + error.message, true);
    } finally {
      clearHistoryBtn.disabled = false;
    }
  });

  if (loadMoreHistoryBtn) loadMoreHistoryBtn.addEventListener("click", function () {
    loadHistory(true);
  });

  window.addEventListener("cockpitiq:attempt-saved", function () {
    loadHistory(false);
  });

  if (auth && auth.client) {
    auth.client.auth.onAuthStateChange(function () {
      window.setTimeout(renderDashboard, 0);
    });
  }
  renderDashboard();
})();
