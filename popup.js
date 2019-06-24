function findAndSetVersion() {
  console.log('test');
  console.log(chrome.runtime.getManifest().version);
  document.getElementById("version").innerHTML = chrome.runtime.getManifest().version;
}