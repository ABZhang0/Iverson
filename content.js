console.log("Chrome extension go!");

var overlayDOM, statsTable;
function setupOverlay() {
  overlayDOM = document.createElement('div');
  overlayDOM.setAttribute('class', 'selection_overlay');
  statsTable = document.createElement('table');
  statsTable.setAttribute('class', 'selection_table');
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
  var playerName = getSelectionText();
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

function formatStats(stats) {
  var statsMap = new Map();
  statsMap.set('team', stats[4]);
  statsMap.set('age', stats[5]);
  statsMap.set('gp', stats[6]);
  statsMap.set('gs', stats[7]);
  statsMap.set('min', stats[8]);
  statsMap.set('fgm', stats[9]);
  statsMap.set('fga', stats[10]);
  statsMap.set('fgPct', stats[11]);
  statsMap.set('fg3m', stats[12]);
  statsMap.set('fg3a', stats[13]);
  statsMap.set('fg3Pct', stats[14]);
  statsMap.set('ftm', stats[15]);
  statsMap.set('fta', stats[16]);
  statsMap.set('ftPct', stats[17]);
  statsMap.set('oreb', stats[18]);
  statsMap.set('dreb', stats[19]);
  statsMap.set('reb', stats[20]);
  statsMap.set('ast', stats[21]);
  statsMap.set('stl', stats[22]);
  statsMap.set('blk', stats[23]);
  statsMap.set('tov', stats[24]);
  statsMap.set('pf', stats[25]);
  statsMap.set('pts', stats[26]);
  return statsMap;
}

function renderOverlay(mouseX, mouseY, statsMap) {
  statsTable.innerHTML = ""; // clear previous data
  
  var headers = statsTable.insertRow(0);
  var ptsHeader = headers.insertCell(0);
  ptsHeader.innerHTML = 'PTS';
  var rebHeader = headers.insertCell(1);
  rebHeader.innerHTML = 'REB';
  var astHeader = headers.insertCell(2);
  astHeader.innerHTML = 'AST';
  var stlHeader = headers.insertCell(3);
  stlHeader.innerHTML = 'STL';
  var blkHeader = headers.insertCell(4);
  blkHeader.innerHTML = 'BLK';
  var tovHeader = headers.insertCell(5);
  tovHeader.innerHTML = 'TOV';
  var fgPctHeader = headers.insertCell(6);
  fgPctHeader.innerHTML = 'FG%';
  var fg3PctHeader = headers.insertCell(7);
  fg3PctHeader.innerHTML = '3P%';
  var ftPctHeader = headers.insertCell(8);
  ftPctHeader.innerHTML = 'FT%';

  var cells = statsTable.insertRow(1);
  var ptsCell = cells.insertCell(0);
  ptsCell.innerHTML = statsMap.get('pts');
  var rebCell = cells.insertCell(1);
  rebCell.innerHTML = statsMap.get('reb');
  var astCell = cells.insertCell(2);
  astCell.innerHTML = statsMap.get('ast');
  var stlCell = cells.insertCell(3);
  stlCell.innerHTML = statsMap.get('stl');
  var blkCell = cells.insertCell(4);
  blkCell.innerHTML = statsMap.get('blk');
  var tovCell = cells.insertCell(5);
  tovCell.innerHTML = statsMap.get('tov');
  var fgPctCell = cells.insertCell(6);
  fgPctCell.innerHTML = statsMap.get('fgPct');
  var fg3PctCell = cells.insertCell(7);
  fg3PctCell.innerHTML = statsMap.get('fg3Pct');
  var ftPctCell = cells.insertCell(8);
  ftPctCell.innerHTML = statsMap.get('ftPct');

  overlayDOM.style.top = (mouseY - 30) + 'px'; // hardcode estimate
  overlayDOM.style.left = mouseX + 'px';
  overlayDOM.style.visibility = 'visible';
}

chrome.runtime.sendMessage({senderMessage: "getAllPlayersData"}, function(response) {
  console.log(response.receiverMessage);
});

document.onload = setupOverlay();
document.onmouseup = function(e) { playerLookup(e) };
document.onmousedown = function() { overlayDOM.style.visibility = 'hidden' };