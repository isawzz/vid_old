function setDefaultSettings() {
	document.getElementById('c_b_TTip').textContent = 'tooltips: ' + S_tooltips;

	let checkedModeInput = document.getElementById('c_b_mm_' + PLAYMODE.toLowerCase());
	checkedModeInput.checked = true;

	let opt = { table: {}, player: {}, game: {}, color: {} };

	//general settings defaults
	opt.game = GAME;
	opt.playmode = PLAYMODE;
	opt.clickToSelect = true;
	opt.tooltips = document.getElementById('c_b_TTip').textContent.includes('ON');
	opt.openTab = S_openTab;
	opt.userBehaviors = S_userBehaviors;
	opt.userStructures = opt.userBehaviors || S_userStructures;
	opt.userSettings = opt.userBehaviors || opt.userStructures || S_userSettings;
	S.settings = opt;

	setDefaultRSGSettings();
}
function setDefaultRSGSettings() {
	//rsg settings defaults (muss bei game switch resetted werden!)
	S.settings.table.createDefault = true; // miss | true | false
	S.settings.player.createDefault = true; // miss | true | false
	S.settings.boardDetection = S_boardDetection;
	S.settings.useColorHintForProperties = S_useColorHintForProperties;
	S.settings.useColorHintForObjects = S_useColorHintForObjects;
	S.settings.gameAreaSize = S_boardDetection ? [1000, 800] : [1000, '65vh'];
	S.settings.table.defaultArea = S_defaultObjectArea; // S_ hardcoded in _config.js
	S.settings.player.defaultArea = S_defaultPlayerArea;

	//main object/player rep: uses optin or extendedOptout 
	//default object/player rep: uses optout or extendedOptout depending on useExtendedOptout setting (or shows all properties)
	S.settings.table.optin = null;
	S.settings.table.optout = ['obj_type', 'id'];
	S.settings.onlySimpleValues = true;
	S.settings.player.optin = null;
	S.settings.player.optout = ['id', 'color', 'altName', 'index'];
	S.settings.extendedOptout = {color:0,altName:0,index:0,username:0,playerType:0,player:0,agentType:0,obj_type:0,id:0, visible:0,neighbors:0,fields:0,edges:0,corners:0,row:0,col:0};
	S.settings.useExtendedOptout = true;

	S.settings.color.theme = '#6B7A8F';//,'powderblue','#668dff', '#6a1c81', '#f4695c']; //takes first one only
	S.settings.gap = 4;
	S.settings.outerGap = false;

}

