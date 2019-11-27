var ROOT = null; //root of UIS domId('root')
const AREAS = {
	a_d_action_header: ['--wActions', '--hStatus'],
	a_d_status: ['--wGame', '--hStatus'],
	a_d_history_header: ['--wLog', '--hStatus'],

	a_d_actions: ['--wActions', '--hGame'],
	a_d_game: ['--wGame', '--hGame'],
	a_d_log: ['--wLog', '--hGame'],

	a_d_buttons: ['--wActions', '--hTesting'],
	a_d_testing: ['--wGame', '--hTesting'],
	a_d_options: ['--wLog', '--hTesting'],
}
function initPageHeader() {
	pageHeaderSetGame();
	pageHeaderSetPlayers();
}
function isPlain() { return !S.settings.boardDetection && !S.settings.userStructures }
function initTABLES() {
	//prepare areas for default objects
	let tables = {
		a_d_game: S.settings.gameAreaSize,
	};
	document.getElementById('c_d_statusInHeaderText').innerHTML = ''
	if (isPlain()) {
		let space = 400;
		let pmainSpace = space;
		let pothersSpace = (space - 100) * (S.gameConfig.numPlayers - 1);

		//document.getElementById('a_d_player_header').innerHTML = '';
		setCSSVariable('--wPlayers', '' + pothersSpace + 'px');

		S.settings.table.defaultArea = 'a_d_objects';
		S.settings.player.defaultArea = 'a_d_player'; //'a_d_options';
		S.settings.player.defaultMainArea = 'a_d_game';
		tables.a_d_game = [pmainSpace, 800];
		document.getElementById('c_d_statusText').innerHTML = 'Me'
	} else {
		document.getElementById('a_d_player_header').innerHTML = '<p>players</p>';
		setCSSVariable('--wPlayers', '290px');
		S.settings.table.defaultArea = 'a_d_objects';
		S.settings.player.defaultArea = 'a_d_player'; //'a_d_options';
		S.settings.player.defaultMainArea = null;
		let d = document.getElementById('a_d_game');
		d.style.overflow = 'visible';
		d.classList.remove('flexWrap')
	}

	for (const areaName of [S.settings.table.defaultArea, S.settings.player.defaultArea, S.settings.player.defaultMainArea]) {
		if (areaName === null) continue;
		let d = document.getElementById(areaName);
		if (d.id != 'a_d_player') {d.style.overflowY = 'auto';d.style.overflowX='hidden';}
		d.classList.add('flexWrap');
	}

	//set game area size
	for (const areaName in tables) {
		//TODO: add area if not exists as Tab in previous area! for now, just existing areas!
		setAreaWidth(areaName, tables[areaName][0]);
		setAreaHeight(areaName, tables[areaName][1]);
	}
}
function setAreaWidth(areaName, w) {
	let wString;
	let wNum = null;
	if (isString(w)){
		console.log(w)
		let n = firstNumber(w);
		if (isNumber(n)) wNum = n;
		wString = w;
	}else {
		wNum = w;
		wString = ''+w+'px';
	}
	let varName = AREAS[areaName][0];
	setCSSVariable(varName, wString);
	if (UIS[areaName] && wNum) UIS[areaName].w = wNum;
	console.log('width of', areaName, w,wNum,wString);
}
function setAreaHeight(areaName, h) {
	let varName = AREAS[areaName][1];
	let hAttr = isNumber(h)? '' + h + 'px':h;
	setCSSVariable(varName, hAttr);
	if (UIS[areaName]) UIS[areaName].h = h;
	console.log('height of', areaName, h,'attr',hAttr)
}
function growIfDefaultMainAreaWidth(ms) {
	//return;
	console.log('real w of table:',ms.parts.table.offsetWidth)
	console.log('width of table is:', ms.elem.offsetWidth, ms.elem, ms.idParent);
	let wElem = ms.parts.table.offsetWidth; //ms.elem.offsetWidth;
	let areaName = ms.idParent;
	if (isdef(wElem) && isdef(AREAS[areaName])) {
		let wNeeded = wElem + 40;
		let wArea = UIS[areaName].w;
		console.log('wNeeded',wNeeded,'wArea',wArea);
		if (wArea < wNeeded || wArea > wNeeded+100) {
			setAreaWidth(areaName, wNeeded);
			console.log('---> w of', areaName, 'from', wArea, 'to', wNeeded);
		}

	}

}
function initDom() {
	// timit.showTime(getFunctionCallerName());
	ROOT = makeRoot();

	createMSTree(ROOT); //existing DOM wrapped in MS, each area stored in UIS
	// timit.showTime('...ms tree built');

	simpleColors(S.settings.color.theme);
	// timit.showTime('...colors');

	measureMSTree(ROOT); //each div is measured: x,y,w,h
	// timit.showTime('...measure tree');

}
function createMSTree(ms) {
	let areas = ms.elem.children;
	//console.log(areas);
	for (const ch of [...areas]) {
		if (!ch.id) { continue; } //console.log('not created:',ch);
		//console.log(ch)
		let msChild = makeDomArea(ch);
		if (ch.id == 'a_d_settings' || ch.id == 'a_d_main_menu') continue; // do NOT create UIS for chrome in settings window
		//console.log(msChild)
		createMSTree(msChild);
	}
}
function measureMSTree(root) {
	//list of relevant dom els: named divs
	let divs = root.elem.getElementsByTagName('div');
	let divNames = [...divs].map(x => x.id);
	divNames = divNames.filter(x => !empty(x));
	divNames.map(x => { measureDomel(UIS[x]) });

	//correct measurement for hidden divs (tabs)
	let tabDivs = domId('a_d_testing').getElementsByClassName('divInTab');
	let correctTabName = 'a_d_objects';
	let correctMS = UIS[correctTabName];
	for (const div of [...tabDivs]) {
		let id = div.id;
		if (id == correctTabName) continue;
		let ms = UIS[id];
		ms.x = correctMS.x; ms.y = correctMS.y; ms.w = correctMS.w; ms.h = correctMS.h;
	}
}
function getAsInt(ms, styleInfo, prop) {
	let h = styleInfo.getPropertyValue(prop);
	h = trim(h);
	// console.log(h[h.length-1]);
	if (h[h.length - 1] == '%') {
		let perc = firstNumber(h);
		let parent = UIS[ms.idParent];
		h = parent.h * perc / 100;
		h = Math.round(h);
	} else if (h[h.length - 1] == 'x') {
		h = h.substring(0, h.length - 2);
		h = Number(h);
		h = Math.round(h);
	} else if (h == 'auto') {
		h = UIS[ms.idParent].h;
	}
	return h;
}
function measureDomel(ms) {
	//only works for divs (HTML elems), not for svg or g elems!!!
	//measure sets x,y,w,h from ms.elem or from parent size
	let el = ms.elem;
	//console.log('>>>>>>>>>>measuring',el.id,el.height,el.offsetHeight,$(el).position(),$(el).height(),$(el).width())
	// ms.w = Math.round($(el).width());
	// ms.h = Math.round($(el).height());
	// let pos = $(el).position(); 
	// //console.log('------------------------->',pos)
	// if(isdef(pos)){ms.x=Math.round(pos.left);ms.y=Math.round(pos.top);}else {ms.x=0;ms.y=0;}

	let info = window.getComputedStyle(el, null);
	// let h = window.getComputedStyle(el, null).getPropertyValue("height");
	// console.log(ms.id,h)
	//console.log(ms.id,info.left,info.top,info.width,info.height)
	ms.x = getAsInt(ms, info, 'left');
	ms.y = getAsInt(ms, info, 'top');
	ms.w = getAsInt(ms, info, 'width');
	ms.h = getAsInt(ms, info, 'height');

	// info.left == 'auto'?0:Math.round(firstNumber(info.left));
	// ms.y=info.top=='auto'?0:Math.round(firstNumber(info.top));
	// ms.w = info.width=='auto'?0:Math.round(firstNumber(info.width));
	// ms.h = info.height=='auto'?0:Math.round(firstNumber(info.height));
	ms.bg = info.backgroundColor;
	ms.fg = info.color;
	//console.log(ms.id,info);


	//ms.w = el.offsetWidth; ms.h = el.offsetHeight; ms.x = el.offsetLeft; ms.y = el.offsetTop;
	return [ms.x, ms.y, ms.w, ms.h];
}
function simpleColors(c = 'powderblue') {
	// timit.showTime(getFunctionCallerName());

	let pal = getPalette(c);
	S.settings.palette = pal;

	ROOT.children.map(x => UIS[x].setBg(pal[2], true));

	setCSSVariable('--bgBody', pal[5]);
	UIS['a_d_header'].setBg(pal[7]);

	UIS['a_d_action_header'].setBg(pal[3]);
	UIS['a_d_history_header'].setBg(pal[3]);

	UIS['a_d_game'].setBg(pal[1]);

	let c1 = pal[1];
	setCSSVariable('--bgTabActive', c1);
	setCSSVariable('--bgTabContent', c1);
	UIS['a_d_testing'].setBg(pal[2]);
	UIS['a_d_testing'].children.map(x => { UIS[x].setBg(c1); UIS[x].setFg('silver'); });

	setCSSVariable('--bgButton', pal[0]);
	setCSSVariable('--fgButton', 'white');
	setCSSVariable('--bgButtonHover', pal[3]);
	setCSSVariable('--bgButtonActive', pal[5]);

	// timit.showTime('end of colors');

}


