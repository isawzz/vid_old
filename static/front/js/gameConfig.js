const MAX_PLAYERS_AVAILABLE = 8;
//wenn initServer mache, hole mir game info fuer alle games! for now, cheating damit schneller
var allGames1 = {
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
var allGames = allGames1;
var numPlayersMin = 0;
var numPlayersMax = 8;
var currentSeed;
var currentGamename;
var currentPlaymode;
var currentNumPlayers;
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

	if (allGames == null) {
		_sendRoute('/game/available', d => {
			let glist = JSON.parse(d);
			console.log(typeof (glist), glist);
			let chain = [];
			for (g of glist) chain.push('/game/info/' + g);
			chainSend(chain, res => {
				console.log(res);//res is a list!!!
				let info=[];
				for(const s of res){
					let sJSON = JSON.parse(s);
					let name=sJSON.short_name;
					info[name]=sJSON;
				}
				//let info = JSON.parse(res);
				//console.log(typeof (info), info);
				allGames = info;
				console.log(allGames);
				proceedToConfig();
			})
		})
	} else proceedToConfig();
}
function proceedToConfig() {
	populateGamenames();
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
function populateGamenames(){
	//console.log('populating!!!');
	let elem = document.getElementById('fChooseGame');
	clearInit(elem,{innerHTML:'<legend>choose game</legend>'});
	//console.log(elem);
	for(const name in allGames){
		let radio = document.createElement('input');
		radio.type = 'radio';
		radio.name = 'game';
		radio.classList.add('radio');
		radio.id = 'c_b_mm_'+name;
		radio.value = name;
		radio.addEventListener('click',()=>onClickGamename(radio));
		elem.appendChild(radio);
		elem.appendChild(document.createTextNode(allGames[name].name.toLowerCase()));
		elem.appendChild(document.createElement('br'))
	}
	let checkedGameInput = document.getElementById('c_b_mm_' + GAME.toLowerCase());
	checkedGameInput.checked = true;

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
	//console.log('*** currentNumPlayers', currentNumPlayers);
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
	currentSeed = document.getElementById('c_b_mm_seed').value;
	SEED = S.settings.seed = Number(currentSeed);

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
		pl.index = i + 1;
		pl.id = gi.player_names[i];
		let selType = valueOfElement(getidType(i + 1));
		pl.playerType = startsWith(selType, 'AI') ? 'AI' : selType;
		// pl.agentType = pl.playerType == 'AI' ? selType == 'AI' ? 'regular' : stringAfter(selType, ' ') : null;
		pl.agentType = pl.playerType == 'AI' ? stringAfter(selType, ' ') : null;
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
		//console.log('*** onClickCreateGameOk ***emitting:\n')
		socketEmitMessage(JSON.stringify({ type: 'gc', data: gc }));

	} else {
		//console.log('should start game w/ config:\n', S.gameConfig);
		_startNewGame('starter');//AsStarter();
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
function isJoinMenuOpen() {
	return isVisibleElem('bLobbyJoinOk');
}
function openJoinConfig() {
	hideEventList();
	showJoinConfig();
	setMessage('Join the game!');

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

	console.log('populateJoinList', S.gameConfig)
	for (let i = 1; i <= S.gameConfig.numPlayers; i++) {
		let pl = players[i - 1];
		let idRadio = getidAvailable(i);
		let idSpan = getidSpanJoin(i);
		//console.log(idRadio, idSpan,pl)
		if (empty(pl.username)) {
			//idRadio muss unchecked sein!
			//beide muessen visible sein!
			showElem(idRadio);
			showElem(idSpan);
			uncheckAvailable(i);
			document.getElementById(idSpan).innerHTML = pl.id;
		} else {
			hideElem(idRadio);
			hideElem(idSpan);
		}
	}
	for (let i = S.gameConfig.numPlayers + 1; i <= MAX_PLAYERS_AVAILABLE; i++) {
		let idRadio = getidAvailable(i);
		let idSpan = getidSpanJoin(i);
		hideElem(idRadio);
		hideElem(idSpan);
	}
}
function checkGameConfigComplete() {

	//find out how many players do NOT have username
	for (const pl of S.gameConfig.players) {
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

	if (!joinCandidate) {
		setMessage('you did NOT join the game!')
	} else {
		//count mes
		let countMes = 0;
		for (pl of S.gameConfig.players) {
			if (!empty(pl.username) && startsWith(pl.username, USERNAME)) countMes += 1;
		}
		let uname = USERNAME + (countMes > 0 ? countMes : '');
		joinCandidate.username = uname;
		//console.log('joinCandidate', joinCandidate)
		socketEmitMessage(uname + ' joined as ' + joinCandidate.id);
	}

	closeJoinConfig();
	if (checkGameConfigComplete()) {
		disableJoinButton();
	}
}
function iAmStarter() { return S.gameConfig.players[0].username == USERNAME; }

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
	makePlayermodeReadOnly('multiplayer');
	//console.log('current playmode:', currentPlaymode)
}
function getidPlayermode(mode){return 'c_b_mm_'+mode;}
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
const soloTypes = ['me', 'AI regular', 'AI random', 'AI pass'];
const allPlayerTypes = ['me', 'human', 'AI regular', 'AI random', 'AI pass'];
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
		if (mode == 'solo') { populateSelect(i, soloTypes, val); val = 'AI regular'; }
		else if (mode == 'hotseat' || mode == 'passplay') { populateSelect(i, soloTypes, val); }
		else { 
			populateSelect(i, allPlayerTypes, val); 
			val = PLAYER_CONFIG_FOR_MULTIPLAYER.length > i?PLAYER_CONFIG_FOR_MULTIPLAYER[i]:'human'; 
		}
		// else if (mode == 'hotseat') { changeToForInput('soloTypes', id, val); }
		// else { changeToForInput('allPlayerTypes', id, val); val = 'human'; }
	}
}
function changeToForInput(newListName, elid, defaultVal) {
	//console.log("Started", newListName, elid);
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
function makePlayermodeReadOnly(i) {
	let el = getPlayermodeRadio(i);
	//el.readOnly = true;
	$(el).attr({ 'disabled': true, });
}
function getPlayerRadio(n) {
	return document.getElementById(getidNum(n));
}
function getPlayermodeRadio(mode) {
	return document.getElementById(getidNum(mode));
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

	//console.log("Started");
	var x = 'soloTypes';//document.getElementById('A').value;

	document.getElementById('List').value = "";
	document.getElementById('List').setAttribute('list', x);
}
function changeTo(newListName) {
	//console.log("Started");
	var x = newListName;//document.getElementById('A').value;

	document.getElementById('List').value = "";
	document.getElementById('List').setAttribute('list', x);
}

// #endregion

