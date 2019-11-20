var playerList = [];
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
var currentGameName;
var currentPlaymode;
//wenn initServer mache, hole mir game info fuer alle games!

function onClickCreateGameLobby() {
	openGameConfig();
}
function onClickJoinGameLobby() {

}
function closeGameConfig() {
	if (USE_SOCKETIO) {
		showEventList();
		hideGameConfig();
	}
	setMessage('hi again!');

	showElem('bJoinGame');
	showElem('bCreateGame');
	hideElem('bLobbyOk');
	hideElem('bLobbyCancel');
}
function openGameConfig() {
	hideEventList();
	showGameConfig();
	setMessage('Setup you game!');

	hideElem('bJoinGame');
	hideElem('bCreateGame');
	showElem('bLobbyOk');
	showElem('bLobbyCancel');

	//initialize acc to default game
	currentGameName = S.settings.game;
	currentPlaymode = S.settings.playMode;
	updateGamePlayerConfig(currentGameName);
	console.log(S.settings, GAME, PLAYMODE, USERNAME)
}
function updateGamePlayerConfig(gameName) {
	let gi = allGames[gameName];
	numPlayersMin = arrMin(gi.num_players);
	numPlayersMax = arrMax(gi.num_players);
	console.log('game is', gameName, 'with', numPlayersMin);
	let prefixPl = 'c_b_mm_pl';
	for (let i = 1; i <= 8; i += 1) {
		if (i <= numPlayersMin) { checkPlayer(i); makePlayerReadOnly(i); }//showElem(plnId); showElem(pltId); checkPlayer(i); }
		else if (i <= numPlayersMax) { uncheckPlayer(i); } //showElem(plnId); showElem(pltId); uncheckPlayer(i); }
		else { hidePlayer(i); }//hideElem(plnId); hideElem(pltId); }
	}
	setConfigPlayMode(PLAYMODE);
	makePlayerTypesReadOnly();
}
function makePlayerTypesReadOnly() {
	for (let i = 1; i <= 8; i += 1) {
		makePlayerTypeReadOnly(i);
	}
}
function setConfigGame(inputElem) {
	currentGameName = inputElem.value.toString();
	updateGamePlayerConfig(currentGameName);
}
function setConfigPlayMode(mode) {
	currentPlaymode = mode;
	console.log(currentPlaymode)
	let prefixPl = 'c_b_mm_plt';
	let val = 'me';
	if (mode == 'solo') {
		for (let i = 1; i <= 8; i += 1) {
			$('#' + prefixPl + i).val(val); val = 'AI regular';
		}
	} else if (mode == 'hotseat') {
		for (let i = 1; i <= 8; i += 1) {
			$('#' + prefixPl + i).val(val);
		}
	} else {
		for (let i = 1; i <= 8; i += 1) {
			$('#' + prefixPl + i).val(val); val = 'human';
		}
	}

}
function checkPlayer(i) {
	let prefixPl = 'c_b_mm_pl';
	let plnId = prefixPl + 'n' + i;
	let pltId = prefixPl + 't' + i;
	$('.pl' + i).show();

	document.getElementById(plnId).checked = true;
	document.getElementById(pltId).readOnly = false;
}
function isPlayerChecked(i) {
	let prefixPl = 'c_b_mm_pl';
	let plnId = prefixPl + 'n' + i;
	let pltId = prefixPl + 't' + i;
	return document.getElementById(plnId).checked == true;
}
function makePlayerTypeReadOnly(i) {
	let pltId = prefixPl + 't' + i;
	document.getElementById(pltId).readOnly = true;
}
function makePlayerReadOnly(i) {
	let el = getPlayerRadio(i);
	//el.readOnly = true;
	$(el).attr({ 'disabled': true, });
}
function getPlayerRadio(n) {
	return document.getElementById('c_b_mm_pln' + n);
}
function getPlayerTypeInput(n) {
	return document.getElementById('c_b_mm_plt' + n);

}
function uncheckPlayer(i) {
	let prefixPl = 'c_b_mm_pl';
	let plnId = prefixPl + 'n' + i;
	let pltId = prefixPl + 't' + i;
	$('.pl' + i).show();
	document.getElementById(plnId).checked = false;
	document.getElementById(pltId).readOnly = true;
}
function hidePlayer(i) {
	$('.pl' + i).hide();
}
function onClickCreateGameCancel() {
	closeGameConfig();
}
function onClickCreateGameOk() {
	//set all game params as in gameConfig
	closeGameConfig();
	GAME = S.settings.game = currentGameName;
	PLAYMODE = S.settings.playMode = setPlayMode(currentPlaymode);
	playerList = [];
	//habe gameInfo in allGames
	let gi = allGames[GAME];
	S.gameInfo = gi;
	//set player numbers to number of activated players in player radios
	//TODO 8 replace by MAX_NUM_PLAYERS
	let nPlayers = 0;
	let mePresent = false;
	for (let i = 1; i <= 8; i++) {
		if (isPlayerChecked(i) && i <= numPlayersMax) {
			nPlayers += 1;
			let plType = $(getPlayerTypeInput(i)).val();
			if (plType.includes('AI')) plType = plType.substring(3);
			if (PLAYMODE != 'multiplayer' && plType == 'human') plType = 'regular';
			//if solo|multiplayer can only play 1 player, others MUST BE AIs
			if (plType == 'me' && PLAYMODE != 'hotseat') {
				if (mePresent) plType = 'regular'; else mePresent = true;
			}
			playerList.push({ type: plType });
		}
	}
	//console.log(playerList);
	//next add playernames to types in order of playerList
	let i = 0;
	for (const pl of playerList) {
		pl.id = gi.player_names[i]; i += 1;
	}

	console.log(playerList);

	//AI player usernames are picked from bot name list

	if (PLAYMODE == 'solo') {
		console.log('should start solo game w/', nPlayers, 'players');
		_startSoloGame();
		//in solo

	} else if (PLAYMODE == 'hotseat') {
		//in hotseat game, each players gets user name from user+index
		console.log('should start hotseat game w/', nPlayers, 'players');
		_startHotseatGame();
	} else {
		//need to collect players to join.
		//possible add player to game (since he created it!)
		console.log('should join this user and start waiting for', nPlayers - 1, 'players')
	}
}
function onClickPlayerConfig(n) {
	//console.log('config player', n);
	//is player optional?
	isOptional = (n > numPlayersMin) && (n <= numPlayersMax);


	let el = getPlayerRadio(n);


	//console.log('readOnly', el.readOnly, 'isOptional', isOptional, 'n', n, 'min', numPlayersMin, 'max', numPlayersMax)
	if (!isOptional) return;
	//set the element to checked
	// console.log('player',n,'is NOT active');
	// if (!isPlayerChecked(n)) checkPlayer(n);
	//this player is optional!
	//toggle value of player
	let isActive = isPlayerChecked(n);
	if (!isActive) uncheckPlayer(n); else checkPlayer(n);



	//look if 
}