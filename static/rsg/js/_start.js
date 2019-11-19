//start from here ONLY at very first time!!!
function _SYS_START_DO_NOT_CALL() {
	if (nundef(S) || nundef(S.vars)) {
		addEventListener('keyup', keyUpHandler);
		addEventListener('keydown', keyDownHandler);
	} else{ checkCleanup(); }

	timit = new TimeIt(getFunctionCallerName());
	timit.tacit();

	S = { path: {}, user: {}, settings: {}, vars: { firstTime: true } };
	counters = { msg: 0, click: 0, mouseenter: 0, mouseleave: 0, events: 0 };
	DELETED_IDS = [];

	if (S.vars.firstTime) setDefaultSettings();
	console.log('playMode:',S.settings.playMode,'PLAYMODE',PLAYMODE, 'S.playModeChanged',S.playModeChanged)
	S.vars.switchedGame = true;
	S.vars.firstTime = false;
	_initGameGlobals();
	presentMainMenu();

	//testPageHeader();
}
function presentMainMenu() {
	console.log('playMode:',S.settings.playMode,'PLAYMODE',PLAYMODE, 'S.playModeChanged',S.playModeChanged)
	S.gameInProgress = false;
	initDom();
	openTabTesting('Redmond');
}

//helpers
function checkCleanup() {
	if (!S.vars.firstTime) { //cleanup
		pageHeaderClearAll();
		restoreBehaviors();
		stopBlinking('a_d_status');
		openTabTesting('London');
		UIS['a_d_status'].clear({ innerHTML: '<div id="c_d_statusText">status</div>' });
		UIS['a_d_actions'].clear({ innerHTML: '<div id="a_d_divSelect" class="sidenav1"></div>' });
		let areaPlayer = isdef(UIS['a_d_player']) ? 'a_d_player' : isdef(UIS['a_d_players']) ? 'a_d_players' : 'a_d_options';
		//console.log('area for players is', areaPlayer)
		for (const id of ['a_d_log', 'a_d_objects', areaPlayer, 'a_d_game']) clearElement(id);
		delete S.players;
	} else S.vars.firstTime = false;
}
function _initGameGlobals() {
	S.user = {};
	G = { table: {}, players: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }
	DELETED_IDS = [];

}





