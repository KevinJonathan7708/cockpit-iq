var helpList = [
  {
    question: "How do I use the checklist?",
    answer: "Choose Takeoff or Landing, then open the checklist. Do the action for the current step using its cockpit control. Steps unlock in order.",
    keywords: ["checklist", "step", "steps", "procedure", "order"]
  },
  {
    question: "How do I use the cockpit controls?",
    answer: "Click a dot on the cockpit picture. Controls you can change open in a small panel. Change the control there, then close the panel.",
    keywords: ["control", "controls", "dot", "marker", "hotspot", "click", "cockpit"]
  },
  {
    question: "How do I change the flap setting?",
    answer: "Click the Flaps dot and pick 0, 10, 20 or 30 degrees. They are classroom examples from the Cessna 172S reference. Do not use the trainer for flight.",
    keywords: ["flap", "flaps"]
  },
  {
    question: "What do the throttle and airspeed controls do?",
    answer: "They change the simulated numbers used by the checklist. The trainer does not copy real flight physics.",
    keywords: ["throttle", "airspeed", "speed", "power"]
  },
  {
    question: "How does test mode work?",
    answer: "Test mode hides the checklist so you do the steps from memory. After 3 mistakes the test ends. You see your result at the end.",
    keywords: ["test", "mistake", "mistakes", "strike", "strikes", "score"]
  },
  {
    question: "Are these real flight instructions?",
    answer: "No. CockpitIQ is a classroom practice project, not flight instruction. For real flying, use the aircraft's current approved manual and qualified flight instruction.",
    keywords: ["real", "poh", "afm", "manual", "safe", "instructions", "instructor"]
  },
  {
    question: "How do I register or sign in?",
    answer: "Use Sign Up to create an account and Sign In to view your saved test results. Employee ID, mobile number, division, and chatbot messages are not sent to your account.",
    keywords: ["register", "signup", "signin", "login", "account", "password", "email"]
  },
  {
    question: "How do I change the theme?",
    answer: "Press the Dark mode or Light mode button in the top bar. Your choice is saved in this browser.",
    keywords: ["theme", "dark", "light", "mode", "colour", "color"]
  },
  {
    question: "Where are the calculators?",
    answer: "The flight calculators are on the dashboard page. Use Glide to find how far you can glide and Density altitude to estimate performance altitude.",
    keywords: ["calculator", "calculate", "glide", "gliding", "density", "altitude", "distance"]
  }
];

var launcher = document.createElement("button");
launcher.type = "button";
launcher.className = "chatbot-launcher";
launcher.textContent = "Ask CockpitIQ";
launcher.setAttribute("aria-expanded", "false");
launcher.setAttribute("aria-controls", "chatbotPanel");

var panel = document.createElement("section");
panel.id = "chatbotPanel";
panel.className = "chatbot-panel";
panel.setAttribute("aria-labelledby", "chatbotTitle");
panel.hidden = true;

panel.innerHTML =
  '<div class="chatbot-header">' +
    '<div><p class="chatbot-eyebrow">ON-DEVICE HELP</p><h2 id="chatbotTitle">CockpitIQ help</h2></div>' +
    '<button type="button" class="chatbot-close" aria-label="Close help">×</button>' +
  '</div>' +
  '<p class="chatbot-intro">Type a question or choose one below.</p>' +
  '<div class="chatbot-messages" role="log" aria-live="polite" aria-relevant="additions"></div>' +
  '<div class="chatbot-input-row">' +
    '<input class="chatbot-input" type="text" maxlength="500" aria-label="Type your question">' +
    '<button class="chatbot-send" type="button">Send</button>' +
  '</div>' +
  '<div class="chatbot-questions"></div>';

document.body.appendChild(panel);
document.body.appendChild(launcher);

