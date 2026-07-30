const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// --- MASTER DATA ---
const leagueConfig = {
    "CCS": { rounds: 3, cap: 5550, minMmr: 1670, maxMmr: 9999 },
    "CPL": { rounds: 3, cap: 5000, minMmr: 1560, maxMmr: 1739 },
    "CAS": { rounds: 3, cap: 4650, minMmr: 1450, maxMmr: 1599 },
    "CNL": { rounds: 5, cap: 4275, minMmr: 0, maxMmr: 1479 }
};

const orgData = [
    { org: "Shockwave", passcode: "3105", ccs: "Shockwave", cpl: "Sonic Boom", cas: "Surge", cnl: "Sound" },
    { org: "Blasters", passcode: "7241", ccs: "Blasters", cpl: "Mortars", cas: "Cannons", cnl: "Ballistics" },
    { org: "Stars", passcode: "1983", ccs: "Stars", cpl: "Supernova", cas: "Astronauts", cnl: "Rovers" },
    { org: "Pirates", passcode: "5620", ccs: "Pirates", cpl: "Marauders", cas: "Conquerors", cnl: "Shipwreck" },
    { org: "Howlers", passcode: "4319", ccs: "Howlers", cpl: "Coyotes", cas: "Wolfpack", cnl: "Timberwolves" },
    { org: "Moose", passcode: "9054", ccs: "Moose", cpl: "Groundhogs", cas: "Black Bears", cnl: "Ducks" },
    { org: "Ninjas", passcode: "2876", ccs: "Ninjas", cpl: "Shadows", cas: "Prowlers", cnl: "Thieves" },
    { org: "Samurai", passcode: "6148", ccs: "Samurai", cpl: "Warriors", cas: "Shaman", cnl: "Bushido" },
    { org: "Flyers", passcode: "8532", ccs: "Flyers", cpl: "Lory", cas: "Skyhawks", cnl: "Redwings" },
    { org: "Anglers", passcode: "1409", ccs: "Anglers", cpl: "Fishermen", cas: "Behemoths", cnl: "Leviathans" },
    { org: "Vipers", passcode: "3762", ccs: "Vipers", cpl: "Cobras", cas: "Copperheads", cnl: "Anacondas" },
    { org: "Zebras", passcode: "9521", ccs: "Zebras", cpl: "Buffalo", cas: "Elephants", cnl: "Rhinos" }
];

let teams = [];
let idCounter = 1;
orgData.forEach(o => {
    teams.push({ id: idCounter++, org: o.org, name: o.ccs, league: "CCS", mmrCap: leagueConfig.CCS.cap, roster: [] });
    teams.push({ id: idCounter++, org: o.org, name: o.cpl, league: "CPL", mmrCap: leagueConfig.CPL.cap, roster: [] });
    teams.push({ id: idCounter++, org: o.org, name: o.cas, league: "CAS", mmrCap: leagueConfig.CAS.cap, roster: [] });
    teams.push({ id: idCounter++, org: o.org, name: o.cnl, league: "CNL", mmrCap: leagueConfig.CNL.cap, roster: [] });
});

