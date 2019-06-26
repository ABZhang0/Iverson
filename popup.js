var powerSwitch = document.getElementById("powerSwitch");
var themeSelect = document.getElementById("themeSelect");

window.addEventListener("load", findAndSetVersion);

function findAndSetVersion() {
  document.getElementById("versionText").textContent = chrome.runtime.getManifest().version;
}

window.addEventListener("load", calibrateSettings);

function calibrateSettings() {
  chrome.storage.local.get(["powerOn", "darkMode"], (result) => {
    powerSwitch.checked = result.powerOn;
    power(powerSwitch);
    themeSelect.checked = result.darkMode;
    switchTheme(themeSelect);
  })
}

powerSwitch.addEventListener("click", () => { power(powerSwitch) });

function power(powerSwitch) {
  if (powerSwitch.checked) {
    document.getElementById("titleLink").style.color = "#ED174C";
    chrome.storage.local.set({ powerOn: true });
  } else {
    document.getElementById("titleLink").style.color = "#C4CED4";
    chrome.storage.local.set({ powerOn: false });
  }
}

themeSelect.addEventListener("click", () => { switchTheme(themeSelect) });

function switchTheme(themeSelect) {
  if (themeSelect.checked) {
    document.body.style.backgroundColor = "#202020";
    document.getElementById("versionText").style.color = "#C4CED4";
    document.getElementById("optionsTable").style.color = "#FFFFFF";
    chrome.storage.local.set({ darkMode: true });
  } else {
    document.body.style.backgroundColor = "#FFFFFF";
    document.getElementById("versionText").style.color = "#002B5C";
    document.getElementById("optionsTable").style.color = "#000000";
    chrome.storage.local.set({ darkMode: false });
  }
}