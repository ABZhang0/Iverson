console.log("Chrome extension go!");

var bubbleDOM;
function setupOverlay() {
  bubbleDOM = document.createElement('div');
  bubbleDOM.setAttribute('class', 'selection_bubble');
  document.body.appendChild(bubbleDOM);
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
  var team = stats[4];
  var age = stats[5];
  var gp = stats[6];
  var gs = stats[7];
  var min = stats[8];
  var fgPct = stats[11];
  var fg3Pct = stats[14];
  var ftPct = stats[17];
  var oreb = stats[18];
  var dreb = stats[19];
  var reb = stats[20];
  var ast = stats[21];
  var stl = stats[22];
  var blk = stats[23];
  var tov = stats[24];
  var pf = stats[25];
  var pts = stats[26];
  return 'GP: ' + gp + ', PTS: ' + pts + ', REB: ' + reb + ', AST: ' + ast + ', STL: ' + stl + ', BLK: ' + blk + ', TOV: ' + tov;
}

function renderOverlay(mouseX, mouseY, selection) {
  bubbleDOM.innerHTML = selection;
  bubbleDOM.style.top = (mouseY - 30) + 'px'; // hardcode estimate
  bubbleDOM.style.left = mouseX + 'px';
  bubbleDOM.style.visibility = 'visible';
}

chrome.runtime.sendMessage({senderMessage: "getAllPlayersData"}, function(response) {
  console.log(response.receiverMessage);
});

document.onload = setupOverlay();
document.onmouseup = function(e) { playerLookup(e) };
document.onmousedown = function() { bubbleDOM.style.visibility = 'hidden' };