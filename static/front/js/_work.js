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

//#region TODO
function disableClick(el) {
	let ms = 'ms' in el ? el.ms : el;
	ms.clickHandler = null;
	ms.disable();
}
function enableClick(el, handler) {
	// //console.log('enableClick_________________start')
	let ms = 'ms' in el ? el.ms : el;
	ms.clickHandler = handler;
	ms.enable();
	// //console.log(ms,el,handler)
	// //console.log('enableClick_________________end')
}
function disableHover(el) {
	let ms = 'ms' in el ? el.ms : el;
	ms.mouseEnterHandler = null;
	ms.mouseLeaveHandler = null;
	ms.disable();
}
function enableHover(el, enterHandler, leaveHandler) {
	// //console.log('enableClick_________________start')
	// //console.log('enterHandler', enterHandler);
	// //console.log('leaveHandler', leaveHandler);
	let ms = 'ms' in el ? el.ms : el;
	ms.mouseEnterHandler = enterHandler;
	ms.mouseLeaveHandler = leaveHandler;
	ms.enable();

	// //console.log(ms, el);
	// //console.log('enableClick_________________end')
}
function glabels(board, ids, func, { bg, fg, contrastBackground = false, force = true, shrinkFont = false, wrap = false, fz = 20 } = {}) {
	for (const id of ids) {
		let el = board.objects[id];
		let val = func(el);
		glabel(el, val, { bg: bg, fg: fg, contrastBackground: contrastBackground, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz });
	}
}
function glabel(el, val, { bg, fg, contrastBackground = false, force = true, shrinkFont = false, wrap = false, fz = 20 } = {}) {
	let ms = el.ms;
	if (contrastBackground) {
		unitTestMS('.................fill black!!!');
		ms.text({ txt: val, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz, bg: 'white', fill: 'black' });
	} else {
		ms.text({ txt: val, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz, bg: bg, fill: fg });
	}
}
function updateColors(o) {
	let pal = S.pals[o.iPalette];
	let bg = pal[o.ipal];
	o.setBg(bg);
	if (o.strInfo && o.strInfo.ipals) {
		//hier muss ich aber wissen ob children colors via parent iPalette gesetzt wurden!
		let ipals = o.strInfo.ipals;
		for (const id of o.ids) {

			let o = getVisual(id);
			if (o.isManual) continue;
			let info = o.memInfo;
			if (info && info.isPal) {
				let ipal = ipals[info.memType == 'field' ? 0 : info.memType == 'corner' ? 1 : 2];
				// if (info.memType == 'edge'){
				// 	//console.log('updating edge color!!!',o.id)
				// }
				o.setBg(pal[ipal], false);
			}
		}
	}
}
function initTableOptions(playmode) {
	if (playmode == 'play') {
		S.settings.table = {
			// //affect: how to handle new objects coming up in object table
			// createDummy: false, //unspecified objects are created as dummy objects in 'objects' tab (under game area)
			// detectBoardLocation: true, //try detecting if this object has a field, edge or corner prop that hints at a board location
			//updateIf: 'changed', // always, changed, new
			// propPlayerIsColor: true,

			//affect: presentation of existing object's properties
			showComplexVals: false, // true, false (show lists and objects)
			optIn: null,
			optOut: { visible: -1, obj_type: -1, row: -1, col: -1, rows: -1, cols: -1, neighbors: -1, corners: -1, edges: -1, fields: -1, id: -1, name: -1 }, //any type names likely not to be relevant for username
			showProps: false,
			sysprop: { player: presentPlayer }, // S.settings.game == 'catan' ? null : {player: presentPlayer},
			fontSize: S.settings.game == 'catan' ? 12 : 60
		};
	} else {
		//dev mode
		S.settings.table = {
			// createDummy: true, //unspecified objects are created as dummy objects in 'objects' tab (under game area)
			// detectBoardLocation: false, //try detecting if this object has a field, edge or corner prop that hints at a board location
			//updateIf: 'always', // always, changed, new
			// propPlayerIsColor: false,

			showComplexVals: true, // true, false (show lists and objects)
			optin: null,
			optOut: { row: -1, col: -1, neighbors: -1, corners: -1, edges: -1, obj_type: -1, name: -1, id: -1 }, //any type names likely not to be relevant for username
			showProps: true,
			sysprop: S.settings.game == 'catan' ? null : { visible: presentVisible },
			fontSize: 12
		};
	}
}
function areaBlink(id) {
	let area = UIS[id];
	if (area) area.elem.classList.add('blink');
}
function stopBlinking(id) {
	let area = UIS[id];
	if (area) area.elem.classList.remove('blink');
}
function evToO(ev) {
	return getVisual(evToId(ev));
}

//#region try commenting out!!!
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

	if (keyList.includes('playmode')) initTableOptions(options.playmode);
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
