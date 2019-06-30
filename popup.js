var powerSwitch = document.getElementById("powerSwitch");
var themeSelect = document.getElementById("themeSelect");
var careerSelect = document.getElementById("careerSelect");
var gameMinSelect = document.getElementById("gameMinSelect");
var splitsSelect = document.getElementById("splitsSelect");
var efgPctSelect = document.getElementById("efgPctSelect");
var tsPctSelect = document.getElementById("tsPctSelect");

window.addEventListener("load", findAndSetVersion);

function findAndSetVersion() {
  document.getElementById("versionText").textContent = chrome.runtime.getManifest().version;
}

window.addEventListener("load", calibrateSettings);

function calibrateSettings() {
  chrome.storage.local.get(["powerOn", "darkMode", "careerOn", "gameMinOn", "splitsOn", "efgPctOn", "tsPctOn"], (result) => {
    powerSwitch.checked = result.powerOn;
    power(powerSwitch);

    themeSelect.checked = result.darkMode;
    switchTheme(themeSelect);

    careerSelect.checked = result.careerOn;
    switchCareer(careerSelect);

    gameMinSelect.checked = result.gameMinOn;
    switchGameMin(gameMinSelect);

    splitsSelect.checked = result.splitsOn;
    switchShootingSplits(splitsSelect);

    efgPctSelect.checked = result.efgPctOn;
    switchEfgPct(efgPctSelect);

    tsPctSelect.checked = result.tsPctOn;
    switchTsPct(tsPctSelect);
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

careerSelect.addEventListener("click", () => { switchCareer(careerSelect) });

function switchCareer(careerSelect) {
  if (careerSelect.checked) {
    chrome.storage.local.set({ careerOn: true });
  } else {
    chrome.storage.local.set({ careerOn: false });
  }
}

gameMinSelect.addEventListener("click", () => { switchGameMin(gameMinSelect) });

function switchGameMin(gameMinSelect) {
  if (gameMinSelect.checked) {
    chrome.storage.local.set({ gameMinOn: true });
  } else {
    chrome.storage.local.set({ gameMinOn: false });
  }
}

splitsSelect.addEventListener("click", () => { switchShootingSplits(splitsSelect) });

function switchShootingSplits(splitsSelect) {
  if (splitsSelect.checked) {
    chrome.storage.local.set({ splitsOn: true });
  } else {
    chrome.storage.local.set({ splitsOn: false });
  }
}

efgPctSelect.addEventListener("click", () => { switchEfgPct(efgPctSelect) });

function switchEfgPct(efgPctSelect) {
  if (efgPctSelect.checked) {
    chrome.storage.local.set({ efgPctOn: true });
  } else {
    chrome.storage.local.set({ efgPctOn: false });
  }
}

tsPctSelect.addEventListener("click", () => { switchTsPct(tsPctSelect) });

function switchTsPct(tsPctSelect) {
  if (tsPctSelect.checked) {
    chrome.storage.local.set({ tsPctOn: true });
  } else {
    chrome.storage.local.set({ tsPctOn: false });
  }
}