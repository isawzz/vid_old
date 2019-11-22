const MAX_PLAYERS_AVAILABLE = 8;
//wenn initServer mache, hole mir game info fuer alle games! for now, cheating damit schneller
var allGames = {
	ttt: {
		name: 'TicTacToe',
		long_name: 'Tic-Tac-Toe',
		short_name: 'ttt',
		num_players: [2],
		player_names: ['Player1', 'Player2'],

	},
	catan: {
		name: 'Catan',
		long_name: 'The Settlers of Catan',
		short_name: 'catan',
		num_players: [3, 4],
		player_names: ['White', 'Red', 'Blue', 'Orange'],
	}
};
var numPlayersMin = 0;
var numPlayersMax = 8;
var currentGamename;
var currentPlaymode;
var currentNumPlayers;
//var joinedPlayers = null; //for humans to join
var joinCandidate = null;


//#region game configuration
function onClickCreateGameLobby() {
	openGameConfig();
}
function closeGameConfig() {
	hideGameConfig();
	if (USE_SOCKETIO) {
		showEventList();
	}
	setMessage('hi again!');

	showElem('bJoinGame');
	showElem('bCreateGame');
	showElem('bResumeGame');
	hideElem('bLobbyOk');
	hideElem('bLobbyCancel');
}
function openGameConfig() {

	hideEventList();
	showGameConfig();
	setMessage('Setup new game!');

	hideElem('bJoinGame');
	hideElem('bCreateGame');
	showElem('bLobbyOk');
	showElem('bLobbyCancel');
	showElem('bResumeGame');

	//console.log('*game config:', S.settings.game, '=', GAME, S.settings.playmode, '=', PLAYMODE, USERNAME)
	updateGamename(S.settings.game);
	updatePlayersForGame();
	updatePlaymode(S.settings.playmode);
	updatePlayersForMode();
}
function onClickGamename(inputElem) {
	updateGamename(inputElem.value.toString());
	updatePlayersForGame();
}
function onClickPlaymode(mode) {
	updatePlaymode(mode);
	updatePlayersForMode();
}
function onClickPlayerPresence(n) {
	isOptional = (n > numPlayersMin) && (n <= numPlayersMax);
	if (!isOptional) return;

	let el = getPlayerRadio(n);
	let isActive = isPlayerChecked(n);

	if (isActive) checkPlayer(n); else uncheckPlayer(n);

	//if activated an optional player, should also activate all inactive players with lower index
	//if deactivated a player, should deactivate all optional players w/ higher index!
	if (isActive) for (let i = numPlayersMin + 1; i < n; i++) { if (!isPlayerChecked(i)) checkPlayer(i); }
	else for (let i = n + 1; i <= numPlayersMax; i++) { if (isPlayerChecked(i)) uncheckPlayer(i); }

	//update currentNumPlayers
	let cnt = 0;
	for (let i = 1; i <= numPlayersMax; i++) { if (isPlayerChecked(i)) cnt += 1; }
	currentNumPlayers = cnt;
	console.log('*** currentNumPlayers', currentNumPlayers);
}
function onClickCreateGameCancel() {
	//revert to values
	currentPlaymode = PLAYMODE;
	currentGamename = GAME;
	closeGameConfig();
}
function onClickCreateGameOk() {
	isPlaying = false;
	disableResumeButton();

	//update real settings: getting ready for game unless multiplayer
	GAME = S.settings.game = currentGamename;
	PLAYMODE = S.settings.playmode = currentPlaymode; // das wird in specAndDom gemacht! setPlaymode(currentPlaymode);

	joinedPlayers = [];
	let gi = allGames[GAME];
	S.gameInfo = gi;
	let gc = {};
	gc.numPlayers = currentNumPlayers;
	gc.players = [];
	let countNeedToJoin = 0;
	let countMes = 0;
	let iBots = 0;
	for (let i = 0; i < currentNumPlayers; i++) {
		let pl = {};
		pl.index = i;
		pl.id = gi.player_names[i];
		let selType = valueOfElement(getidType(i + 1));
		pl.playerType = startsWith(selType, 'AI') ? 'AI' : selType;
		pl.agentType = pl.playerType == 'AI' ? selType == 'AI' ? 'regular' : stringAfter(selType, ' ') : null;
		pl.username = selType == 'me' ? USERNAME + (countMes > 0 ? countMes : '')
			: selType == 'human' ? '' : 'bot' + iBots;
		if (selType == 'me') countMes += 1;
		else if (selType == 'human') countNeedToJoin += 1;
		else iBots += 1;
		gc.players.push(pl);
	}
	S.gameConfig = gc;

	closeGameConfig();
	if (countNeedToJoin > 0) {
		setMessage('new game set up! waiting for ' + countNeedToJoin + ' players to join!');

	} else {
		//console.log('should start game w/ config:\n', S.gameConfig);
		_startNewGame();
	}
}

