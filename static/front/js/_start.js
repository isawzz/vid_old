const names = ['felix', 'amanda', 'sabine', 'tom', 'taka', 'microbe', 'dwight', 'jim', 'michael', 'pam', 'kevin', 'darryl', 'lauren', 'anuj', 'david', 'holly'];
var view = null;
var isPlaying = false; //initially
var isReallyMultiplayer = false;

function _start() {
	_initServer();

	//clientData.name = USERNAME; _startLobby();

	_startLogin(); login(chooseRandom(names)); //openGameConfig();

	// S.gameConfig = {
	// 	numPlayers: 3,
	// 	players:[
	// 		{id:'White',playerType:'human',agentType:null,username:USERNAME},
	// 		{id:'Red',playerType:'AI',agentType:AI_TYPE,username:'bot0'},
	// 		{id:'Blue',playerType:'human',agentType:null,username:''},
	// 	]
	// }
	openGameConfig();
}

function _startLogin() { loginView(); }
function _startLobby() { lobbyView(); }

// function _startHotseatGame() { gameView(); initDom(); _startHotseat(); }
// function _startSoloGame() { gameView(); initDom(); _startSolo(); }
function setIsReallyMultiplayer(){
	let gc = S.gameConfig;
	// if any of the players is not front ai and is not me, is real multiplayer game and has to be announced!!!
	let players = gc.players;
	let foreign = firstCond(players,x=>!isMyPlayer(x.id) && !isFrontAIPlayer(x.id));
	isReallyMultiplayer = (foreign != null);
	disableButtonsForMultiplayerGame();
}
function getUsernameForPlayer(id) {
	console.log('getUsernameForPlayer id:',id)
	let players = S.gameConfig.players;
	let pl = firstCond(players,x=>x.id == id);
	let uname = pl.username;
	return uname;
}
function isMyPlayer(id) { 
	let uname = getUsernameForPlayer(id);
	return startsWith(uname,USERNAME);
} 
function isFrontAIPlayer(id){
	if (USE_BACKEND_AI) return false;
	let players = S.gameConfig.players;
	let pl = firstCond(players,x=>x.id == id);
	let playerType = pl.playerType;
	return playerType == 'AI';
}

function _startNewGame(role){
	gameView(); 
	initDom(); 
	console.log('starting as',role,'multiplayer=',isReallyMultiplayer);

	timit.start_of_cycle(getFunctionCallerName());
	S.vars.switchedGame = true;
	S.settings.game = GAME;

	_checkCleanup();

	S.user = {};
	G = { table: {}, players: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }

	if (role == 'starter'){
		if (S.settings.useSpec) loadUserSpec([loadUserCode, sendInitNewGame]); else sendInitNewGame();		
	}else{
		if (S.settings.useSpec) loadUserSpec([loadUserCode, sendStatusNewGame]); else sendStatusNewGame();		
	}
}
function _startGameAsJoiner() {
	timit.start_of_cycle(getFunctionCallerName());
	S.vars.switchedGame = true;
	S.settings.game = GAME;

	_checkCleanup();

	S.user = {};
	G = { table: {}, players: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }

	if (S.settings.useSpec) loadUserSpec([loadUserCode, sendStatusNewGame]); else sendStatusNewGame();		
}
function _startGameAsStarter() {
	timit.start_of_cycle(getFunctionCallerName());
	S.vars.switchedGame = true;
	S.settings.game = GAME;

	_checkCleanup();

	S.user = {};
	G = { table: {}, players: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }

	if (S.settings.useSpec) loadUserSpec([loadUserCode, sendInitNewGame]); else sendInitNewGame();
}

function _startRestartSame() {
	timit.start_of_cycle(getFunctionCallerName());
	if (isdef(UIS)) {
		stopBlinking('a_d_status');
		stopInteraction();
		clearLog();
	}

	_sendRoute('/begin/1', d6 => {
		let user = isdef(S.gameInfo.userList) ? S.gameInfo.userList[0] : USERNAME;
		timit.showTime('sending status');
		_sendRoute('/status/' + user, d7 => {
			let data = JSON.parse(d7);
			timit.showTime('start processing');
			if (processData(data)) gameStep();
			else console.log('_startRestartSame: NOT MY TURN!!!! WHAT NOW?!?!?');
		});
	});
}

//#region helpers
function _checkCleanup() {
	if (!S.vars.firstTime) { //cleanup
		pageHeaderClearAll();
		restoreBehaviors();
		stopBlinking('a_d_status');
		openTabTesting('London');
		UIS['a_d_status'].clear({ innerHTML: '<div id="c_d_statusText">status</div>' });
		UIS['a_d_actions'].clear({ innerHTML: '<div id="a_d_divSelect" class="sidenav1"></div>' });
		let areaPlayer = isdef(UIS['a_d_player']) ? 'a_d_player' : isdef(UIS['a_d_players']) ? 'a_d_players' : 'a_d_options';
		//console.log('area for players is', areaPlayer)
		for (const id of ['a_d_log', 'a_d_objects', areaPlayer, 'a_d_game']) clearElement(id);
		delete S.players;
	} else S.vars.firstTime = false;
}
function inferPlayerColorFromNameOrInit(plid, index) {
	let cname = plid.toLowerCase();
	if (cname in playerColors) return playerColors[cname];
	if (nundef(index)) index = 0;
	let ckeys = getKeys(playerColors);
	return playerColors[ckeys[index] % playerColors.length];
}
function _initPlayers() {
	S.players = {}; //da sollen die objects {username,isMe,id,color} drin sein!!!
	G.players = {};
	let ckeys = Object.keys(playerColors);

	//match colors to better colors!
	let i = 0;
	for (const id in G.serverData.players) {
		let pl = G.serverData.players[id];
		let colorName = isdef(pl.color) ? pl.color : ckeys[i];
		colorName = colorName.toLowerCase();
		let altName = capitalize(colorName);
		let color = isdef(playerColors[colorName]) ? playerColors[colorName] : colorName;
		let plInfo = firstCond(S.gameConfig.players, x => x.id == id);
		//console.log('_initPlayers found',id,plInfo);
		S.players[id] = { username: plInfo.username, playerType: plInfo.playerType, agentType: plInfo.agentType, id: id, color: color, altName: altName, index: plInfo.index };
		i += 1;
	}
}
function _initServer() {
	//init host and get gameInfo for all games
	//for now just cheat since I have that info anyway!
	timit = new TimeIt(getFunctionCallerName());
	timit.tacit();

	S = { path: {}, user: {}, settings: {}, vars: { firstTime: true } };
	counters = { msg: 0, click: 0, mouseenter: 0, mouseleave: 0, events: 0 };

	setDefaultSettings();
	S.vars.switchedGame = true;
	S.vars.firstTime = false;

	_initGameGlobals();
	S.gameInProgress = false;
	initDom();
}
function _initGameGlobals() {
	S.user = {};
	G = { table: {}, players: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }
	DELETED_IDS = [];

}

