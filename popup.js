window.addEventListener('load', findAndSetVersion);

function findAndSetVersion() {
  document.getElementById("versionText").textContent = chrome.runtime.getManifest().version;
}

var themeSelect = document.getElementById("themeSelect");
themeSelect.addEventListener('click', () => { switchTheme(themeSelect) });

function switchTheme(themeSelect) {
  if (themeSelect.checked) {
    document.body.style.backgroundColor = "#202020";
  } else {
    document.body.style.backgroundColor = "#FFFFFF";
  }
}