var messages = panel.querySelector(".chatbot-messages");
var questionBox = panel.querySelector(".chatbot-questions");
var closeButton = panel.querySelector(".chatbot-close");
var clearButton = document.createElement("button");
clearButton.type = "button";
clearButton.className = "chatbot-clear";
clearButton.textContent = "Clear chat";
var headerActions = document.createElement("div");
headerActions.className = "chatbot-header-actions";
headerActions.appendChild(clearButton);
headerActions.appendChild(closeButton);
panel.querySelector(".chatbot-header").appendChild(headerActions);
var chatbotStatus = document.createElement("p");
chatbotStatus.id = "chatbotStatus";
chatbotStatus.className = "chatbot-status";
chatbotStatus.setAttribute("role", "status");
chatbotStatus.setAttribute("aria-live", "polite");
chatbotStatus.textContent = "Offline help is ready. Chat history stays in this browser.";
panel.insertBefore(chatbotStatus, messages);
var inputBox = panel.querySelector(".chatbot-input");
var sendButton = panel.querySelector(".chatbot-send");
var chatStorageKey = "cockpitiqChatHistoryV1";

for (var i = 0; i < helpList.length; i++) {
  addQuestionButton(helpList[i]);
}

function appendMessages(question, answer) {
  var userMsg = document.createElement("p");
  userMsg.className = "chatbot-message chatbot-message-user";
  userMsg.textContent = question;

  var botMsg = document.createElement("p");
  botMsg.className = "chatbot-message";
  botMsg.textContent = answer;

  messages.appendChild(userMsg);
  messages.appendChild(botMsg);
  messages.scrollTop = messages.scrollHeight;
}

var chatHistory = [];
try {
  var savedChat = JSON.parse(localStorage.getItem(chatStorageKey) || "[]");
  if (Array.isArray(savedChat)) {
    for (var i = 0; i < savedChat.length; i++) {
      var item = savedChat[i];
      if (item && typeof item.question === "string" && typeof item.answer === "string") {
        chatHistory.push(item);
      }
    }
    if (chatHistory.length > 50) {
      chatHistory = chatHistory.slice(chatHistory.length - 50);
    }
  }
} catch (error) {
  chatHistory = [];
}
for (var i = 0; i < chatHistory.length; i++) {
  appendMessages(chatHistory[i].question, chatHistory[i].answer);
}

function addMessages(question, answer) {
  chatHistory.push({ question: question, answer: answer });
  chatHistory = chatHistory.slice(-50);
  appendMessages(question, answer);
  try {
    localStorage.setItem(chatStorageKey, JSON.stringify(chatHistory));
  } catch (error) {
    chatbotStatus.textContent = "Chat history is only available until this page closes because browser storage is unavailable.";
  }
}

function findKeywordAnswer(text) {
  var cleaned = text.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  var words = cleaned.split(" ");
  var bestItem = null;
  var bestScore = 0;

  for (var a = 0; a < helpList.length; a++) {
    var score = 0;
    for (var b = 0; b < helpList[a].keywords.length; b++) {
      for (var c = 0; c < words.length; c++) {
        if (words[c] == helpList[a].keywords[b]) {
          score++;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestItem = helpList[a];
    }
  }

  if (bestItem) {
    return bestItem.answer;
  }
  return "I do not know that yet. Try words like checklist, flaps, throttle, test, theme, register or calculator.";
}

function sendTyped() {
  var text = inputBox.value.trim();
  if (text == "") {
    return;
  }
  inputBox.value = "";
  var answer = findKeywordAnswer(text);
  addMessages(text, answer);
  inputBox.focus();
}

function addQuestionButton(item) {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "chatbot-question";
  button.textContent = item.question;

  button.addEventListener("click", function () {
    addMessages(item.question, item.answer);
  });

  questionBox.appendChild(button);
}

function setPanel(open) {
  panel.hidden = !open;
  launcher.setAttribute("aria-expanded", open ? "true" : "false");
  if (open) {
    inputBox.focus();
  } else {
    launcher.focus();
  }
}

launcher.addEventListener("click", function () {
  setPanel(panel.hidden);
});

closeButton.addEventListener("click", function () {
  setPanel(false);
});

sendButton.addEventListener("click", sendTyped);
clearButton.addEventListener("click", function () {
  chatHistory = [];
  messages.innerHTML = "";
  try {
    localStorage.removeItem(chatStorageKey);
    chatbotStatus.textContent = "Chat history cleared from this browser.";
  } catch (error) {
    chatbotStatus.textContent = "Chat history cleared for this page; browser storage was unavailable.";
  }
});

inputBox.addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    sendTyped();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key == "Escape" && !panel.hidden) {
    setPanel(false);
  }
});