//#region page header helpers
function pageHeaderClearAll() {
	pageHeaderClearPlayers();
	pageHeaderClearGame();
	//console.log('cleared page header!')
}
function pageHeaderClearGame() {
	UIS['a_d_divGamename'].clear();
}
function pageHeaderClearPlayers() {
	UIS['a_d_divPlayerNames'].clear({ innerHTML: '<div style="float:left">Players:&nbsp;</div>' });
}
function pageHeaderSetGame() {
	let divGamename = document.getElementById('a_d_divGamename');
	divGamename.innerHTML = `<div style='float:right;margin:14px'><b>${allGames[GAME].name}</b><br>(${PLAYMODE})</div>`;
}
function pageHeaderSetPlayers() {
	let divPlayerNames = document.getElementById('a_d_divPlayerNames');

	let s = '<div style="float:left">Players:&nbsp;</div>';//&nbsp;';
	for (const pid in G.playersAugmented) {
		let pl = G.playersAugmented[pid];
		spl = pageHeaderGetPlayerHtml(pl.username, pid, pl.color, pl.isMe);
		s += spl;
	}
	divPlayerNames.innerHTML = s;
}
function pageHeaderAddPlayer(username, playerId, color, asMe = false) {
	let divPlayerNames = document.getElementById('a_d_divPlayerNames');
	divPlayerNames.insertAdjacentHTML('beforeend', pageHeaderGetPlayerHtml(username, playerId, color, asMe));

}
function pageHeaderGetPlayerHtml(username, playerId, color, asMe) {
	// let spl = `<div id='c_c_${username}' class='playerHeader'><div>${username}${asMe ? ' (me)' : ''}</div><div style='color:${color}'>${playerId}</div></div>`
	let spl = `<div id='c_c_${username}' class='playerHeader'><div>${username}</div><div style='color:${color}'>${playerId}</div></div>`
	return spl;
}












function simpleSizes_unused(wGame = 1000, hGame = 800, wSide = 200) {
	setCSSVariable('--wGame', wGame + 'px');
	setCSSVariable('--hGame', hGame + 'px');
	setCSSVariable('--wActions', wSide + 'px');
	setCSSVariable('--wLog', wSide + 'px');
	setCSSVariable('--hStatus', 'auto');
	setCSSVariable('--hTesting', '100%');
}

