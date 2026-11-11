(function () {
  var config = window.CockpitSupabaseConfig || {};
  var sdk = window.supabase;
  var configured = Boolean(config.url && config.publishableKey && sdk && sdk.createClient);
  var client = configured ? sdk.createClient(config.url, config.publishableKey) : null;

  function requireClient() {
    if (!client) {
      throw new Error("Accounts are not connected yet. Configure Supabase using the setup guide.");
    }
    return client;
  }

  async function signUp(email, password, displayName) {
    var activeClient = requireClient();
    var redirectUrl = null;
    var options = { data: { display_name: displayName } };
    if (window.location.protocol === "https:" || window.location.protocol === "http:") {
      redirectUrl = new URL("signin.html?verified=1", window.location.href).href;
    }
    if (redirectUrl) options.emailRedirectTo = redirectUrl;
    var result = await activeClient.auth.signUp({
      email: email,
      password: password,
      options: options,
    });
    if (result.error) throw result.error;
    return result.data;
  }

  async function signIn(email, password) {
    var result = await requireClient().auth.signInWithPassword({ email: email, password: password });
    if (result.error) throw result.error;
    return result.data;
  }

  async function signOut() {
    var result = await requireClient().auth.signOut();
    if (result.error) throw result.error;
  }

  async function saveTestAttempt(attempt) {
    var activeClient = requireClient();
    var sessionResult = await activeClient.auth.getSession();
    if (sessionResult.error) throw sessionResult.error;
    if (!sessionResult.data.session) return { saved: false, reason: "signed-out" };

    var result = await activeClient.from("test_attempts").insert({
      procedure: attempt.procedure,
      outcome: attempt.outcome,
      correct_steps: attempt.correctSteps,
      total_steps: attempt.totalSteps,
      mistakes: attempt.mistakes,
      duration_seconds: attempt.durationSeconds,
    });
    if (result.error) throw result.error;
    return { saved: true };
  }

  async function listTestAttempts(limit, offset) {
    var result = await requireClient().from("test_attempts")
      .select("id, procedure, outcome, correct_steps, total_steps, score_percent, mistakes, duration_seconds, completed_at")
      .order("completed_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset || 0, (offset || 0) + (limit || 30) - 1);
    if (result.error) throw result.error;
    return result.data || [];
  }

  async function deleteTestAttempt(id) {
    var result = await requireClient().from("test_attempts").delete().eq("id", id);
    if (result.error) throw result.error;
  }

  async function deleteAllTestAttempts() {
    var result = await requireClient().from("test_attempts").delete().not("user_id", "is", null);
    if (result.error) throw result.error;
  }

  function setMessage(form, message, isError) {
    var target = form.querySelector("#formMessage");
    var button = form.querySelector("#submitBtn");
    if (target) {
      target.textContent = message;
      target.classList.toggle("is-error", Boolean(isError));
    }
    if (button) button.disabled = false;
  }

  async function submitAuthForm(form) {
    var mode = form.dataset.authMode;
    var emailField = form.querySelector('[name="email"]');
    var passwordField = form.querySelector('[name="password"]');
    var email = "";
    var password = "";
    if (emailField) email = emailField.value.trim();
    if (passwordField) password = passwordField.value;
    var displayNameField = form.querySelector('[name="displayName"], [name="fullName"]');
    var displayName = email.split("@")[0];
    if (displayNameField && displayNameField.value.trim() !== "") {
      displayName = displayNameField.value.trim();
    }
    var button = form.querySelector("#submitBtn");
    if (button) button.disabled = true;

    try {
      if (mode === "signin") {
        await signIn(email, password);
        setMessage(form, "Signed in. Opening your dashboard…", false);
        window.location.href = "home.html";
        return;
      }

      if (mode !== "signup" && mode !== "register") {
        throw new Error("This account form has an unknown mode.");
      }

      var result = await signUp(email, password, displayName);
      if (result.session) {
        setMessage(form, "Account created. Opening your dashboard…", false);
        window.location.href = "home.html";
      } else {
        setMessage(form, "Account created. Check your email to confirm it, then sign in.", false);
      }
    } catch (error) {
      setMessage(form, error && error.message ? error.message : "The account request failed. Try again.", true);
    }
  }

  window.CockpitAuth = {
    configured: configured,
    client: client,
    signOut: signOut,
    saveTestAttempt: saveTestAttempt,
    listTestAttempts: listTestAttempts,
    deleteTestAttempt: deleteTestAttempt,
    deleteAllTestAttempts: deleteAllTestAttempts,
    submitAuthForm: submitAuthForm,
  };
})();