//#region join config
function onClickJoinGameLobby() {
	openJoinConfig();
}
function closeJoinConfig() {
	hideJoinConfig();
	if (USE_SOCKETIO) {
		showEventList();
	}
	setMessage('hi again!');

	showElem('bJoinGame');
	showElem('bCreateGame');
	showElem('bResumeGame');
	hideElem('bLobbyJoinOk');
	hideElem('bLobbyJoinCancel');
}
function openJoinConfig() {
	hideEventList();
	showJoinConfig();
	setMessage('Setup new game!');

	hideElem('bJoinGame');
	hideElem('bCreateGame');
	showElem('bLobbyJoinOk');
	showElem('bLobbyJoinCancel');
	showElem('bResumeGame');

	populateJoinList();
	joinCandidate = null;
}
function populateJoinList() {
	let players = S.gameConfig.players;
	for (let i = 0; i < MAX_PLAYERS_AVAILABLE; i++) {
		let pl = players[i];
		let idRadio = getidAvailable(i);
		if (isPlayerChecked[pl.index] && pl.playerType == 'human' && empty(pl.username)) {
			let idRadio = getidAvailable(i);
			let idSpan = getidSpanJoin(i);
			//idRadio muss unchecked sein!
			//beide muessen visible sein!
			showElem(idRadio);
			uncheckAvailable(i);
			showElem(idSpan);
			document.getElementById(idSpan).innerHTML = pl.id;
		} else {
			hideElem(idRadio);
		}
	}
}
function processMessage(msg) {
	let parts = msg.split(' ');
	// username joined as White
	if (parts.length > 3 && startsWith(parts[1], 'join')) {
		let uname = parts[0];
		let plid = parts[3].trim();
		let players = S.gameConfig.players;
		//look for player with this player id:
		let plChosen = firstCond(players, x => x.id == plid);
		if (plChosen) {
			if (isJoinMenuOpen()) closeJoinConfig();
			plChosen.username = uname;
			checkGameConfigComplete();
		}
		//username has joined the game, need to add his name to player id
	}
}
function checkGameConfigComplete(){

	//find out how many players do NOT have username
	for(const pl of S.gameConfig.players){
		if (empty(pl.username)) return false;
	}
	return true;
}
function onClickAvailablePlayer(i) {
	//this is player that selected for joining!
	//find player in gc.players
	//check this radio (is eh automatic)
	let players = S.gameConfig.players;
	//look for player with this player id:
	let plChosen = firstCond(players, x => x.index == i);
	joinCandidate = plChosen;
}
function onClickJoinGameCancel() {
	closeJoinConfig();
}
function onClickJoinGameOk() {
	//TODO: think about that?!?!?
	isPlaying = false;
	disableResumeButton();

	if (!joinCandidate){
		setMessage('you did NOT join the game!')
	}else{
		//count mes
		let countMes = 0;
		for(pl of S.gameConfig.players){
			if (!empty(pl.username) && startsWith(pl.username,USERNAME)) countMes +=1;
		}
		joinCandidate.username = USERNAME + (countMes>0?countMes:'');
	}

	if (checkGameConfigComplete()){
		let msg = 'game ready!';
		disableJoinButton();
		if (S.gameConfig.players[0].username)
	}

	//update real settings: getting ready for game unless multiplayer
	GAME = S.settings.game = currentGamename;
	PLAYMODE = S.settings.playmode = currentPlaymode; // das wird in specAndDom gemacht! setPlaymode(currentPlaymode);

	joinedPlayers = [];
	let gi = allGames[GAME];
	S.gameInfo = gi;
	let gc = {};
	gc.numPlayers = currentNumPlayers;
	gc.players = [];
	let countNeedToJoin = 0;
	let countMes = 0;
	let iBots = 0;
	for (let i = 0; i < currentNumPlayers; i++) {
		let pl = {};
		pl.index = i;
		pl.id = gi.player_names[i];
		let selType = valueOfElement(getidType(i + 1));
		pl.playerType = startsWith(selType, 'AI') ? 'AI' : selType;
		pl.agentType = pl.playerType == 'AI' ? selType == 'AI' ? 'regular' : stringAfter(selType, ' ') : null;
		pl.username = selType == 'me' ? USERNAME + (countMes > 0 ? countMes : '')
			: selType == 'human' ? '' : 'bot' + iBots;
		if (selType == 'me') countMes += 1;
		else if (selType == 'human') countNeedToJoin += 1;
		else iBots += 1;
		gc.players.push(pl);
	}
	S.gameConfig = gc;

	closeGameConfig();
	if (countNeedToJoin > 0) {
		setMessage('new game set up! waiting for ' + countNeedToJoin + ' players to join!');

	} else {
		//console.log('should start game w/ config:\n', S.gameConfig);
		_startNewGame();
	}
}


