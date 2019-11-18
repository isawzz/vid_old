//#region routes
function availableGames(callback) { let route = '/game/available'; _sendRouteJS(route, callback); }
function whichGame(callback) { let route = '/game/info'; _sendRouteJS(route, callback); }
function selectGame(callback) { let route = '/game/select/' + GAME; _sendRouteJS(route, callback); }
function existingPlayers(callback) { callback({ response: 'hallo' }); }//TODO
function availablePlayers(callback) { let route = '/game/players'; _sendRouteJS(route, callback); }
function addPlayer(playerId, callback) {
	//habe S.gameInfo{num_players:[3,4],name,players:[plid]}, S.availablePlayers[plid], S.plAddedByMe{plid:uname}
	//console.log(S);
	let username = USERNAME;
	if (nundef(S.plAddedByMe)) S.plAddedByMe = {};
	else {
		let up = S.plAddedByMe;
		let unames = Object.values(up);
		let plids = Object.keys(up);
		let i = plids.length;
		username = i == 0 ? USERNAME : USERNAME + i;
	}
	S.plAddedByMe[playerId] = username;
	pageHeaderAddPlayer(username, playerId, inferPlayerColorFromNameOrInit(playerId, S.gameInfo.player_names.indexOf(playerId)));

	//console.log('adding user',username,'as player',playerId)
	let route = '/add/player/' + username + '/' + playerId; _sendRouteJS(route, callback);
}
function tryBegin(callback) { let route = '/begin/1'; _sendRouteJS(route, callback); }
function restartHost(callback) { let route = '/restart'; _sendRouteJS(route, callback); }
function sendAction(boat, callbacks = []) {
	timit.timeStamp('send');
	let pl = G.playersAugmented[G.player];

	let route = '/action/' + pl.username + '/' + G.serverData.key + '/' + boat.desc + '/';
	let t = boat.tuple;
	//console.log('tuple is:',t);

	_sendRoute(route + t.map(x => pickStringForAction(x)).join('+'), data => {
		//console.log(data)
		data = JSON.parse(data)
		processData(data);
		if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
	});
}
















//#region misc helpers

function openTabTesting(cityName) {
	var i, tabcontent, tablinks;

	tabcontent = document.getElementsByClassName('tabcontent');
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = 'none';
	}
	tablinks = document.getElementsByClassName('tablinks');
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(' active', '');
	}
	document.getElementById('a_d_' + cityName).style.display = 'block';
	document.getElementById('c_b_' + cityName).className += ' active';
	//evt.currentTarget.className += ' active';
}
//non-essential functions, could deprecate
function _register(o, keyword, func) {
	if (nundef(S.registry[keyword])) S.registry[keyword] = {};
	S.registry[keyword][o.id] = func;
}
function _runRegistry(keyword) {
	if (nundef(S.registry[keyword])) return;
	for (const id in S.registry[keyword]) {
		S.registry[keyword][id](getVisual(id));
	}
}
function setBackgroundToPlayerColor() {
	//console.log(G.players, G.player);
	let c = G.playersAugmented[G.player].color;
	//setCSSVariable('--bgBody', c); //macht die gaps auf gesamten screen weiss, blau, rot
	// getVisual('a_d_game').setBg(c);
	//getVisual('a_d_game').setBg('transparent');
}
function toggleSettings(b, keyList, prefix, toggleList) {
	let options = S.settings;
	let val = lookup(options, keyList);
	let i = toggleList.indexOf(val);
	let newVal = toggleList[(i + 1) % toggleList.length];
	setKeys(options, keyList, newVal);
	b.textContent = prefix + newVal;

	if (keyList.includes('playMode')) initTableOptions(options.playMode);
}
function toggleTooltips(b) {
	if (S.settings.tooltips) {
		// deactivateTooltips();
		b.textContent = 'tooltips: OFF';
		S.settings.tooltips = false;
	} else {
		// activateTooltips();
		b.textContent = 'tooltips: ON';
		S.settings.tooltips = true;
	}
}
function trash111() {
	let tgServer = G.serverData.tupleGroups;
	// let tupleGroups = [];
	for (const tg of tgServer) {
		let desc = tg.desc.line.toString();
		//console.log(tg, desc)
		let choices = tg.tuples._set; //an array of objects w/ key= '_tuple'
		let tuples = choices.map(x => x._tuple);
		//console.log(choices);
		tupleGroups.push({ desc: desc, tuples: tuples });
	}
	return tupleGroups;
}
//#endregion