function setAutoplayFunctionForMode(mode, isStartup = false) {
	// in solo playmode, solo player is always index 0 player
	if (nundef(mode)) mode = S.settings.playmode;
	// if (!isStartup) S_autoplayFunction = mode == 'solo' ? (_g, _) => _g.playerIndex != 0 : () => false;
	if (!isStartup) S_autoplayFunction = (_g, _) => isFrontAIPlayer(_g.player);
}
function setGame(inputElem) {
	GAME = inputElem.value.toString();
}
function setUsername(inputElem) {
	//console.log('!!!!!!!!! settings USERNAME in setUsername!!!!!!')
	USERNAME = inputElem.value.toString();
}
function setPlaymode(mode, isStartup = false) {
	if (mode != S.settings.playmode) S.playModeChanged = true;
	S.settings.playmode = PLAYMODE = mode;
	//console.log('playmode:',S.settings.playmode,'PLAYMODE',PLAYMODE)
	setAutoplayFunctionForMode(mode, isStartup);
	// if (mode == 'solo') {
	// 	//hide(document.getElementById('c_b_join'));
	// 	hide(document.getElementById('c_b_NextPlayer'));
	// 	hide(document.getElementById('c_b_RunToEnd'));
	// } else if (mode == 'hotseat') {
	// 	//hide(document.getElementById('c_b_join'));
	// 	show(document.getElementById('c_b_NextPlayer'));
	// 	show(document.getElementById('c_b_RunToEnd'));
	// } else if (mode == 'multiplayer') {
	// 	//show(document.getElementById('c_b_join'));
	// 	hide(document.getElementById('c_b_NextPlayer'));
	// 	hide(document.getElementById('c_b_RunToEnd'));
	// }
	return mode;
}
function initSETTINGS() {
	//console.log('initSETTINGS')

	setDefaultRSGSettings();
	setPlaymode(S.settings.playmode, true);


	//game specific settings have to be reset here!!!
	S.settings.dev = {};
	//distinguish between game specific settings (rsg settings) and general UI settings!!!

	//take S.user.spec and override default options
	if (isdef(S.user.spec) && isdef(S.user.spec.SETTINGS)) {
		for (const k in S.user.spec.SETTINGS) {
			//console.log(k, S.settings[k], S.user.spec.SETTINGS[k])
			if (isdef(S.settings[k])) {
				S.settings[k] = deepmerge(S.settings[k], S.user.spec.SETTINGS[k], { arrayMerge: overwriteMerge });
			} else {
				S.settings[k] = S.user.spec.SETTINGS[k];
			}
		}
		//console.log(S.settings)
	}

	//add game specific test buttons (run to...) if specified in user spec / SETTINGS
	initAutoplayToActionButtons();
	initCheatButtons();
}
function initAutoplayToActionButtons() {
	//cheats! TODO: remove >transfer to user spec
	// if (S.settings.game == 'catan') setKeys(S.settings, ['dev', 'run_to_buttons'], { buy: 'buy devcard', hex: 'place robber', Corner: 'settlement or city', Edge: 'road' })
	// else setKeys(S.settings, ['dev', 'run_to_buttons'], {});

	let d = document.getElementById('a_d_autoplay_buttons');
	let buttons = [...d.children];
	let defaultIds = ['c_b_NextPlayer', 'c_b_NextTurn', 'c_b_NextPhase'];
	let kws = lookup(S.settings, ['dev', 'run_to_buttons']);

	if (!kws) kws = {};
	let kwKeys = getKeys(kws);
	//console.log(GAME, kws, kwKeys)
	let requiredButtonIds = kwKeys.map(x => 'c_b_RTA_' + x).concat(defaultIds);
	//console.log('buttons should be:', defaultIds.toString(), requiredButtonIds.toString());

	let actualButtons = buttons.filter(x => x.id).map(x => x.id);
	//console.log('buttons are:', actualButtons.toString());

	for (const id of arrMinus(actualButtons, requiredButtonIds)) $('#' + id).remove();
	for (const id of arrMinus(requiredButtonIds, actualButtons)) {
		let b = document.createElement('button');
		let key = id.substring(8);
		//console.log('key',key,id)
		b.innerHTML = kws[key];
		b.id = id;
		b.onclick = () => onClickRunToAction(b.id, key);
		d.appendChild(b);
	}
}
function initCheatButtons() {
	let areaName = 'a_d_cheat_buttons';
	let kws = lookup(S.settings, ['dev', 'cheat_buttons']);
	if (!kws) { hideElem(areaName); return; }

	showElem(areaName);
	let d = document.getElementById(areaName);
	let buttons = [...d.children];
	let kwKeys = getKeys(kws);
	//console.log(kws, kwKeys)
	let requiredButtonIds = kwKeys.map(x => 'c_b_CHT_' + x);
	//console.log('buttons should be:', defaultIds.toString(), requiredButtonIds.toString());

	let actualButtons = buttons.filter(x => x.id).map(x => x.id);
	//console.log('buttons are:', actualButtons.toString());

	for (const id of arrMinus(actualButtons, requiredButtonIds)) $('#' + id).remove();
	for (const id of arrMinus(requiredButtonIds, actualButtons)) {
		let b = document.createElement('button');
		let key = id.substring(8);
		//console.log('key',key,id)
		b.innerHTML = kws[key];
		b.id = id;
		b.onclick = () => onClickCheat(key);
		d.appendChild(b);
	}
}
