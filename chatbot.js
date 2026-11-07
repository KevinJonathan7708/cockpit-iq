var helpList = [
  {
    question: "How do I use the checklist?",
    answer: "Choose Takeoff or Landing, then open the checklist. Do the action for the current step using its cockpit control. Steps unlock in order."
  },
  {
    question: "How do I use the cockpit controls?",
    answer: "Click a dot on the cockpit picture. Controls you can change open in a small panel. Change the control there, then close the panel."
  },
  {
    question: "How do I change the flap setting?",
    answer: "Click the Flaps dot and pick 0, 10, 20 or 30 degrees. These are example values only. Check the real aircraft manual (POH/AFM) and ask your instructor."
  },
  {
    question: "What do the throttle and airspeed controls do?",
    answer: "They change the simulated numbers used by the checklist. The trainer does not copy real flight physics."
  },
  {
    question: "How does test mode work?",
    answer: "Test mode hides the checklist so you do the steps from memory. After 3 mistakes the test ends. You see your result at the end."
  },
  {
    question: "Are these real flight instructions?",
    answer: "No. CockpitIQ is a short practice trainer for learning. Always use the real checklist for the aircraft and listen to your instructor."
  }
];

var launcher = document.createElement("button");
launcher.className = "chatbot-launcher";
launcher.textContent = "Ask CockpitIQ";

var panel = document.createElement("section");
panel.className = "chatbot-panel";
panel.hidden = true;

panel.innerHTML =
  '<div class="chatbot-header">' +
    '<div><p class="chatbot-eyebrow">OFFLINE HELP</p><h2>CockpitIQ help</h2></div>' +
    '<button class="chatbot-close" aria-label="Close help">×</button>' +
  '</div>' +
  '<p class="chatbot-intro">Choose a question to see an answer.</p>' +
  '<div class="chatbot-messages"></div>' +
  '<div class="chatbot-questions"></div>';

document.body.appendChild(panel);
document.body.appendChild(launcher);

var messages = panel.querySelector(".chatbot-messages");
var questionBox = panel.querySelector(".chatbot-questions");
var closeButton = panel.querySelector(".chatbot-close");

for (var i = 0; i < helpList.length; i++) {
  addQuestionButton(helpList[i]);
}

function addQuestionButton(item) {
  var button = document.createElement("button");
  button.className = "chatbot-question";
  button.textContent = item.question;

  button.addEventListener("click", function () {
    var userMsg = document.createElement("p");
    userMsg.className = "chatbot-message chatbot-message-user";
    userMsg.textContent = item.question;

    var botMsg = document.createElement("p");
    botMsg.className = "chatbot-message";
    botMsg.textContent = item.answer;

    messages.appendChild(userMsg);
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
  });

  questionBox.appendChild(button);
}

launcher.addEventListener("click", function () {
  panel.hidden = !panel.hidden;
});

closeButton.addEventListener("click", function () {
  panel.hidden = true;
});