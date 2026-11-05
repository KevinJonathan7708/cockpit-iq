(() => {
  "use strict";

  const helpItems = [
    {
      question: "How do I use the checklist?",
      answer: "Choose Takeoff or Landing, then open the checklist. Complete the action for the current step using its cockpit control. Steps unlock in order.",
    },
    {
      question: "How do I use the cockpit controls?",
      answer: "Select a marker on the cockpit image. Interactive controls open in a separate panel; adjust the control there, then close the panel when you are done.",
    },
    {
      question: "How do I change the flap setting?",
      answer: () => {
        const settings = window.CockpitProfiles?.profile?.settings;
        const takeoff = Number.isFinite(settings?.takeoffFlaps) ? `${settings.takeoffFlaps}°` : "the takeoff value";
        const landing = Number.isFinite(settings?.landingFlaps) ? `${settings.landingFlaps}°` : "the landing value";
        return `Select the Flaps marker and choose a detent with the slider. This profile uses ${takeoff} for takeoff and ${landing} for landing. These are example simulator values; check the aircraft's approved POH/AFM and instructor guidance.`;
      },
    },
    {
      question: "What do the throttle and airspeed controls do?",
      answer: "They change the simulated readouts used by the checklist. The trainer does not model aircraft movement or flight physics.",
    },
    {
      question: "How does test mode work?",
      answer: "Test mode hides the checklist while you complete the procedure from memory. The trainer records mistakes, ends the test at three mistakes, and shows your result when you finish.",
    },
    {
      question: "Does this chatbot work offline?",
      answer: "Yes. It uses this site's local JavaScript file and predefined answers. It has no AI, internet connection, or free-text question input.",
    },
    {
      question: "Are these real flight instructions?",
      answer: "No. CockpitIQ is an abbreviated educational simulator. Always use the specific aircraft's approved POH/AFM checklist and follow your instructor.",
    },
  ];

  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  const launcher = make("button", "chatbot-launcher", "Ask CockpitIQ");
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Open CockpitIQ help chatbot");
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "chatbotPanel");

  const panel = make("section", "chatbot-panel");
  panel.id = "chatbotPanel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-labelledby", "chatbotTitle");

  const header = make("div", "chatbot-header");
  const headerCopy = make("div", "chatbot-header-copy");
  const eyebrow = make("p", "chatbot-eyebrow", "OFFLINE HELP");
  const title = make("h2", "", "CockpitIQ help");
  title.id = "chatbotTitle";
  headerCopy.append(eyebrow, title);

  const close = make("button", "chatbot-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Close help chatbot");
  header.append(headerCopy, close);

  const intro = make("p", "chatbot-intro", "Choose a question to see a quick answer.");
  const messages = make("div", "chatbot-messages");
  messages.setAttribute("role", "log");
  messages.setAttribute("aria-live", "polite");
  messages.setAttribute("aria-relevant", "additions");
  messages.setAttribute("aria-label", "Chat messages");

  const questions = make("div", "chatbot-questions");
  questions.setAttribute("aria-label", "Common questions");

  helpItems.forEach(({ question, answer }) => {
    const button = make("button", "chatbot-question", question);
    button.type = "button";
    button.addEventListener("click", () => {
      const userMessage = make("p", "chatbot-message chatbot-message-user", question);
      const replyText = typeof answer === "function" ? answer() : answer;
      const reply = make("p", "chatbot-message chatbot-message-bot", replyText);
      messages.append(userMessage, reply);
      messages.scrollTop = messages.scrollHeight;
    });
    questions.appendChild(button);
  });

  panel.append(header, intro, messages, questions);
  document.body.append(panel, launcher);

  const setOpen = (open) => {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    if (open) questions.querySelector("button")?.focus();
    else launcher.focus();
  };

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });
})();
