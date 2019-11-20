function _startMultiplayer(){
	whichGame(onWhichGame);
}
function sendInit(){
	//which user should initialize if more than 1 user is impersonated???
	//first one I'd say!
	//is there always going to be 1 user w/ USERNAME? I guess so
	//let username = USERNAME;
	// spec and dom? what about 
	//what about restarting a multiplayer game???????
	timit.showTime('sending status');
	_sendRouteJS('/status/' + USERNAME, d7 => {
		//let data = JSON.parse(d7);
		data = d7.response;


		//multiplayer mode: hier muss bereits checken ob GamePlayer in S.plAddedByMe ist
		if (S.settings.playMode == 'multiplayer'){
			//check who GamePlayer is
			if ('players' in data){
				for(const id in data.players){
					let pl = data.players[id];
					if (pl.obj_type == 'GamePlayer'){
						if (pl != G.player){
							//player change
							if (!(id in S.plAddedByMe)){
								//other player! have to wait!!!!
								enterWaitingLoop(); return;
							}
						}
					}
				}
			}
		}

		processData(data);
		specAndDOM([gameStep]);
	});

}

//completely deprecated!!!!!

function onClickCreateGame() {
	console.log('playMode:',S.settings.playMode,'PLAYMODE',PLAYMODE, 'S.playModeChanged',S.playModeChanged)
	S.settings.username = USERNAME;
	S.settings.playMode = PLAYMODE;
	S.settings.game = GAME;
	console.log('playMode:',S.settings.playMode,'PLAYMODE',PLAYMODE, 'S.playModeChanged',S.playModeChanged)

	switch (S.settings.playMode) {
		case 'multiplayer': restartHost(onHostStarted); break; //_startMultiplayer(); break;
		case 'hotseat': _startHotseat(); break;
		case 'solo':
		default: break;

	}
}
function onClickJoinGame() {
	if (S.gameInProgress) {
		alert('CANNOT JOIN! game has already started!!! click create game to start a new game or restart to restart current game');
		return;
	}
	console.log('playMode:',S.settings.playMode,'PLAYMODE',PLAYMODE, 'S.playModeChanged',S.playModeChanged)
	S.settings.username = USERNAME;
	S.settings.playMode = PLAYMODE;
	S.settings.game = GAME;
	console.log('playMode:',S.settings.playMode,'PLAYMODE',PLAYMODE, 'S.playModeChanged',S.playModeChanged)

	//branch off depending on playMode
	//console.log(S.settings.username, S.settings.playMode, S.settings.game);
	switch (S.settings.playMode) {
		case 'multiplayer': _startMultiplayer(); break;
		case 'hotseat': _startHotseat(); break;
		case 'solo':
		default: break;

	}
}
function onWhichGame(d) {
	prelude(getFunctionCallerName(), d);
	if (isError(d)) { restartHost(onHostStarted); return; }
	d = d.response;
	S.gameInfo = d;
	let currentGame = S.gameInfo.name.toLowerCase();
	//console.log('currentGame', currentGame);
	if (currentGame == GAME) existingPlayers(onExistingPlayers);
	else restartHost(onHostStarted);
}
function onExistingPlayers(d) {
	prelude(getFunctionCallerName(), d);
	if (isError(d)) { restartHost(onHostStarted); return; }
	d = d.response;
	//console.log('existingPlayers', d);
	availablePlayers(onAvailablePlayers);
}
function onAvailablePlayers(d) {
	prelude(getFunctionCallerName(), d);
	if (isError(d)) { restartHost(onHostStarted); return; }
	d = d.response;
	S.availablePlayers = d;
	console.log('availablePlayers', S.availablePlayers);
	//in pageHeader show players that are NOT available!
	S.playersTaken = {};
	let i=0;
	for(const plid of S.gameInfo.player_names){
		console.log(plid)
		if (S.availablePlayers.includes(plid)) {
			console.log('it includes',plid);
			break;
		}
		if (isdef(S.plAddedByMe) && plid in S.plAddedByMe){
			i+=1;
			continue;
		}
		console.log('still here!!!')
		S.playersTaken[plid]={username:'?',index:i,id:plid};
		pageHeaderAddPlayer('?',plid,inferPlayerColorFromNameOrInit(plid,i));
		i+=1;
	}
	console.log(S.playersTaken);
	if (!empty(S.availablePlayers)) addUserAsFirstAvailablePlayer();
	else restartHost(onHostStarted);
}
function onHostStarted(d) {
	pageHeaderClearPlayers();
	prelude(getFunctionCallerName(), d);
	if (isError(d)) throw 'CANNOT RESTART HOST!!!!!!!!!';
	d = d.response;
	//console.log(d);
	S.plAddedByMe = {}; //playerId:username in order to mod username in case of multiple player impersonation
	selectGame(onGameChosen);
}
function onAvailableGames(d) {
	prelude(getFunctionCallerName(), d);
	if (isError(d)) { restartHost(onHostStarted); return; }
	d = d.response;
	//console.log('available games:', d);
}
function onGameChosen(d) {
	prelude(getFunctionCallerName(), d);
	if (isError(d)) { restartHost(onHostStarted); return; }
	d = d.response;
	//console.log(d);
	whichGame(onGameInfo);
}
function onGameInfo(d) {
	prelude(getFunctionCallerName(), d);
	if (isError(d)) { restartHost(onHostStarted); return; }
	d = d.response;
	S.gameInfo = d;
	let currentGame = S.gameInfo.name.toLowerCase();
	//console.log('currentGame', currentGame);
	availablePlayers(onAvailablePlayers);
}
function addUserAsFirstAvailablePlayer() {
	let nextPlayer = S.availablePlayers[0];
	//console.log('will set player to', nextPlayer);
	addPlayer(nextPlayer, onPlayerAdded);
	//if not restart host and select game
	//else find out if any player has joined (players gameInfo != available players)
	//if not restart host and select game
	//add this player as next available player to game (for now!)
	//goto waitingForGameReady 

}
function onPlayerAdded(d) {
	prelude(getFunctionCallerName(), d);
	if (isError(d)) { restartHost(onHostStarted); return; }
	d = d.response;
	//habe S.gameInfo{num_players:[3,4],name,players:[plid]}, S.availablePlayers[plid], S.plAddedByMe{plid:uname}
	//console.log('player has been added', S.plAddedByMe);
	//console.log(d);
	//calc whether can send a begin message
	let nap = S.availablePlayers.length - 1; //since just added one more
	let nMax = S.gameInfo.player_names.length;
	let nMin = arrMin(S.gameInfo.num_players);
	let nRegistered = nMax - nap;
	let mustBegin = (nap == 0);
	let canBegin = nRegistered >= nMin;
	//lets first start as soon as possible
	if (canBegin) tryBegin(onBeginRequest);
	else enterWaitingLoop();
}
function enterWaitingLoop() {
	setStatus('waiting for more players!!!');
	//here kommt code fuer periodisches pollen, aber not right now!
}
function onBeginRequest(d) {
	prelude(getFunctionCallerName(), d);
	if (isError(d)) { enterWaitingLoop(); return; }
	d = d.response;
	//console.log(d)
	if (S.settings.useSpec) loadUserSpec([loadUserCode, sendInit]); else sendInit();
	//sendInit();
}


//#region helpers
function prelude(s, d) { 
	console.log('***', s, '***\n', d); 
}
function isError(d) {
	let kathastrophicError = !(typeof d == 'object');
	let someErrorOccurred = 'error' in d;
	if (kathastrophicError) {
		error('KATHASTROPHIC ERROR!!!!!', d)
		alert('KATHASTROPHIC ERROR!!!!! data type ' + (typeof d));
		return true;
	} else if (someErrorOccurred) {
		switch (d.type) {
			case 'parse': return false;
			case 'ajax': return true;
			default: return true;
		}
	}
	return false;
}