let players = [];
const rawPlayers = [
    ["Jerid",2050],["nuke",2047],["Rozanz",1979],["Knowsis",1953],["oatmealgobbler81",1946],["Cholica",1938],["Sylvia",1925],["Blezzy",1921],["Dyloh",1887],["Cye",1884],["Guardog",1869],["dainbramage",1863],["Nautikl",1850],["bikkxs",1840],["Caleb",1838],["Cristian",1837],["dxge",1834],["kizvy",1831],["zazu",1824],["wrld",1815],["Spo",1812],["EliTW22Playz",1811],["Rac1n",1811],["iLL",1805],["Cyan",1805],["GLO",1802],["Tomato",1800],["Silwoe",1799],["Cosmik",1797],["Blisc",1797],["Rye-In",1794],["souls",1792],["Grizz",1792],["Grisly",1777],["Beast ^-^",1776],["driftz.",1772],["solurr",1765],["Ryan :]",1761],["Poptarts.",1755],["Joey",1741],["oofy",1740],["Slykooper_",1739],["Ant",1726],["DJ",1716],["codyzerra",1711],["HogdoBogdo",1711],["Landon",1710],["kaza",1708],["Cxrsed",1694],["Panda",1693],["Nirv",1688],["Nlyu",1684],["buddy",1672],["haz",1668],["knoinee",1668],["Uro.-",1667],["BamBam",1665],["Decaf",1664],["Thermal",1661],["Rev.",1660],["Syndarkttv23 ",1658],["Ciel",1656],["DarkGalaxiess",1652],["Clutch",1652],["proph",1646],["arctix",1645],["Guccianii",1644],["killua",1638],["LuvJames.",1635],["Meepomic",1634],["Spongey",1632],["Skyout",1623],["path678",1617],["ink",1616],["logansnyper",1613],["Moon/moon dual either work",1612],["Large Microwave",1611],["Merrill",1601],["clovel",1601],["Pax",1593],["An7iix",1592],["JT",1584],["Loomeister.",1582],["Hate.",1582],["BluePhoenix",1580],["Kr0ski",1577],["Greed",1574],["Dsyrjames ",1568],[".stepdot",1568],["Lil a",1565],["Ren",1560],["Chrome Moisty",1555],["REEF",1553],["Cryptid",1547],["s n w y.",1544],["Slayer2k",1544],["jkn (pronounced j-kin)",1536],["JugPanda",1534],["Haakonn",1534],["Prospex",1533],["Tryna",1530],["KRZ",1529],["Steve4244 ",1527],["CyanLG",1525],["Bankai",1522],["Gabe",1521],["botco",1519],["Prod",1519],["T-0-X.",1519],["Icey",1510],["Fast Layne",1506],["Cal-el",1506],["Dr Scrawny",1505],["Marchosias",1504],["gray",1483],["Speacial",1482],["Spxrr",1480],["Twiz",1477],["Fire",1475],["Skelly",1471],["Onixx",1466],["Geriatric Trout",1462],["RansomeLP",1459],["violence",1458],["Carsxnn.",1457],["deplooped",1455],["Terbiee",1455],["Sports",1451],["Nirosat",1450],["Embers",1447],["Pluooh",1445],["Ghoulze",1440],["TazzyMike",1439],["Yovanny",1437],["Striker",1429],["Vex",1428],["seori",1425],["Kaze",1413],["Killer",1413],["Spiral",1405],["moneykmt",1400],["GeloBoi",1397],["Yusvanny",1395],["oose",1395],["apat8",1387],["Quackz ",1387],["Sufft",1387],["benito.",1371],["Jux",1370],["Mup",1355],["Zooted4u",1349],["bEn",1349],["Nava/ Banana",1346],["Shadow",1332],["C1 Jack",1327],["Zenified",1327],["Ripshark",1314],["MrPenguin",1311],["bobo8bit",1309],["Bacon",1308],["phyllomedusa",1290],["DrisonX",1285],["DTB_Bubbaa",1280],["Callan",1279],["TheThickestStick ",1278],["Steamy",1263],["KaosZaxel",1259],["Nate507",1254],["Bluedreamz",1252],["Swazcy",1251],["Zareth",1245],["Burner",1223],["ClamSplitta",1207],["Fearless",1198],["Grizzwald",1190],["Tiki",1173],["Boondock",1172],["pugcat ",1164],["bing_di",1151],["Envi",1127],["Plop",1118],["JD",1117],["XoticCantClip",1113],["Nexotic",1094],["Crystalized33",1077],["Thepooploop",1074],["Sneak",1064],["kaiden",1060],["OvrCookdBred",1053],["Astrofortune ",1032],["skxttles",1020],["Careless",1020],["Cheese Cake",1019],["Penguin",1017],["SirQuinneth ",993],["Fable",973],["Ben IV rl",956],["Tother",900],["stax",849],["Genesis",783]
];
rawPlayers.forEach((p, i) => players.push({ id: i + 1, name: p[0], mmr: p[1], draftedBy: null }));

