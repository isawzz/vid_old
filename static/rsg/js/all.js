var G, S, M, UIS, IdOwner, id2oids, id2uids, oid2ids;
var dHelp, counters, timit; //for testing
var DELETED_IDS = [];
var DELETED_THIS_ROUND = [];

//flow: 
// _mStart = prep => sendInit => process => setup => ||: gamestep = present => interact => sendAction => process :|| 
// interact can lead to _mStart (restart, loadGame, switchGame, gameOver)
function gameStep() {
	DELETED_THIS_ROUND = [];
	timit.showTime('start presentation!');

	presentTable();

	//timit.showTime('...objects presented!');
	presentPlayers();

	presentStatus();

	presentLog();
	if (G.end) { presentEnd(); return; }

	// timit.showTime('...log presented!');
	////console.log(	S.vars.switchedGame)
	if (S.vars.switchedGame) {
		//adjustPlayerAreaWise(); //does NOT work!!!!!
		S.vars.switchedGame = false;
	}



	if (G.tupleGroups) {
		presentActions();
		timit.showTime('...presentation done!');
		startInteraction();	//...this will eventually end in sendAction>processData>gameStep
	} else presentWaitingFor();
}

//#region init
function inferPlayerColorFromNameOrInit(plid,index){
	let cname = plid.toLowerCase();
	if (cname in playerColors) return playerColors[cname];
	if (nundef(index)) index=0;
	let ckeys = getKeys(playerColors);
	return playerColors[ckeys[index]%playerColors.length];
}
const playerColors = {
	red: '#D01013',
	blue: '#003399',
	green: '#58A813',
	orange: '#FF6600',
	yellow: '#FAD302',
	violet: '#55038C',
	pink: '#ED527A',
	beige: '#D99559',
	sky: '#049DD9',
	brown: '#A65F46',
	white:'#FFFFFF',
};

function initPlayers() {
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
		//let name = isdef(pl.name) ? pl.name : isdef(pl.color) ? id : capitalize(colorName);
		let username = isdef(S.gameInfo.userList) ? S.gameInfo.userList[i]
			: isdef(S.plAddedByMe) && S.plAddedByMe[id] ? S.plAddedByMe[id] : 'unknown' + i;
		//TODO: find out how to get other usernames
		S.players[id] = { username: username, id: id, color: color, altName: altName, index: i };
		i += 1;
	}
}
function restartGame() { //just clear structures etc. and restart with same settings
	//TODO clear structures and data, sendInit, gameStep
}
function loadGame() { }
function saveGame() { }
function clearGame() { }
function clearAll() { }

