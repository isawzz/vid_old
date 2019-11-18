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
function specAndDOM(callbacks = []) {
	timit.showTime(getFunctionCallerName());

	//after getting init data: G is up to date, ready to be presented
	initSETTINGS();

	//init DOM: prepare UI for game, structure and table setup
	initPageHeader();
	initTABLES();
	initDom();
	//for now just 1 board detected
	if (S.settings.useSpec) initSTRUCTURES(); else detectBoard(G.table,'a_d_game'); //spaeter kommt das mit board detection!!!

	//openTabTesting('Seattle')
	if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
}
function initPageHeader() {
	pageHeaderSetGame();
	pageHeaderSetPlayers();
}
function initTABLES() {
	// timit.showTime(getFunctionCallerName());

	//prepare areas for default objects
	let tables;
	if (nundef(S.user.spec) && S_boardDetection) {
		S.settings.present.object.defaultArea = 'a_d_objects';
		S.settings.present.player.defaultArea = 'a_d_player'; //'a_d_options';
		//openTabTesting('London');
		tables = {
			a_d_game: [1000, 800],
		};
	} else	if (nundef(S.user.spec)) {
		S.settings.present.object.defaultArea = 'a_d_game';
		S.settings.present.player.defaultArea = 'a_d_player'; //'a_d_options';
		//openTabTesting('London');
		tables = {
			a_d_game: [1000, '65vh'],
		};
	} else{
		S.settings.present.object.defaultArea = 'a_d_objects';
		S.settings.present.player.defaultArea = 'a_d_player'; //'a_d_options';
		tables = S.user.spec.TABLES;
		let d = document.getElementById('a_d_game');
		d.style.overflow = 'hidden';
		d.classList.remove('flexWrap')
		//openTabTesting('Seattle');
	}

	for (const areaName of [S.settings.present.object.defaultArea, S.settings.present.player.defaultArea]) {
		let d = document.getElementById(areaName);
		if (d.id != 'a_d_player') d.style.overflow = 'auto';
		d.classList.add('flexWrap');
	}

	//set table sizes
	//console.log('tables', tables)
	for (const areaName in tables) {
		//TODO: add area if not exists as Tab in previous area! for now, just existing areas!
		let cssVarNameWidth = AREAS[areaName][0];
		let w = tables[areaName][0];
		if (isNumber(w)) w = '' + w + 'px';
		setCSSVariable(cssVarNameWidth, w);
		let cssVarNameHeight = AREAS[areaName][1];
		let h = tables[areaName][1];
		if (isNumber(h)) h = '' + h + 'px';
		setCSSVariable(cssVarNameHeight, h);
	}
}
function initSTRUCTURES() {
	// timit.showTime(getFunctionCallerName());
	let data = S.user.spec.STRUCTURES;
	if (nundef(data)) return;

	for (const areaName in data) {
		//console.log(areaName)
		reqs = data[areaName];
		let ms = createMainDiv(areaName, reqs.location);

		for (const prop in reqs) {
			if (prop == 'location') continue;
			if (prop == 'structure') {
				let info = reqs.structure;

				let func = info.type; // rsg will build a structure of desired type if known! eg., hexGrid, quadGrid,...

				let odict = parseDictionaryName(info.object_pool);
				if (!odict) odict = G.table; //default object pool to get board and board member objects from

				let boardInfo = info.cond; //object in object_pool representing board, its id will be board main id!

				let structObject = window[func](odict, areaName, boardInfo);
				//console.log(structObject,func,areaName)
			} else if (typeof reqs[prop] == 'object' && 'binding' in reqs[prop]) {
				let info = reqs[prop].binding;
				//hier muss ich jetzt registry einsetzen!!!
				/**
				 * wenn ich playerUpdate mache, muss ich 
				 * 
				 */
				let filterFunc = 0;//d
				let statement = `getVisual(${areaName}).set${prop.toUpperCase}(${info.object_pool}.)`
				let odict = parseDictionaryName(info.object_pool);

			} else {
				// rsg tries to set this prop for areaName object! eg., visual props bg, fg, bounds
				let lst = jsCopy(reqs[prop]);

				let func = 'set' + capitalize(prop);
				let params = lst;
				if (!Array.isArray(params)) params = params.split(',');
				if (ms[func] !== null) ms[func](...params);
			}
		}
	}
}
function initDom() {
	// timit.showTime(getFunctionCallerName());
	ROOT = makeRoot();

	createMSTree(ROOT); //existing DOM wrapped in MS, each area stored in UIS
	// timit.showTime('...ms tree built');

	simpleColors(S.settings.colors[0]);
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
	S.settings.palette=pal;

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
	console.log('cleared page header!')
}
function pageHeaderClearGame() {
	UIS['a_d_divGameName'].clear();
}
function pageHeaderClearPlayers() {
	UIS['a_d_divPlayerNames'].clear({ innerHTML: '<div style="float:left">Players:&nbsp;</div>' });
}
function pageHeaderSetGame() {
	let divGameName = document.getElementById('a_d_divGameName');
	divGameName.innerHTML = `<div style='float:right;margin:14px'><b>${capitalize(GAME)}</b><br>(${PLAYMODE})</div>`;
}
function pageHeaderSetPlayers() {
	let divPlayerNames = document.getElementById('a_d_divPlayerNames');

	let s = '<div style="float:left">Players:&nbsp;</div>';//&nbsp;';
	for (const pid in G.playersAugmented) {
		let pl = G.playersAugmented[pid];
		spl = pageHeaderGetPlayerHtml(pl.username,pid,pl.color,pl.isMe);
		s += spl;
	}
	divPlayerNames.innerHTML = s;
}
function pageHeaderAddPlayer(username, playerId, color, asMe = false) {
	let divPlayerNames = document.getElementById('a_d_divPlayerNames');
	divPlayerNames.insertAdjacentHTML('beforeend', pageHeaderGetPlayerHtml(username,playerId,color,asMe));
	
}
function pageHeaderGetPlayerHtml(username,playerId,color,asMe){
	// let spl = `<div id='c_c_${username}' class='playerHeader'><div>${username}${asMe ? ' (me)' : ''}</div><div style='color:${color}'>${playerId}</div></div>`
	let spl = `<div id='c_c_${username}' class='playerHeader'><div>${username}</div><div style='color:${color}'>${playerId}</div></div>`
	return spl;
}
//#endregion












function simpleSizes_unused(wGame = 1000, hGame = 800, wSide = 200) {
	setCSSVariable('--wGame', wGame + 'px');
	setCSSVariable('--hGame', hGame + 'px');
	setCSSVariable('--wActions', wSide + 'px');
	setCSSVariable('--wLog', wSide + 'px');
	setCSSVariable('--hStatus', 'auto');
	setCSSVariable('--hTesting', '100%');
}