// --- KEEPER DATA INITIALIZATION ---
const keeperData = [
    { org: "Anglers", league: "CCS", round: 1, playerName: "Nautikl" },
    { org: "Anglers", league: "CCS", round: 2, playerName: "wrld" },
    { org: "Anglers", league: "CCS", round: 3, playerName: "Grizz" },
    { org: "Anglers", league: "CPL", round: 2, playerName: "Thermal" },
    { org: "Anglers", league: "CAS", round: 3, playerName: "CyanLG" },
    { org: "Anglers", league: "CNL", round: 5, playerName: "Burner" },
    { org: "Blasters", league: "CCS", round: 1, playerName: "Blezzy" },
    { org: "Blasters", league: "CPL", round: 2, playerName: "Decaf" },
    { org: "Blasters", league: "CAS", round: 2, playerName: "Chrome Moisty" },
    { org: "Blasters", league: "CAS", round: 3, playerName: "Cal-el" },
    { org: "Blasters", league: "CNL", round: 1, playerName: "Fire" },
    { org: "Blasters", league: "CNL", round: 2, playerName: "deplooped" },
    { org: "Blasters", league: "CNL", round: 4, playerName: "Shadow" },
    { org: "Flyers", league: "CCS", round: 3, playerName: "oofy" },
    { org: "Flyers", league: "CPL", round: 1, playerName: "Ant" },
    { org: "Flyers", league: "CPL", round: 3, playerName: "Meepomic" },
    { org: "Flyers", league: "CNL", round: 2, playerName: "Striker" },
    { org: "Flyers", league: "CNL", round: 3, playerName: "Sufft" },
    { org: "Flyers", league: "CNL", round: 5, playerName: "Nate507" },
    { org: "Howlers", league: "CCS", round: 3, playerName: "Ryan :]" },
    { org: "Howlers", league: "CPL", round: 3, playerName: "arctix" },
    { org: "Howlers", league: "CAS", round: 1, playerName: "BluePhoenix" },
    { org: "Howlers", league: "CNL", round: 3, playerName: "Yusvanny" },
    { org: "Howlers", league: "CNL", round: 5, playerName: "KaosZaxel" },
    { org: "Moose", league: "CAS", round: 1, playerName: "Pax" },
    { org: "Moose", league: "CAS", round: 2, playerName: "Lil a" },
    { org: "Moose", league: "CAS", round: 3, playerName: "Geriatric Trout" },
    { org: "Moose", league: "CNL", round: 3, playerName: "Zooted4u" },
    { org: "Moose", league: "CNL", round: 4, playerName: "Bacon" },
    { org: "Ninjas", league: "CCS", round: 1, playerName: "Cye" },
    { org: "Ninjas", league: "CCS", round: 2, playerName: "kizvy" },
    { org: "Ninjas", league: "CCS", round: 3, playerName: "Joey" },
    { org: "Ninjas", league: "CPL", round: 1, playerName: "kaza" },
    { org: "Pirates", league: "CPL", round: 1, playerName: "Slykooper_" },
    { org: "Pirates", league: "CPL", round: 2, playerName: "DarkGalaxiess" },
    { org: "Pirates", league: "CPL", round: 3, playerName: "Loomeister." },
    { org: "Samurai", league: "CCS", round: 3, playerName: "solurr" },
    { org: "Samurai", league: "CPL", round: 3, playerName: "Guccianii" },
    { org: "Samurai", league: "CAS", round: 1, playerName: "An7iix" },
    { org: "Samurai", league: "CAS", round: 3, playerName: "Fast Layne" },
    { org: "Samurai", league: "CNL", round: 2, playerName: "Kaze" },
    { org: "Shockwave", league: "CCS", round: 3, playerName: "Beast ^-^" },
    { org: "Shockwave", league: "CPL", round: 1, playerName: "Nlyu" },
    { org: "Shockwave", league: "CPL", round: 2, playerName: "Rev." },
    { org: "Shockwave", league: "CAS", round: 3, playerName: "Sports" },
    { org: "Shockwave", league: "CNL", round: 5, playerName: "bing_di" },
    { org: "Stars", league: "CNL", round: 1, playerName: "RansomeLP" },
    { org: "Stars", league: "CNL", round: 2, playerName: "seori" },
    { org: "Stars", league: "CNL", round: 3, playerName: "Jux" },
    { org: "Stars", league: "CNL", round: 5, playerName: "JD" },
    { org: "Vipers", league: "CPL", round: 1, playerName: "Panda" },
    { org: "Vipers", league: "CAS", round: 1, playerName: "Ren" },
    { org: "Vipers", league: "CAS", round: 2, playerName: "Slayer2k" },
    { org: "Zebras", league: "CCS", round: 2, playerName: "dainbramage" },
    { org: "Zebras", league: "CCS", round: 3, playerName: "Rye-In" },
    { org: "Zebras", league: "CAS", round: 1, playerName: "Cryptid" },
    { org: "Zebras", league: "CAS", round: 2, playerName: "JugPanda" },
    { org: "Zebras", league: "CAS", round: 3, playerName: "Dr Scrawny" },
    { org: "Zebras", league: "CNL", round: 5, playerName: "Penguin" }
];

keeperData.forEach(k => {
    const player = players.find(p => p.name.toLowerCase() === k.playerName.toLowerCase());
    const team = teams.find(t => t.org === k.org && t.league === k.league);
    if (player && team) {
        player.draftedBy = team.id;
        team.roster.push({ id: player.id, round: k.round });
    }
});

let activeDraft = {
    isActive: false, league: null, currentRound: 1, maxRounds: 0,
    teamsInLeague: [], currentPickIndex: 0, timeLeft: 0, pendingPick: null, draftBoard: [], pickHistory: []
};

let draftTimerInterval = null;
const PICK_TIME_LIMIT = 90;

function broadcastState() {
    io.emit('stateUpdate', { players, teams, activeDraft, leagueConfig, orgData });
}

