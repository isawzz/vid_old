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












