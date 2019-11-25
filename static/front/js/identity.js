//who starts a game 
function addIdentityInformation(){
	if (nundef(S.gameConfig)) S.gameConfig = {};
	let gc = S.gameConfig;
	gc.username = USERNAME;
	
	let myPlayers = [];
	if (gc.gameConfig.players){
		gc.gameStarter = gc.players[0];
		for(const pl of gc.players){
			if (startsWith(pl.username,USERNAME)) myPlayers.push(pl);
			//else if 
		}
	}
}
function whoAmI(){
	let gc = S.gameConfig;
	return {username:USERNAME,playerOnTurn:G.player,myPlayers:[S.gameConfi]}
}
function iAmInGame() {
	//check if gc contains my username USERNAME
	let gc = S.gameConfig;
	let players = gc.players;
	let me = firstCond(players, x => startsWith(x.username, USERNAME));
	return me !== null;
}

