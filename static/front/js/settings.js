function setDefaultSettings() {
	document.getElementById('c_b_TTip').textContent = 'tooltips: ' + S_tooltips;

	let checkedModeInput = document.getElementById('c_b_mm_' + PLAYMODE.toLowerCase());
	checkedModeInput.checked = true;

	S.settings = { table: {}, player: {}, game: {}, color: {} };

	//general settings defaults S_ settings are hardcoded in _config.js
	S.settings.seed = SEED;
	S.settings.game = GAME;
	S.settings.playmode = PLAYMODE;
	S.settings.clickToSelect = true;
	S.settings.tooltips = document.getElementById('c_b_TTip').textContent.includes('ON');
	S.settings.openTab = S_openTab;
	S.settings.userSettings = S_userSettings;
	S.settings.userStructures = S_userStructures;
	S.settings.userBehaviors = S_userBehaviors;

	setDefaultRSGSettings();
}
function setDefaultRSGSettings() {
	//rsg settings defaults (muss bei game switch resetted werden!)
	S.settings.table.createDefault = true; // miss | true | false
	S.settings.player.createDefault = true; // miss | true | false
	S.settings.boardDetection = S_boardDetection;
	S.settings.deckDetection = S_deckDetection;
	S.settings.useColorHintForProperties = S_useColorHintForProperties;
	S.settings.useColorHintForObjects = S_useColorHintForObjects;
	S.settings.gameAreaSize = S_boardDetection ? [1000, 800] : [1000, '65vh'];
	S.settings.table.defaultArea = S_defaultObjectArea; // S_ hardcoded in _config.js
	S.settings.player.defaultArea = S_defaultPlayerArea;

	//main object/player presentation: uses optin or extendedOptout 
	//default object/player presentation: uses optout or extendedOptout depending on useExtendedOptout setting (or shows all properties)
	S.settings.table.optin = null;
	S.settings.table.optout = ['obj_type', 'id'];
	S.settings.onlySimpleValues = true;
	S.settings.player.optin = null;
	S.settings.player.optout = ['id', 'color', 'altName', 'index'];
	S.settings.extendedOptout = { color: 1, altName: 1, index: 1, username: 1, playerType: 1, player: 1, agentType: 1, obj_type: 1, id: 1, visible: 1, neighbors: 1, fields: 1, edges: 1, corners: 1, row: 1, col: 1 };
	S.settings.useExtendedOptout = true;
	S.settings.table.ignoreTypes = []; //these obj_types will be skipped 

	S.settings.pieceSizeRelativeToLoc = {};
	S.settings.pieceSizeRelativeToLoc.corner = ['w',100]; //[propertyName,percentage_of_propValue]
	S.settings.pieceSizeRelativeToLoc.field = ['w', 30];
	S.settings.pieceSizeRelativeToLoc.edge = ['length',100];
	S.settings.addSymbolToEdges = false;
	S.settings.symbols = {};
	//TODO add symbol keys to yml files!!!!
	//S.settings.symbols.city='castle';
	//S.settings.symbols.settlement='house';

	S.settings.color.theme = '#6B7A8F';
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
	setAutoplayFunctionForMode(mode, isStartup);
	return mode;
}
function initSETTINGS() {

	setDefaultRSGSettings();
	setPlaymode(S.settings.playmode, true);

	//game specific settings have to be reset here!!!
	S.settings.dev = {};

	if (S.settings.userSettings) _mergeOptions();

	//add game specific test buttons (run to...) if specified in user spec / SETTINGS
	_initAutoplayToActionButtons();
	_initCheatButtons();
}

//#region local helpers
function _mergeOptions() {
	if (isdef(S.user.spec) && isdef(S.user.spec.SETTINGS)) {
		for (const k in S.user.spec.SETTINGS) {
			if (isdef(S.settings[k])) {
				S.settings[k] = deepmerge(S.settings[k], S.user.spec.SETTINGS[k], { arrayMerge: overwriteMerge });
			} else {
				S.settings[k] = S.user.spec.SETTINGS[k];
			}
		}
	}
}
function _initAutoplayToActionButtons() {
	let d = document.getElementById('a_d_autoplay_buttons');
	let buttons = [...d.children];
	let defaultIds = ['c_b_NextPlayer', 'c_b_NextTurn', 'c_b_NextPhase'];

	let kws = lookup(S.settings, ['dev', 'run_to_buttons']);
	if (!kws) kws = {};
	let kwKeys = getKeys(kws);
	let requiredButtonIds = kwKeys.map(x => 'c_b_RTA_' + x).concat(defaultIds);
	let actualButtons = buttons.filter(x => x.id).map(x => x.id);

	for (const id of arrMinus(actualButtons, requiredButtonIds)) $('#' + id).remove();
	for (const id of arrMinus(requiredButtonIds, actualButtons)) {
		let b = document.createElement('button');
		let key = id.substring(8);
		b.innerHTML = kws[key];
		b.id = id;
		b.onclick = () => onClickRunToAction(b.id, key);
		d.appendChild(b);
	}
}
function _initCheatButtons() {
	let areaName = 'a_d_cheat_buttons';
	let kws = lookup(S.settings, ['dev', 'cheat_buttons']);
	if (!kws) { hide(areaName); return; }

	show(areaName);
	let d = document.getElementById(areaName);
	let buttons = [...d.children];
	let kwKeys = getKeys(kws);
	let requiredButtonIds = kwKeys.map(x => 'c_b_CHT_' + x);
	let actualButtons = buttons.filter(x => x.id).map(x => x.id);
	for (const id of arrMinus(actualButtons, requiredButtonIds)) $('#' + id).remove();
	for (const id of arrMinus(requiredButtonIds, actualButtons)) {
		let b = document.createElement('button');
		let key = id.substring(8);
		b.innerHTML = kws[key];
		b.id = id;
		b.onclick = () => onClickCheat(key);
		d.appendChild(b);
	}
}
