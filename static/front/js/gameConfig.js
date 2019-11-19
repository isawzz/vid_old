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
var numPlayersMin=0;
var numPlayersMax=8;
//wenn initServer mache, hole mir game info fuer alle games!


function onClickCreateGameLobby() {
	openGameConfig();
}
function onClickJoinGameLobby() {

}
function closeGameConfig() {
	showEventList();
	hideGameConfig();
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
	let gameName = S.settings.game;
	updateGamePlayerConfig(gameName);
}
function updateGamePlayerConfig(gameName){
	let gi = allGames[gameName];
	numPlayersMin = arrMin(gi.num_players);
	numPlayersMax = arrMax(gi.num_players);
	console.log('game is', gameName, 'with', numPlayersMin);
	let prefixPl = 'c_b_mm_pl';
	for (let i = 1; i <= 8; i += 1) {
		// let plnId = prefixPl + 'n' + i;
		// let pltId = prefixPl + 't' + i;
		// console.log(plnId,pltId,numPlayersMin,numPlayersMax)
		if (i <= numPlayersMin) { checkPlayer(i);}//showElem(plnId); showElem(pltId); checkPlayer(i); }
		else if (i <= numPlayersMax) { uncheckPlayer(i);} //showElem(plnId); showElem(pltId); uncheckPlayer(i); }
		else { hidePlayer(i);}//hideElem(plnId); hideElem(pltId); }
	}

}
function setConfigGame(inputElem){
	let gameName = inputElem.value.toString();
	updateGamePlayerConfig(gameName);
}
function setConfigPlayMode(mode){
	let prefixPl = 'c_b_mm_plt';
	let val='me';
	if (mode == 'solo'){
		for (let i = 1; i <= 8; i += 1) {
			$('#'+prefixPl+i).val(val);val='AI';
		}
	}else if(mode == 'hotseat'){
		for (let i = 1; i <= 8; i += 1) {
			$('#'+prefixPl+i).val(val);
		}
	}else{
		for (let i = 1; i <= 8; i += 1) {
			$('#'+prefixPl+i).val(val);val = 'human';
		}
	}
}
function checkPlayer(i) {
	let prefixPl = 'c_b_mm_pl';
	let plnId = prefixPl + 'n' + i;
	let pltId = prefixPl + 't' + i;
	$('.pl'+i).show();

	document.getElementById(plnId).checked = true;
	document.getElementById(pltId).readOnly = false;
}
function uncheckPlayer(i) {
	let prefixPl = 'c_b_mm_pl';
	let plnId = prefixPl + 'n' + i;
	let pltId = prefixPl + 't' + i;
	$('.pl'+i).show();
	document.getElementById(plnId).checked = false;
	document.getElementById(pltId).readOnly = true;
}
function hidePlayer(i){
	$('.pl'+i).hide();
}
function onClickCreateGameCancel() {
	closeGameConfig();
}
function onClickCreateGameOk() {
	//set all game params as in gameConfig
	closeGameConfig();
}
function onClickPlayerConfig(n) {
	console.log('config player', n);
}