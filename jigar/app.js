
let banana;
let globalPlayers = null;

function handleSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the value of the selected dropdown option
    const dropdownValue = document.getElementById('weeks').value;

    // Save the dropdown value to localStorage
    sessionStorage.setItem('selectedValue', dropdownValue);

    // Refresh the page
    window.location.reload();
    // localStorage.clear();
}

function loadDropdownValue() {
    // Get the saved value from localStorage
    const savedValue = sessionStorage.getItem('selectedValue');
    if (savedValue) {
        // Set the dropdown to the saved value
        document.getElementById('weeks').value = savedValue;
        banana = savedValue; // Update the global variable
    } else {
        const currentDate = new Date();
        const startDate = new Date('09/04/2024');
        const diffTime = Math.abs(currentDate - startDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekCount = Math.floor(diffDays/7)+1;
        // console.log("Week "+weekCount);
        banana = weekCount;
        document.getElementById('weeks').value = weekCount;
    }
}

// Load the saved dropdown value when the page loads
// window.onload = loadDropdownValue;

window.onload = async () => {

    // const players = await getPlayers();
    // if (!players) throw new Error('No players found');

    loadDropdownValue();  // Ensures `banana` is set first
    await refreshData();  // Initial data fetch
    // Set up an interval to refresh the data every 10 seconds
    setInterval(refreshData, 10000);  // Refresh data every 10,000 ms (10 seconds)
};

// Fetch User ID by Sleeper Username
const getUserID = async (username) => {
    try {
        const response = await fetch(`https://api.sleeper.app/v1/user/${username}`);
        if (!response.ok) throw new Error(`Error fetching User ID: ${response.status}`);
        const data = await response.json();
        return data.user_id;
    } catch (error) {
        console.error("Error in getUserID: ", error);
    }
};

// Fetch Leagues
const getLeagues = async (userID) => {
    try {
        const response = await fetch(`https://api.sleeper.app/v1/user/${userID}/leagues/nfl/2024`);
        if (!response.ok) throw new Error(`Error fetching leagues: ${response.status}`);
        const leagues = await response.json();
        return leagues;
    } catch (error) {
        console.error("Error in getLeagues: ", error);
    }
};

// Fetch Rosters for the League
const getRosters = async (leagueID) => {
    try {
        const response = await fetch(`https://api.sleeper.app/v1/league/${leagueID}/rosters`);
        if (!response.ok) throw new Error(`Error fetching rosters: ${response.status}`);
        const rosters = await response.json();
        return rosters;
    } catch (error) {
        console.error("Error in getRosters: ", error);
    }
};

// Fetch Matchups for the League based on selected week (banana value)
const getMatchups = async (leagueID) => {
    try {
        const response = await fetch(`https://api.sleeper.app/v1/league/${leagueID}/matchups/${banana}`);
        if (!response.ok) throw new Error(`Error fetching matchups: ${response.status}`);
        const matchups = await response.json();
        return matchups;
    } catch (error) {
        console.error("Error in getMatchups: ", error);
    }
};

// Fetch Player Info
const getPlayers = async () => {
    try {
        const response = await fetch('https://api.sleeper.app/v1/players/nfl');
        if (!response.ok) throw new Error(`Error fetching players: ${response.status}`);
        const players = await response.json();
        return players;
    } catch (error) {
        console.error("Error in getPlayers: ", error);
    }
};

function getPlayerNameAndPosition(playerId) {
    return globalPlayers[playerId]['first_name'].concat(" ",globalPlayers[playerId]['last_name'],", ",globalPlayers[playerId]['position']);
}

function assignTextContent(element, text) {
    element.textContent = text;
}

function getPlayerPoints(playerId,matchup) {
    return matchup.players_points[playerId];
}

function addRowWith2Values(body, value1, value2) {
    var row = document.createElement('tr');
    var cell1 = document.createElement('td');
    var cell2 = document.createElement('td');
    assignTextContent(cell1,value1);
    assignTextContent(cell2,value2);
    row.appendChild(cell1);
    row.appendChild(cell2);
    body.appendChild(row);
}

function addRowWith4Values(body, value1, value2, value3, value4) {
    var row = document.createElement('tr');
    var cell1 = document.createElement('td');
    var cell2 = document.createElement('td');
    var cell3 = document.createElement('td');
    var cell4 = document.createElement('td');
    assignTextContent(cell1,value1);
    assignTextContent(cell2,value2);
    assignTextContent(cell3,value3);
    assignTextContent(cell4,value4);
    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(cell4);
    body.appendChild(row);
}

function createTable(matchups, rosterId, body) {
    matchups.forEach(matchup => {
        if (matchup.roster_id == rosterId) {
            addRowWith2Values(body,"Starters","Points");
            matchup.starters.forEach(playerId => {
                addRowWith2Values(body,getPlayerNameAndPosition(playerId),getPlayerPoints(playerId,matchup));
            });
            addRowWith2Values(body,"Total",matchup['points']);
            addRowWith2Values(body,"Bench","Points");
            matchup.players.filter(x => !matchup.starters.includes(x)).forEach(playerId => {
                addRowWith2Values(body,getPlayerNameAndPosition(playerId),getPlayerPoints(playerId,matchup));
            });
        }
    });
}

// function createOpponentTable(matchups, rosterId, body, players) {
//     matchups.forEach(matchup => {
//         if (matchup.roster_id == rosterId) {
//             addRowWith2Values(body,"Points","Starters");
//             matchup.starters.forEach(playerId => {
//                 addRowWith2Values(body,getPlayerPoints(playerId,matchup),getPlayerNameAndPosition(playerId,players));
//             });
//             addRowWith2Values(body,matchup['points'],"Total");
//             addRowWith2Values(body,"Points","Bench");
//             matchup.players.filter(x => !matchup.starters.includes(x)).forEach(playerId => {
//                 addRowWith2Values(body,getPlayerPoints(playerId,matchup),getPlayerNameAndPosition(playerId,players));
//             });
//         }
//     });
// }

function getMatchupId(matchups,rosterId) {
    // console.log(matchups[rosterId-1]['matchup_id']);
    return matchups[rosterId-1]['matchup_id'];
}

function getOppRosterId(matchups,matchupId,rosterId) {
    for (let matchup = 0; matchup < matchups.length; matchup++) {
    // matchups.forEach(matchup => {
        // console.log(matchup);
        // console.log(matchupId);
        if ((matchups[matchup]['matchup_id'] == matchupId)&&(!(matchups[matchup]['roster_id']==rosterId))) {
            // console.log("HELLO");
            // console.log(matchup);
            // console.log(matchup['roster_id']);
            return matchups[matchup]['roster_id'];
        }
    };
}

function getPlayersPoints(matchups, rosterId) {
    return matchups[rosterId-1].players_points;
}

function getAllPlayers(matchups,rosterId) {
    return matchups[rosterId-1].players;
}

function getStarters(matchups, rosterId) {
    // console.log(matchups[rosterId-1].starters);
    // console.log("reached");
    return matchups[rosterId-1].starters;
}

function getTotalPoints(matchups, rosterId) {
    return matchups[rosterId-1]['points'];
}

function getBench(players,starters) {
    return players.filter(x => !starters.includes(x));
}

function createWholeTable(matchups, rosterId, body) {
    var matchupId = getMatchupId(matchups,rosterId);
    var oppRosterId = getOppRosterId(matchups,matchupId,rosterId);
    // console.log(getOppRosterId(matchups,matchupId,rosterId));
    var myStarters = getStarters(matchups,rosterId);
    // console.log(oppRosterId);
    var oppStarters = getStarters(matchups,oppRosterId);
    // console.log(oppStarters);
    var allMyPlayers = getAllPlayers(matchups,rosterId);
    var allOppPlayers = getAllPlayers(matchups,oppRosterId);
    var myBench = getBench(allMyPlayers,myStarters);
    var oppBench = getBench(allOppPlayers,oppStarters);
    var myPlayersPoints = getPlayersPoints(matchups,rosterId);
    var oppPlayersPoints = getPlayersPoints(matchups,oppRosterId);
    addRowWith4Values(body,"My Starters","Points","Points","Opponent Starters");
    if (myStarters.length==oppStarters.length) {
        for(playerIndex in myStarters) {
            addRowWith4Values(body,getPlayerNameAndPosition(myStarters[playerIndex]),myPlayersPoints[myStarters[playerIndex]],oppPlayersPoints[oppStarters[playerIndex]],getPlayerNameAndPosition(oppStarters[playerIndex]));
        }
    } else {
        console.log("STARTERS LENGTH DOES NOT MATCH");
    }
    addRowWith4Values(body,"Total",getTotalPoints(matchups,rosterId),getTotalPoints(matchups,oppRosterId),"Total");
    addRowWith4Values(body,"My Bench","Points","Points","Opponent Bench");
    // if (myBench.length==oppBench.length) {
        for(playerIndex in myBench) {
            addRowWith4Values(body,getPlayerNameAndPosition(myBench[playerIndex]),myPlayersPoints[myBench[playerIndex]],oppPlayersPoints[oppBench[playerIndex]],getPlayerNameAndPosition(oppBench[playerIndex]));
        }
    // } else {
    //     console.log("BENCH LENGTH DOES NOT MATCH");
    // }
}

// Update the UI with Player Names
const updateleague1Info = (matchups) => {
    let league1 = document.getElementById("league1");
    league1.innerHTML = ''; // Clear table before updating
    // matchups.forEach(matchup => {
        createWholeTable(matchups,9,league1);
    // });
};

// const updateleague2Info = (matchups) => {
//     let league2 = document.getElementById("league2");
//     league2.innerHTML = ''; // Clear table before updating
//     // matchups.forEach(matchup => {
//         createWholeTable(matchups,11,league2);
//     // });
// };

// const updateleague3Info = (matchups) => {
//     let league3 = document.getElementById("league3");
//     league3.innerHTML = ''; // Clear table before updating
//     // matchups.forEach(matchup => {
//         createWholeTable(matchups,4,league3);
//     // });
// };

// Fetch Data
const refreshData = async () => {
    try {
        document.getElementById("loading-spinner").style.display = "block";
        const userID = await getUserID('jigggga');
        if (!userID) throw new Error('No user ID found');

        const leagues = await getLeagues(userID);
        if (!leagues || leagues.length === 0) throw new Error('No leagues found');

        if (!globalPlayers) {
            globalPlayers = await getPlayers();
            if (!globalPlayers) throw new Error('No players found');
        }

        // const rosters = await getRosters(leagues[0].league_id);
        // if (!rosters) throw new Error('No rosters found');

        const matchups1 = await getMatchups(leagues[0].league_id);
        if (!matchups1) throw new Error('No matchups found');

        const matchups2 = await getMatchups(leagues[1].league_id);
        if (!matchups2) throw new Error('No matchups found');

        // const matchups3 = await getMatchups(leagues[2].league_id);
        // if (!matchups3) throw new Error('No matchups found');

        // updatePlayerInfo(rosters);
        updateleague1Info(matchups1);
        // updateleague2Info(matchups2);
        // updateleague3Info(matchups3);
        // updateTotalInfo(matchups);
        // updateBenchInfo(matchups,players);
    } catch (error) {
        console.error("Error in refreshData: ", error);
    } finally {
        document.getElementById("loading-spinner").style.display = "none";
    }
};

// Initial Data Fetch
refreshData();