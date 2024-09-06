
let banana;

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
        console.log("Week "+weekCount);
        banana = weekCount;
        document.getElementById('weeks').value = weekCount;
    }
}

// Load the saved dropdown value when the page loads
window.onload = loadDropdownValue;

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

// Update the UI with Player Names
const updateStartersInfo = (matchups, players) => {
    const startersBody = document.getElementById("starters-body");
    startersBody.innerHTML = ''; // Clear table before updating

    matchups.forEach(matchup => {
        if (matchup.roster_id == 8) {
            matchup.starters.forEach(playerId => {
                const row = document.createElement('tr');
                const playerCell = document.createElement('td');
                const pointCell = document.createElement('td');

                playerCell.textContent = playerId.concat(" ", players[playerId]['first_name'], " ", players[playerId]['last_name'], ", ", players[playerId]['fantasy_positions']);
                pointCell.textContent = matchup.players_points[playerId];
                
                row.appendChild(playerCell);
                row.appendChild(pointCell);
                startersBody.appendChild(row);
            });
            const row = document.createElement('tr');
            const totalCell = document.createElement('td');
            const pointCell = document.createElement('td');
            totalCell.textContent = "Total";
            pointCell.textContent = matchup['points'];
            row.appendChild(totalCell);
            row.appendChild(pointCell);
            startersBody.appendChild(row);
        }
    });
};

// // Update the UI with Player Names
// const updateTotalInfo = (matchups) => {
//     const totalHeader = document.getElementById("total-header");
//     totalHeader.innerHTML = ''; // Clear table before updating

//     matchups.forEach(matchup => {
//         if (matchup.roster_id == 8) {
//             const row = document.createElement('tr');
//             const totalCell = document.createElement('td');
//             const pointCell = document.createElement('td');
//             totalCell.textContent = "Total";
//             pointCell.textContent = matchup['points'];
//             row.appendChild(totalCell);
//             row.appendChild(pointCell);
//             totalHeader.appendChild(row);
//         }
//     });
// };

const updateBenchInfo = (matchups,players) => {
    const benchBody = document.getElementById("bench-body");
    benchBody.innerHTML = ''; // Clear table before updating
    matchups.forEach(matchup => {
        if (matchup.roster_id == 8) {
            (matchup.players.filter(x => !matchup.starters.includes(x))).forEach(playerId => {
                const row = document.createElement('tr');
                const playerCell = document.createElement('td');
                const pointCell = document.createElement('td');
                // console.log(players.playerId['first_name']);
                playerCell.textContent = playerId.concat(" ",players[playerId]['first_name']," ",players[playerId]['last_name'],", ",players[playerId]['fantasy_positions']);
                // playerCell.textContent = playerId;
                pointCell.textContent = matchup.players_points[playerId];
                row.appendChild(playerCell);
                row.appendChild(pointCell);
                benchBody.appendChild(row);
            })
        }
    });
};

// Fetch Data
const refreshData = async () => {
    try {
        document.getElementById("loading-spinner").style.display = "block";
        const userID = await getUserID('pateludit87');
        if (!userID) throw new Error('No user ID found');

        const leagues = await getLeagues(userID);
        if (!leagues || leagues.length === 0) throw new Error('No leagues found');

        const rosters = await getRosters(leagues[0].league_id);
        if (!rosters) throw new Error('No rosters found');

        const matchups = await getMatchups(leagues[0].league_id);
        if (!matchups) throw new Error('No matchups found');
        
        const players = await getPlayers();
        if (!players) throw new Error('No players found');

        // updatePlayerInfo(rosters);
        updateStartersInfo(matchups,players);
        // updateTotalInfo(matchups);
        updateBenchInfo(matchups,players);
    } catch (error) {
        console.error("Error in refreshData: ", error);
    } finally {
        document.getElementById("loading-spinner").style.display = "none";
    }
};

// Initial Data Fetch
refreshData();