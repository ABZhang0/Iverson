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
  return trimmed.replace(/[’]/g, "'");
}

function formatStats(stats, careerOn) {
  var statsMap = new Map();

  if (careerOn) {
    statsMap.set("team", stats[2]);
    statsMap.set("gp", stats[3]);
    statsMap.set("gs", stats[4]);
    statsMap.set("min", stats[5]);
    statsMap.set("fgm", stats[6]);
    statsMap.set("fga", stats[7]);
    statsMap.set("fgPct", stats[8]);
    statsMap.set("fg3m", stats[9]);
    statsMap.set("fg3a", stats[10]);
    statsMap.set("fg3Pct", stats[11]);
    statsMap.set("ftm", stats[12]);
    statsMap.set("fta", stats[13]);
    statsMap.set("ftPct", stats[14]);
    statsMap.set("oreb", stats[15]);
    statsMap.set("dreb", stats[16]);
    statsMap.set("reb", stats[17]);
    statsMap.set("ast", stats[18]);
    statsMap.set("stl", stats[19]);
    statsMap.set("blk", stats[20]);
    statsMap.set("tov", stats[21]);
    statsMap.set("pf", stats[22]);
    statsMap.set("pts", stats[23]);
  } else {
    statsMap.set("team", stats[4]);
    statsMap.set("age", stats[5]);
    statsMap.set("gp", stats[6]);
    statsMap.set("gs", stats[7]);
    statsMap.set("min", stats[8]);
    statsMap.set("fgm", stats[9]);
    statsMap.set("fga", stats[10]);
    statsMap.set("fgPct", stats[11]);
    statsMap.set("fg3m", stats[12]);
    statsMap.set("fg3a", stats[13]);
    statsMap.set("fg3Pct", stats[14]);
    statsMap.set("ftm", stats[15]);
    statsMap.set("fta", stats[16]);
    statsMap.set("ftPct", stats[17]);
    statsMap.set("oreb", stats[18]);
    statsMap.set("dreb", stats[19]);
    statsMap.set("reb", stats[20]);
    statsMap.set("ast", stats[21]);
    statsMap.set("stl", stats[22]);
    statsMap.set("blk", stats[23]);
    statsMap.set("tov", stats[24]);
    statsMap.set("pf", stats[25]);
    statsMap.set("pts", stats[26]);
  }
  statsMap.set("efgPct", efgCalc(statsMap.get("fgm"), statsMap.get("fg3m"), statsMap.get("fga")));
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

  chrome.storage.local.get(["gameMinOn"], (result) => {
    if (result.gameMinOn) {
      var gpHeader = headers.insertCell(index);
      gpHeader.textContent = "GP";
      var gpCell = cells.insertCell(index);
      gpCell.textContent = statsMap.get("gp").toFixed(0);
      index++;

      var gsHeader = headers.insertCell(index);
      gsHeader.textContent = "GS";
      var gsCell = cells.insertCell(index);
      gsCell.textContent = statsMap.get("gs").toFixed(0);
      index++;

      var minHeader = headers.insertCell(index);
      minHeader.textContent = "MIN";
      var minCell = cells.insertCell(index);
      minCell.textContent = statsMap.get("min").toFixed(1);
      index++;
    }

    var ptsHeader = headers.insertCell(index);
    ptsHeader.textContent = "PTS";
    var ptsCell = cells.insertCell(index);
    ptsCell.textContent = statsMap.get("pts").toFixed(1);
    index++;

    var rebHeader = headers.insertCell(index);
    rebHeader.textContent = "REB";
    var rebCell = cells.insertCell(index);
    rebCell.textContent = statsMap.get("reb").toFixed(1);
    index++;

    var astHeader = headers.insertCell(index);
    astHeader.textContent = "AST";
    var astCell = cells.insertCell(index);
    astCell.textContent = statsMap.get("ast").toFixed(1);
    index++;

    var stlHeader = headers.insertCell(index);
    stlHeader.textContent = "STL";
    var stlCell = cells.insertCell(index);
    stlCell.textContent = statsMap.get("stl").toFixed(1);
    index++;

    var blkHeader = headers.insertCell(index);
    blkHeader.textContent = "BLK";
    var blkCell = cells.insertCell(index);
    blkCell.textContent = statsMap.get("blk").toFixed(1);
    index++;

    var tovHeader = headers.insertCell(index);
    tovHeader.textContent = "TOV";
    var tovCell = cells.insertCell(index);
    tovCell.textContent = statsMap.get("tov").toFixed(1);
    index++;

    chrome.storage.local.get(["splitsOn"], (result) => {
      if (result.splitsOn) {
        var fgPctHeader = headers.insertCell(index);
        fgPctHeader.textContent = "FG%";
        var fgPctCell = cells.insertCell(index);
        fgPctCell.textContent = statsMap.get("fgPct").toFixed(3);
        index++;

        var fg3PctHeader = headers.insertCell(index);
        fg3PctHeader.textContent = "3P%";
        var fg3PctCell = cells.insertCell(index);
        fg3PctCell.textContent = statsMap.get("fg3Pct").toFixed(3);
        index++;

        var ftPctHeader = headers.insertCell(index);
        ftPctHeader.textContent = "FT%";
        var ftPctCell = cells.insertCell(index);
        ftPctCell.textContent = statsMap.get("ftPct").toFixed(3);
        index++;
      }

      chrome.storage.local.get(["efgPctOn"], (result) => {
        if (result.efgPctOn) {
          var efgPctHeader = headers.insertCell(index);
          efgPctHeader.textContent = "eFG%";
          var efgPctCell = cells.insertCell(index);
          efgPctCell.textContent = statsMap.get("efgPct").toFixed(3);
          index++;
        }

        chrome.storage.local.get(["tsPctOn"], (result) => {
          if (result.tsPctOn) {
            var tsPctHeader = headers.insertCell(index);
            tsPctHeader.textContent = "TS%";
            var tsPctCell = cells.insertCell(index);
            tsPctCell.textContent = statsMap.get("tsPct").toFixed(3);
            index++;
          }
        })
      })
    })
  })

  chrome.storage.local.get(["darkMode"], (result) => {
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