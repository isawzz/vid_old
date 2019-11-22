
function setDefaultSettings() {
	//#region settings fuer entry points: called in _mStart after G,S,M initialized
	document.getElementById('c_b_TTip').textContent = 'tooltips: ' + S_tooltips;

	// //init username in main menu: 
	// let checkedNameInput = document.getElementById('c_b_mm_'+USERNAME.toLowerCase());
	// // console.log(checkedNameInput);
	// checkedNameInput.checked = true;

	// init username in main menu: 
	let checkedModeInput = document.getElementById('c_b_mm_' + PLAYMODE.toLowerCase());
	// console.log(checkedModeInput);
	checkedModeInput.checked = true;

	//init username in main menu: 
	let checkedGameInput = document.getElementById('c_b_mm_' + GAME.toLowerCase());
	// console.log(checkedNameInput);
	checkedGameInput.checked = true;

	let opt = { present: { object: {}, player: {} }, game: {} };
	opt.present.object.createDefault = true; // miss | true | false
	opt.present.player.createDefault = true; // miss | true | false
	opt.present.object.defaultArea = S_defaultObjectArea;
	opt.present.player.defaultArea = S_defaultPlayerArea;
	opt.present.object.optin = null;
	opt.present.object.optout = ['obj_type', 'id'];
	opt.present.player.optin = null;
	opt.present.player.optout = ['id', 'color'];

	opt.colors = ['#6B7A8F'];//,'powderblue','#07061c', '#6a1c81', '#f4695c']; //takes first one only
	opt.gap = 0;
	opt.outerGap = false;

	opt.clickToSelect = true;
	opt.tooltips = document.getElementById('c_b_TTip').textContent.includes('ON');

	opt.useSpec = S_useSpec;
	opt.useBehaviors = S_useSpec && S_useBehaviors; //code might reference to spec objects such as areas

	opt.game = GAME;
	opt.playmode = PLAYMODE;

	S.settings = opt;
}
function getUsernameForPlayer(plid) {
	let uname = S.players[plid].username;
	console.log('getUsernameForPlayer', uname);
	return uname;
}
function isMyTurn(id) { return startsWith(S.players[id].username,USERNAME); } //playerType == 'me'; }
function isFrontAITurn(id){return S.players[id].playerType == 'AI' && !USE_BACKEND_AI; }



function setAutoplayFunctionForMode(mode, isStartup = false) {
	// in solo playmode, solo player is always index 0 player
	if (nundef(mode)) mode = S.settings.playmode;
	// if (!isStartup) S_autoplayFunction = mode == 'solo' ? (_g, _) => _g.playerIndex != 0 : () => false;
	if (!isStartup) S_autoplayFunction = (_g, _) => isFrontAITurn(_g.player);
}
function setGame(inputElem) {
	GAME = inputElem.value.toString();
}
function setUsername(inputElem) {
	USERNAME = inputElem.value.toString();
}
function setPlaymode(mode, isStartup = false) {
	if (mode != S.settings.playmode) S.playModeChanged = true;
	S.settings.playmode = PLAYMODE = mode;
	//console.log('playmode:',S.settings.playmode,'PLAYMODE',PLAYMODE)
	setAutoplayFunctionForMode(mode, isStartup);
	if (mode == 'solo') {
		//hide(document.getElementById('c_b_join'));
		hide(document.getElementById('c_b_NextPlayer'));
		hide(document.getElementById('c_b_RunToEnd'));
	} else if (mode == 'hotseat') {
		//hide(document.getElementById('c_b_join'));
		show(document.getElementById('c_b_NextPlayer'));
		show(document.getElementById('c_b_RunToEnd'));
	} else if (mode == 'multiplayer') {
		//show(document.getElementById('c_b_join'));
		hide(document.getElementById('c_b_NextPlayer'));
		hide(document.getElementById('c_b_RunToEnd'));
	}
	return mode;
}
function initSETTINGS() {
	setPlaymode(S.settings.playmode, true);

	//take S.user.spec and override default options
	if (isdef(S.user.spec) && isdef(S.user.spec.SETTINGS)) { for (const k in S.user.spec.SETTINGS) { S.settings[k] = S.user.spec.SETTINGS[k]; } }

	//add game specific test buttons (run to...) if specified in user spec / SETTINGS
	initAutoplayToActionButtons();
}
function initAutoplayToActionButtons() {
	//cheats! TODO: remove >transfer to user spec
	if (S.settings.game == 'catan') setKeys(S.settings, ['dev', 'keywords', 'action'], { buy: 'buy devcard', hex: 'place robber', Corner: 'settlement or city', Edge: 'road' })
	else setKeys(S.settings, ['dev', 'keywords', 'action'], {});

	let d = document.getElementById('a_d_autoplay_buttons');
	let buttons = [...d.children];
	let defaultIds = ['c_b_NextPlayer', 'c_b_NextTurn'];
	let kws = lookup(S.settings, ['dev', 'keywords', 'action']);
	if (!kws) kws = {};
	let kwKeys = getKeys(kws);
	//console.log(kws, kwKeys)
	let requiredButtonIds = kwKeys.map(x => 'c_b_RTA_' + x).concat(defaultIds);
	//console.log('buttons should be:', defaultIds.toString(), requiredButtonIds.toString());

	let actualButtons = buttons.filter(x => x.id).map(x => x.id);
	//console.log('buttons are:', actualButtons.toString());

	for (const id of arrMinus(actualButtons, requiredButtonIds)) $('#' + id).remove();
	for (const id of arrMinus(requiredButtonIds, actualButtons)) {
		let b = document.createElement('button');
		let key = id.substring(8);
		//console.log('key',key)
		b.innerHTML = kws[key];
		b.id = id;
		b.onclick = () => onClickRunToAction(b.id, id);
		d.appendChild(b);
	}
}
