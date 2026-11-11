(function () {
  var signUpLink = document.getElementById("siteSignUpLink");
  var signInLink = document.getElementById("siteSignInLink");
  var auth = window.CockpitAuth;
  var root = document.documentElement;

  function render(session) {
    var signedIn = Boolean(session && session.user);
    if (signUpLink) signUpLink.hidden = signedIn;
    if (signInLink) signInLink.hidden = signedIn;
    root.classList.remove("auth-nav-pending");
  }

  if (!signUpLink || !signInLink) {
    root.classList.remove("auth-nav-pending");
    return;
  }

  if (!auth || !auth.client) {
    render(null);
    return;
  }

  var authEventReceived = false;

  auth.client.auth.onAuthStateChange(function (_event, session) {
    authEventReceived = true;
    render(session);
  });

  auth.client.auth.getSession().then(function (result) {
    if (result.error) throw result.error;
    if (!authEventReceived) render(result.data.session);
  }).catch(function () {
    if (!authEventReceived) render(null);
  });
})();
