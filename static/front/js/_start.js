var commandChain = [];
var maxZIndex = 110;
var iconChars;

function _start() {
	_initServer();
	timit.reset();
	let faChars, gaChars;
	loadYML('/static/rsg/assets/gameIconCodes.yml', dga => {
		//console.log(dga);
		gaChars = dga;
		loadYML('/static/rsg/assets/faIconCodes.yml', dfa => {
			//console.log(dfa);
			faChars = dfa;
			timit.showTime('loaded icons codes')
			iconChars = {};
			for (const k in faChars) {
				iconChars[k] = faChars[k];
			}
			for (const k in gaChars) {
				iconChars[k] = gaChars[k];
			}
			//clientData.name = USERNAME; _startLobby();

			//_startLogin(); login(chooseRandom(names)); openGameConfig();

			//commandChain=[()=>onClickCheat('devcard'),onClickRunToNextPhase];
			

			ensureAllGames(() => {
				gcsAuto();
				S.gameConfig = gcs[GAME];
				_startNewGame('starter');
			}
			); //START HERE!!!!


			//testLines();

			//testShapes();
			//testNewMSAPI();
			//stressTest();
			//testAndSave();
			//testAndSave2();
			//testPicto();
			//testCards();
		})
	})
}
function _startLogin() { loginView(); }

function _startLobby() { lobbyView(); }

function _startNewGame(role) {
	gameView();
	//console.log('starting as',role,'multiplayer=',isReallyMultiplayer);

	timit.start_of_cycle(getFunctionCallerName());
	//S.vars.switchedGame = true;
	S.settings.game = GAME;

	checkCleanup_III();

	S.user = {};
	G = { table: {}, players: {}, signals: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }


	if (role == 'starter') {
		loadUserSpec([loadUserCode, sendInitNewGame]);
		//if (S.settings.userSettings) loadUserSpec([loadUserCode, sendInitNewGame]); else sendInitNewGame();
	} else {
		loadUserSpec([loadUserCode, sendStatusNewGame]);
		//if (S.settings.userSettings) loadUserSpec([loadUserCode, sendStatusNewGame]); else sendStatusNewGame();
	}
}
function _startRestartSame() {
	checkCleanup_I();
	_sendRoute('/begin/' + SEED, d6 => {
		let user = USERNAME;
		timit.showTime('sending status');
		_sendRoute('/status/' + user, d7 => {
			let data = JSON.parse(d7);
			timit.showTime('start processing');
			processData(data); gameStep();
		});
	});
}

//#region helpers
function getUsernameForPlayer(id) {
	//console.log('getUsernameForPlayer id:',id)
	let players = S.gameConfig.players;
	let pl = firstCond(players, x => x.id == id);
	let uname = pl.username;
	return uname;
}
function inferPlayerColorFromNameOrInit(plid, index) {
	let cname = plid.toLowerCase();
	if (cname in playerColors) return playerColors[cname];
	if (nundef(index)) index = 0;
	let ckeys = getKeys(playerColors);
	return playerColors[ckeys[index] % playerColors.length];
}
function _initPlayers() {
	//TODO: eliminate S.players, das ist jetzt in S.gameConfig
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

		S.players[id] = { username: plInfo.username, playerType: plInfo.playerType, agentType: plInfo.agentType, id: id, color: color, altName: altName, index: plInfo.index };
		i += 1;
	}
}
function _initServer() {
	//init host and get gameInfo for all games
	//for now just cheat since I have that info anyway!
	timit = new TimeIt(getFunctionCallerName());
	timit.tacit();

	S = { path: {}, user: {}, settings: {}, vars: {} };
	counters = { msg: 0, click: 0, mouseenter: 0, mouseleave: 0, events: 0 };

	setDefaultSettings();
	//S.vars.switchedGame = true;

	// _initGameGlobals();
	// S.gameInProgress = false;
	// initDom();
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
function isMyPlayer(id) {
	let uname = getUsernameForPlayer(id);
	return startsWith(uname, USERNAME);
}
function isFrontAIPlayer(id) {
	if (USE_BACKEND_AI) return false;
	console.log('!!!!!!!!!isFrontAIPlayer: should NOT get here if USE_BACKEND_AI==' + USE_BACKEND_AI);
	let players = S.gameConfig.players;
	let pl = firstCond(players, x => x.id == id);
	let playerType = pl.playerType;
	return playerType == 'AI';
}
function setIsReallyMultiplayer() {
	let gc = S.gameConfig;
	// if any of the players is not front ai and is not me, is real multiplayer game and has to be announced!!!
	let players = gc.players;
	let foreign = firstCond(players, x => !isMyPlayer(x.id) && x.playerType == 'human');
	isReallyMultiplayer = (foreign != null);
	disableButtonsForMultiplayerGame();
}


