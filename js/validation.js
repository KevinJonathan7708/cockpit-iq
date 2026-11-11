var patterns = {
  name: /^[a-zA-Z\s]{2,50}$/,
  id: /^[A-Z0-9]{6,12}$/i,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  mobile: /^[6-9]\d{9}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
  loginPassword: /^.+$/
};

var errorMessages = {
  name: "Use 2 to 50 letters and spaces only.",
  id: "Use 6 to 12 letters or numbers only.",
  email: "Enter a valid email address like name@example.com.",
  mobile: "Enter a 10-digit number starting with 6, 7, 8 or 9.",
  password: "Use 8 or more characters with uppercase, lowercase, a number and one of @$!%*?&.",
  loginPassword: "Enter your password."
};

var form = document.getElementById("authForm");
var fields = form.querySelectorAll("[data-rule]");
var submitBtn = document.getElementById("submitBtn");
var formMessage = document.getElementById("formMessage");
var loginAlert = document.getElementById("loginAlert");
var passwordField = document.getElementById("password");
var confirmField = document.getElementById("confirmPassword");
var toggleBtn = document.getElementById("togglePassword");
var disableSubmit = form.getAttribute("data-disable-submit") == "yes";

function getError(field) {
  var rule = field.getAttribute("data-rule");
  var value = field.value;

  if (rule == "select") {
    if (value == "") {
      return "Please choose your division.";
    }
    return "";
  }

  if (rule == "terms") {
    if (!field.checked) {
      return "You must accept the Terms of Service.";
    }
    return "";
  }

  if (rule == "confirm") {
    if (value == "" || value != passwordField.value) {
      return "Passwords do not match.";
    }
    return "";
  }

  if (rule != "password" && rule != "loginPassword") {
    value = value.trim();
  }

  if (!patterns[rule].test(value)) {
    return errorMessages[rule];
  }
  return "";
}

function checkField(field) {
  var message = getError(field);
  var errorSpan = field.closest(".field").querySelector(".error-msg");

  errorSpan.textContent = message;
  field.classList.remove("valid");
  field.classList.remove("invalid");

  if (message == "") {
    field.classList.add("valid");
    field.setAttribute("aria-invalid", "false");
    return true;
  }

  field.classList.add("invalid");
  field.setAttribute("aria-invalid", "true");
  return false;
}

function updateSubmit() {
  if (!disableSubmit) {
    return;
  }

  var allValid = true;
  for (var i = 0; i < fields.length; i++) {
    if (getError(fields[i]) != "") {
      allValid = false;
    }
  }
  submitBtn.disabled = !allValid;
}

function onBlur() {
  checkField(this);
  updateSubmit();
}

function onEdit() {
  if (loginAlert) {
    loginAlert.hidden = true;
  }

  if (this.classList.contains("invalid")) {
    checkField(this);
  }

  if (this == passwordField && confirmField) {
    if (confirmField.classList.contains("valid") || confirmField.classList.contains("invalid")) {
      checkField(confirmField);
    }
  }

  updateSubmit();
}

for (var i = 0; i < fields.length; i++) {
  var errorSpan = fields[i].closest(".field").querySelector(".error-msg");
  if (errorSpan && !errorSpan.id) {
    errorSpan.id = fields[i].id + "-error";
  }
  if (errorSpan && errorSpan.id) {
    var describedByText = fields[i].getAttribute("aria-describedby") || "";
    var describedByParts = describedByText.split(/\s+/);
    var describedBy = [];
    for (var partIndex = 0; partIndex < describedByParts.length; partIndex++) {
      if (describedByParts[partIndex] !== "") {
        describedBy.push(describedByParts[partIndex]);
      }
    }
    if (describedBy.indexOf(errorSpan.id) == -1) {
      describedBy.push(errorSpan.id);
    }
    fields[i].setAttribute("aria-describedby", describedBy.join(" "));
  }
  fields[i].setAttribute("aria-invalid", "false");
  fields[i].addEventListener("blur", onBlur);
  fields[i].addEventListener("input", onEdit);
  fields[i].addEventListener("change", onEdit);
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var allValid = true;
  var firstInvalidField = null;
  for (var j = 0; j < fields.length; j++) {
    if (!checkField(fields[j])) {
      allValid = false;
      if (!firstInvalidField) {
        firstInvalidField = fields[j];
      }
    }
  }

  if (loginAlert) {
    loginAlert.hidden = true;
  }

  if (!allValid) {
    formMessage.textContent = "";
    updateSubmit();
    firstInvalidField.focus();
    return;
  }

  if (form.dataset.authMode) {
    if (window.CockpitAuth) {
      window.CockpitAuth.submitAuthForm(form);
    } else {
      formMessage.textContent = "The account service could not load. Check your connection and Supabase setup, then try again.";
      submitBtn.disabled = false;
    }
    return;
  }

  formMessage.textContent = form.getAttribute("data-success");
  submitBtn.disabled = true;

  setTimeout(function () {
    window.location.href = form.getAttribute("data-next");
  }, 1500);
});

if (toggleBtn) {
  toggleBtn.addEventListener("click", function () {
    if (passwordField.type == "password") {
      passwordField.type = "text";
      toggleBtn.textContent = "👁 Hide";
      toggleBtn.setAttribute("aria-label", "Hide password");
      toggleBtn.setAttribute("aria-pressed", "true");
    }
    else {
      passwordField.type = "password";
      toggleBtn.textContent = "👁 Show";
      toggleBtn.setAttribute("aria-label", "Show password");
      toggleBtn.setAttribute("aria-pressed", "false");
    }
  });
}

updateSubmit();
