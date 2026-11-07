var themeBtn = document.getElementById("themeBtn");
var cnt = 0;

if (localStorage.getItem("cockpitTheme") == "light") {
    cnt = 1;
}

function paint(selector, colour) {
    var list = document.querySelectorAll(selector);
    for (var i = 0; i < list.length; i++) {
        list[i].style.backgroundColor = colour;
    }
}

var boxes = ".topbar, .kneeboard, .test-panel, .control-panel, .info-toast, " +
            ".chatbot-panel, .profile-note, .home-test, .activity-row, " +
            ".test-result-dialog, .paper-stamp";
var pages = ".home-screen, .hotspot .tag";

function Mode() {
    if (cnt == 0) {
        document.body.style.backgroundColor = "#161513";
        document.body.style.color = "#ece8df";
        paint(boxes, "#201e1b");
        paint(pages, "#161513");
        themeBtn.textContent = "Light mode";
        localStorage.setItem("cockpitTheme", "dark");
    }
    else {
        document.body.style.backgroundColor = "#f2efe8";
        document.body.style.color = "#1d1d1b";
        paint(boxes, "#fbf9f4");
        paint(pages, "#f2efe8");
        themeBtn.textContent = "Dark mode";
        localStorage.setItem("cockpitTheme", "light");
    }
}

Mode();

themeBtn.onclick = function () {
    if (cnt == 0) {
        cnt = 1;
    }
    else {
        cnt = 0;
    }
    Mode();
};