function startTurn() {
    clearInterval(draftTimerInterval);
    activeDraft.pendingPick = null;
    
    let keeperFound = true;
    while (keeperFound) {
        if (activeDraft.currentRound > activeDraft.maxRounds) {
            activeDraft.isActive = false;
            broadcastState();
            return;
        }
        
        const currentTeam = activeDraft.teamsInLeague[activeDraft.currentPickIndex];
        const currentBoardPick = activeDraft.draftBoard.find(p => 
            p.round === activeDraft.currentRound && p.teamId === currentTeam.id
        );
        
        if (currentBoardPick && currentBoardPick.playerId !== null) {
            activeDraft.currentPickIndex++;
            if (activeDraft.currentPickIndex >= activeDraft.teamsInLeague.length) {
                activeDraft.currentPickIndex = 0;
                activeDraft.currentRound++;
                activeDraft.teamsInLeague.reverse(); 
            }
        } else {
            keeperFound = false;
        }
    }

    activeDraft.timeLeft = PICK_TIME_LIMIT;
    broadcastState();
    
    draftTimerInterval = setInterval(() => {
        activeDraft.timeLeft--;
        if (activeDraft.timeLeft <= 0) {
            clearInterval(draftTimerInterval);
            activeDraft.timeLeft = 0;
        }
        broadcastState();
    }, 1000);
}

io.on('connection', (socket) => {
    socket.emit('stateUpdate', { players, teams, activeDraft, leagueConfig, orgData });

    socket.on('startDraft', (league) => {
        const leagueTeams = teams.filter(t => t.league === league);
        
        let board = [];
        let roundTeams = [...leagueTeams]; 
        for (let r = 1; r <= leagueConfig[league].rounds; r++) {
            roundTeams.forEach((t) => {
                const keeper = t.roster.find(p => p.round === r);
                board.push({ round: r, teamId: t.id, teamName: t.name, playerId: keeper ? keeper.id : null });
            });
            roundTeams.reverse(); 
        }

        activeDraft = { 
            isActive: true, 
            league: league, 
            currentRound: 1, 
            maxRounds: leagueConfig[league].rounds, 
            teamsInLeague: [...leagueTeams], 
            currentPickIndex: 0, 
            pendingPick: null, 
            timeLeft: PICK_TIME_LIMIT,
            draftBoard: board,
            pickHistory: [] 
        };
        startTurn();
    });

    socket.on('submitPick', (data) => {
        clearInterval(draftTimerInterval);
        activeDraft.pendingPick = { playerId: data.playerId, teamId: data.teamId, timeRemainingAtPick: activeDraft.timeLeft };
        broadcastState();
    });

    socket.on('adminFinalizePick', (playerId) => {
        const team = activeDraft.teamsInLeague[activeDraft.currentPickIndex];
        const player = players.find(p => p.id === playerId);
        const globalTeam = teams.find(t => t.id === team.id);
        
        activeDraft.pickHistory.push({
            playerId: playerId,
            teamId: team.id,
            round: activeDraft.currentRound,
            pickIndex: activeDraft.currentPickIndex,
            teamsOrder: [...activeDraft.teamsInLeague]
        });

        player.draftedBy = team.id;
        globalTeam.roster.push({ id: playerId, round: activeDraft.currentRound });

        const currentBoardPick = activeDraft.draftBoard.find(p => p.round === activeDraft.currentRound && p.teamId === team.id && p.playerId === null);
        if (currentBoardPick) {
            currentBoardPick.playerId = playerId;
        }

        activeDraft.currentPickIndex++;
        
        if (activeDraft.currentPickIndex >= activeDraft.teamsInLeague.length) {
            activeDraft.currentPickIndex = 0;
            activeDraft.currentRound++;
            
            if (activeDraft.currentRound > activeDraft.maxRounds) {
                activeDraft.isActive = false;
                clearInterval(draftTimerInterval);
                broadcastState();
                return;
            }
            activeDraft.teamsInLeague.reverse();
        }
        startTurn();
    });

    socket.on('undoLastPick', () => {
        if (!activeDraft.pickHistory || activeDraft.pickHistory.length === 0) return;

        const lastPick = activeDraft.pickHistory.pop();

        const player = players.find(p => p.id === lastPick.playerId);
        if (player) player.draftedBy = null;

        const globalTeam = teams.find(t => t.id === lastPick.teamId);
        if (globalTeam) {
            globalTeam.roster = globalTeam.roster.filter(p => p.id !== lastPick.playerId);
        }

        const boardPick = activeDraft.draftBoard.find(p => p.round === lastPick.round && p.teamId === lastPick.teamId);
        if (boardPick) boardPick.playerId = null;

        activeDraft.currentRound = lastPick.round;
        activeDraft.currentPickIndex = lastPick.pickIndex;
        activeDraft.teamsInLeague = lastPick.teamsOrder;
        activeDraft.isActive = true; 

        startTurn();
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});