function onClickResumeGameLobby() {
	closeGameConfig();
	gameView();
}
// #region helpers
function valueOfElement(id) {
	//console.log(id);
	return document.getElementById(id).value;
}
function updateGamename(gamename) {
	currentGamename = gamename;
	let gi = allGames[gamename];
	currentPlayersById = {};
	plidByIndex = gi.player_names;
	for (const plid of gi.player_names) {
		currentPlayersById[plid] = {};
	}
	numPlayersMin = arrMin(gi.num_players);
	numPlayersMax = arrMax(gi.num_players);
	//console.log('game is', gamename, 'with', numPlayersMin, 'to', numPlayersMax, 'players');
}
function updatePlaymode(mode) {
	currentPlaymode = mode;
	//console.log('current playmode:', currentPlaymode)
}
function getidNum(i) { return 'c_b_mm_pln' + i; }
function getidAvailable(i) { return 'c_b_mm_plj' + i; }
function getidSpanJoin(i) { return 'spplj' + i; }
function getidSpan(i) { return 'sppl' + i; }
function getidType(i) { return 'c_b_mm_plt' + i; }
function getPlayerInfo(i) { return currentPlayersById[plidByIndex[i]]; }

function updatePlayersForGame() {
	currentNumPlayers = 0;
	for (let i = 1; i <= MAX_PLAYERS_AVAILABLE; i += 1) {
		if (i <= numPlayersMin) { currentNumPlayers += 1; showPlayer(i); checkPlayer(i); makePlayerReadOnly(i); }
		else if (i <= numPlayersMax) { showPlayer(i); uncheckPlayer(i); }
		else { hidePlayer(i); }
	}
}
const soloTypes = ['me', 'AI', 'AI random', 'AI pass'];
const allPlayerTypes = ['me', 'human', 'AI', 'AI random', 'AI pass'];
function populateSelect(i, listValues, selValue) {
	let id = getidType(i);
	let el = document.getElementById(id);
	clearElement(el);
	for (opt of listValues) {
		var newOption = document.createElement("option");
		newOption.text = opt.toString();
		// option.setAttribute('value', langArray[i].value);
		// option.appendChild(document.createTextNode(langArray[i].text));
		// select.appendChild(option);
		el.appendChild(newOption);
	}
	$(el).val(selValue);//el.setAttribute('value', selValue);
}
function updatePlayersForMode() {
	let mode = currentPlaymode;
	let val = 'me';
	let n = MAX_PLAYERS_AVAILABLE;
	for (let i = 1; i <= n; i += 1) {
		let id = getidType(i);
		if (!isVisible(id)) continue;
		if (mode == 'solo') { populateSelect(i, soloTypes, val); val = 'AI'; }//changeToForInput('soloTypes', id, val); val = 'AI'; }
		else if (mode == 'hotseat') { populateSelect(i, soloTypes, val); }
		else { populateSelect(i, allPlayerTypes, val); val = 'human'; }
		// else if (mode == 'hotseat') { changeToForInput('soloTypes', id, val); }
		// else { changeToForInput('allPlayerTypes', id, val); val = 'human'; }
	}
}
function changeToForInput(newListName, elid, defaultVal) {
	console.log("Started", newListName, elid);
	var x = newListName;//document.getElementById('A').value;
	//$("#SelectEntityPrimaryName option:selected").attr('value');
	document.getElementById(elid).value = '';//defaultVal;
	document.getElementById(elid).setAttribute('list', x);
}
function hidePlayer(i) {
	let id;
	id = getidNum(i); hideElem(id);
	id = getidSpan(i); hideElem(id);
	id = getidType(i); hideElem(id);
}
function showPlayer(i) {
	let id;
	id = getidNum(i); showElem(id);
	id = getidSpan(i); showElem(id);
	id = getidType(i); showElem(id);
}
function checkPlayer(i) {
	id = getidNum(i); document.getElementById(id).checked = true;
}
function checkAvailable(i) {
	id = getidAvailable(i); document.getElementById(id).checked = true;
}
function uncheckAvailable(i) {
	id = getidAvailable(i); document.getElementById(id).checked = false;
}
function uncheckPlayer(i) {
	id = getidNum(i); document.getElementById(id).checked = false;
}
function isPlayerChecked(i) {
	id = getidNum(i); return document.getElementById(id).checked == true;
}
function makePlayerReadOnly(i) {
	let el = getPlayerRadio(i);
	//el.readOnly = true;
	$(el).attr({ 'disabled': true, });
}
function getPlayerRadio(n) {
	return document.getElementById(getidNum(n));
}
function getPlayerTypeInput(n) {
	return document.getElementById(getidType(n));

}
function makePlayerTypesReadOnly() {
	for (let i = 1; i <= 8; i += 1) {
		makePlayerTypeReadOnly(i);
	}
}
function makePlayerTypeReadOnlyX(i) {
	let prefixPl = 'c_b_mm_pl';
	let pltId = prefixPl + 't' + i;
	document.getElementById(pltId).readOnly = true;
}
function change() {
	changeToForInput('soloTypes', 'c_b_mm_plt1'); return;

	console.log("Started");
	var x = 'soloTypes';//document.getElementById('A').value;

	document.getElementById('List').value = "";
	document.getElementById('List').setAttribute('list', x);
}
function changeTo(newListName) {
	console.log("Started");
	var x = newListName;//document.getElementById('A').value;

	document.getElementById('List').value = "";
	document.getElementById('List').setAttribute('list', x);
}

// #endregion

