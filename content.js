console.log("Chrome extension go!");

var overlayDOM, statsTable;
function setupOverlay() {
  overlayDOM = document.createElement("div");
  overlayDOM.setAttribute("class", "selection_overlay");
  statsTable = document.createElement("table");
  statsTable.setAttribute("class", "selection_table");
  overlayDOM.appendChild(statsTable);
  document.body.appendChild(overlayDOM);
}

function getSelectionText() {
  var text = "";
  if (window.getSelection) {
    text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    text = document.selection.createRange().text;
  }
  return text;
}

function playerLookup(e) {
  chrome.storage.local.get(["powerOn"], (result) => {
    if (result.powerOn) {
      var playerName = getSelectionText();
      playerName = playerName.replace(/(^[:,\s]+)|([:,\s]+$)/g, ""); // trim commas/colons/whitespace
      if (playerName) {
        console.log(playerName);
        chrome.runtime.sendMessage({senderMessage: playerName}, function(response) {
          console.log(response.receiverMessage);
          if (response.receiverMessage === null) return;
          // html inject overlay stuff
          renderOverlay(e.pageX, e.pageY, formatStats(response.receiverMessage));
        });
      }
    }
  })
}

function formatStats(stats) {
  var statsMap = new Map();
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

function renderOverlay(mouseX, mouseY, statsMap) {
  statsTable.textContent = ""; // clear previous data

  var headers = statsTable.insertRow(0);
  headers.setAttribute("class", "headers");
  var ptsHeader = headers.insertCell(0);
  ptsHeader.textContent = "PTS";
  var rebHeader = headers.insertCell(1);
  rebHeader.textContent = "REB";
  var astHeader = headers.insertCell(2);
  astHeader.textContent = "AST";
  var stlHeader = headers.insertCell(3);
  stlHeader.textContent = "STL";
  var blkHeader = headers.insertCell(4);
  blkHeader.textContent = "BLK";
  var tovHeader = headers.insertCell(5);
  tovHeader.textContent = "TOV";
  var fgPctHeader = headers.insertCell(6);
  fgPctHeader.textContent = "FG%";
  var fg3PctHeader = headers.insertCell(7);
  fg3PctHeader.textContent = "3P%";
  var ftPctHeader = headers.insertCell(8);
  ftPctHeader.textContent = "FT%";
  var efgPctHeader = headers.insertCell(9);
  efgPctHeader.textContent = "eFG%";
  var tsPctHeader = headers.insertCell(10);
  tsPctHeader.textContent = "TS%";

  var cells = statsTable.insertRow(1);
  var ptsCell = cells.insertCell(0);
  ptsCell.textContent = statsMap.get("pts").toFixed(1);
  var rebCell = cells.insertCell(1);
  rebCell.textContent = statsMap.get("reb").toFixed(1);
  var astCell = cells.insertCell(2);
  astCell.textContent = statsMap.get("ast").toFixed(1);
  var stlCell = cells.insertCell(3);
  stlCell.textContent = statsMap.get("stl").toFixed(1);
  var blkCell = cells.insertCell(4);
  blkCell.textContent = statsMap.get("blk").toFixed(1);
  var tovCell = cells.insertCell(5);
  tovCell.textContent = statsMap.get("tov").toFixed(1);
  var fgPctCell = cells.insertCell(6);
  fgPctCell.textContent = statsMap.get("fgPct").toFixed(3);
  var fg3PctCell = cells.insertCell(7);
  fg3PctCell.textContent = statsMap.get("fg3Pct").toFixed(3);
  var ftPctCell = cells.insertCell(8);
  ftPctCell.textContent = statsMap.get("ftPct").toFixed(3);
  var efgPctCell = cells.insertCell(9);
  efgPctCell.textContent = statsMap.get("efgPct").toFixed(3);
  var tsPctCell = cells.insertCell(10);
  tsPctCell.textContent = statsMap.get("tsPct").toFixed(3);

  chrome.storage.local.get(["darkMode"], (result) => {
    if (result.darkMode) {
      overlayDOM.style.backgroundColor = "rgba(75, 75, 75, 0.95)";
      overlayDOM.style.borderColor = "#808080";
      overlayDOM.style.boxShadow = "0px 0px 2px 2px #404040";
      statsTable.style.color = "#FFFFFF";
    } else {
      overlayDOM.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
      overlayDOM.style.boxShadow = "0px 0px 2px 2px #D0D0D0";
      overlayDOM.style.borderColor = "#C0C0C0";
      statsTable.style.color = "#000000";
    }
  })
  overlayDOM.style.top = (mouseY - 30) + "px"; // hardcode estimate
  overlayDOM.style.left = mouseX + "px";
  overlayDOM.style.visibility = "visible";
}

chrome.runtime.sendMessage({senderMessage: "getAllPlayersData"}, function(response) {
  console.log(response.receiverMessage);
});

document.onload = setupOverlay();
document.onmouseup = function(e) { playerLookup(e) };
document.onmousedown = function() { overlayDOM.style.visibility = "hidden" };