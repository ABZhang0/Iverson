console.log("Chrome extension go!");

var overlayDOM, statsTable;
function setupOverlay() {
  overlayDOM = document.createElement("div");
  overlayDOM.setAttribute("id", "selection_overlay");
  statsTable = document.createElement("table");
  statsTable.setAttribute("id", "selection_table");
  overlayDOM.appendChild(statsTable);
  document.body.appendChild(overlayDOM);
}

function getSelectionText() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  }
  return text;
}

function getHighlightLocation() {
  var location = null;
  if (window.getSelection && !(window.getSelection().isCollapsed)) { // fix for search bar highlight
    var range = window.getSelection().getRangeAt(0);
    var marker = document.createElement("span");
    range.insertNode(marker);
    
    var obj = marker;
    var left = 0;
    var top = 0;
    do {
      left += obj.offsetLeft;
      top += obj.offsetTop;
    } while (obj = obj.offsetParent);
    location = { x: left, y: top };
    marker.parentNode.removeChild(marker);
  }
  return location;
}

function playerLookup() {
  chrome.storage.local.get(["powerOn"], (result) => {
    if (result.powerOn) {
      var highlightLocation = getHighlightLocation();
      var playerName = getSelectionText();
      playerName = formatInput(playerName);
      if (playerName) {
        console.log(playerName);
        chrome.runtime.sendMessage({senderMessage: playerName}, function(response) {
          console.log(response.receiverMessage);
          if (response.receiverMessage === null) return;
          // html inject overlay stuff
          chrome.storage.local.get(["careerOn"], (result) => {
            renderOverlay(highlightLocation.x, highlightLocation.y, formatStats(response.receiverMessage, result.careerOn));
          })
        });
      }
    }
  })
}

function formatInput(input) {
  var trimmed = input.replace(/(^[:.,\s]*)|([:.,\s]*$)|(('s)?$)/g, ""); // trim punctuation
  trimmed = trimmed.replace(/[’]/g, "'");
  return trimmed.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // ignore accents/diacritics
}

function formatStats(stats, careerOn) {
  var statsMap = new Map();

  if (careerOn) {
    statsMap.set("team", stats[2]);
    var index = 3;
  } else {
    statsMap.set("team", stats[4]);
    statsMap.set("age", stats[5]);
    var index = 6;
  }
  statsMap.set("gp", stats[index++]);
  statsMap.set("gs", stats[index++]);
  statsMap.set("min", stats[index++]);
  statsMap.set("fgm", stats[index++]);
  statsMap.set("fga", stats[index++]);
  statsMap.set("fgPct", stats[index++]);
  statsMap.set("3pm", stats[index++]);
  statsMap.set("3pa", stats[index++]);
  statsMap.set("3pPct", stats[index++]);
  statsMap.set("ftm", stats[index++]);
  statsMap.set("fta", stats[index++]);
  statsMap.set("ftPct", stats[index++]);
  statsMap.set("oreb", stats[index++]);
  statsMap.set("dreb", stats[index++]);
  statsMap.set("reb", stats[index++]);
  statsMap.set("ast", stats[index++]);
  statsMap.set("stl", stats[index++]);
  statsMap.set("blk", stats[index++]);
  statsMap.set("tov", stats[index++]);
  statsMap.set("pf", stats[index++]);
  statsMap.set("pts", stats[index++]);
  statsMap.set("efgPct", efgCalc(statsMap.get("fgm"), statsMap.get("3pm"), statsMap.get("fga")));
  statsMap.set("tsPct", tsCalc(statsMap.get("pts"), statsMap.get("fga"), statsMap.get("fta")));

  return statsMap;
}

function efgCalc(fgm, fg3m, fga) {
  return ((fgm - fg3m) + (1.5 * fg3m)) / fga;
}

function tsCalc(pts, fga, fta) {
  return pts / (2 * (fga + (0.44 * fta)));
}

function renderOverlay(coordX, coordY, statsMap) {
  statsTable.textContent = ""; // clear previous data
  var index = 0;

  var headers = statsTable.insertRow(0);
  headers.setAttribute("id", "headers");
  var cells = statsTable.insertRow(1);

  chrome.storage.local.get(["gameMinOn", "splitsOn", "efgPctOn", "tsPctOn", "darkMode"], (result) => {
    var statCategories = [];
    if (result.gameMinOn) statCategories.push("GP", "GS", "MIN");
    statCategories.push("PTS", "REB", "AST", "STL", "BLK", "TOV");
    if (result.splitsOn) statCategories.push("FG%", "3P%", "FT%");
    if (result.efgPctOn) statCategories.push("eFG%");
    if (result.tsPctOn) statCategories.push("TS%");
    
    statCategories.forEach((category) => {
      var categoryHeader = headers.insertCell(index);
      categoryHeader.textContent = category;
      var categoryCell = cells.insertCell(index);
      if (["GP", "GS"].indexOf(category) !== -1) {
        categoryCell.textContent = statsMap.get(category.toLowerCase()).toFixed(0);
      } else if (["MIN", "PTS", "REB", "AST", "STL", "BLK", "TOV"].indexOf(category) !== -1) {
        categoryCell.textContent = statsMap.get(category.toLowerCase()).toFixed(1);
      } else if (["FG%", "3P%", "FT%", "eFG%", "TS%"].indexOf(category) !== -1) {
        categoryCell.textContent = statsMap.get((category.toLowerCase()).replace("%", "Pct")).toFixed(3);
      }
      index++;
    })

    if (result.darkMode) {
      overlayDOM.style.backgroundColor = "rgba(75, 75, 75, 0.95)";
      overlayDOM.style.borderColor = "#808080";
      overlayDOM.style.boxShadow = "0px 0px 2px 2px #404040";
      statsTable.style.color = "#FFFFFF";
    } else {
      overlayDOM.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
      overlayDOM.style.boxShadow = "0px 0px 2px 2px #606060";
      overlayDOM.style.borderColor = "#C0C0C0";
      statsTable.style.color = "#000000";
    }

    if ((coordY - overlayDOM.offsetHeight) < 0) {
      overlayDOM.style.top = overlayDOM.offsetHeight + "px";
    } else {
      overlayDOM.style.top = (coordY - overlayDOM.offsetHeight) + "px"; // hardcode estimate
    }

    if ((coordX + overlayDOM.offsetWidth) > window.innerWidth) {
      overlayDOM.style.left = (window.innerWidth - overlayDOM.offsetWidth) + "px";
    } else {
      overlayDOM.style.left = coordX + "px";
    }
    overlayDOM.style.visibility = "visible";
  })
}

chrome.runtime.sendMessage({senderMessage: "getAllPlayersData"}, function(response) {
  console.log(response.receiverMessage);
});

document.onload = setupOverlay();
document.onmouseup = function() { playerLookup() };
document.onmousedown = function() { overlayDOM.style.visibility = "hidden" };