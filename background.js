chrome.runtime.onInstalled.addListener(
  function() {
    chrome.storage.local.set({ powerOn: true });
    chrome.storage.local.set({ darkMode: true });
    chrome.storage.local.set({ gameMinOn: false });
    chrome.storage.local.set({ splitsOn: false });
    chrome.storage.local.set({ efgPctOn: false });
    chrome.storage.local.set({ tsPctOn: false });
  }
)

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.senderMessage == "getAllPlayersData") {
			getAllPlayers(() => {
				sendResponse({receiverMessage: "got all players data"});
			});
    } else {
			getPlayerStats(request.senderMessage, (response) => {
				sendResponse({receiverMessage: response});
			});
    }
    return true;
  }
);

function getAllPlayers(callback) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() { 
    if (xhr.readyState == 4 && xhr.status == 200) {
      var jsonResponse = JSON.parse(xhr.responseText);
      var jsonPlayers = jsonResponse.resultSets[0].rowSet;
      var mappedPlayers = {};
      jsonPlayers.forEach(function(jsonPlayer) {
        mappedPlayers[jsonPlayer[2]] = jsonPlayer[0];
      })
      console.log(mappedPlayers);
      chrome.storage.local.set({ activePlayers: mappedPlayers }, function() {
				console.log("commonallplayers data saved");
				callback();
      });
    }
  };
  xhr.open("GET", "https://stats.nba.com/stats/commonallplayers/?LeagueID=00&Season=2018-19&IsOnlyCurrentSeason=1", true); // true for async
  xhr.send(null);
}

function getPlayerStats(playerName, callback) {
  chrome.storage.local.get(["activePlayers"], function(result) {
    var playerID = result.activePlayers[playerName];
    if (!playerID) {
      console.log("invalid player name");
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var jsonResponse = JSON.parse(xhr.responseText);
        var totalPlayerStats = jsonResponse.resultSets[0].rowSet; // index 0 for current regular season
        var playerStats;
        totalPlayerStats.forEach((season) => { if (season[1] === "2018-19") playerStats = season })
				if (playerStats) {
          console.log(playerStats);
				  console.log("individual player stats retrieved");
        } else {
          console.log("unable to retrieve player stats for selected season");
        }
				callback(playerStats);
      }
    }
    xhr.open("GET", "https://stats.nba.com/stats/playerprofilev2/?PerMode=PerGame&PlayerID=" + playerID, true);
    xhr.send(null);
	});
}