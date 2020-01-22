function checkCleanup_I() {
	if (isdef(UIS)) {
		stopBlinking('a_d_status');
		hide('passToNextPlayerUI');
		hide('freezer');
		stopInteraction();
		clearLog();
		delete G.end;
		delete G.signals.receivedEndMessage;
		delete G.previousPlayer;
		delete G.player;
		//console.log('checkCleanup_I done!',G.previousPlayer, G.player);
	}
}
function checkCleanup_II() {
	if (isdef(UIS)) {
		checkCleanup_I();

		pageHeaderClearAll();
		restoreBehaviors();
		openTabTesting('London'); //console.log('cleanup2')
		UIS['a_d_status'].clear({ innerHTML: '<div id="c_d_statusText">status</div>' });
		UIS['a_d_actions'].clear({ innerHTML: '<div id="a_d_divSelect" class="sidenav1"></div>' });
		let areaPlayer = isdef(UIS['a_d_player']) ? 'a_d_player' : isdef(UIS['a_d_players']) ? 'a_d_players' : 'a_d_options';
		for (const id of ['a_d_log', 'a_d_objects', areaPlayer, 'a_d_game']) clearElement(id);
	}
}
function checkCleanup_III() {
	
	if (isdef(UIS)) {
		checkCleanup_II();
		delete S.players;
	}
}
function clearPageHeader() {
	UIS['a_d_divPlayerNames'].clear();
}
function clearLog() {
	delete G.log;
	UIS['a_d_log'].clear();
}
function restoreBehaviors() {
	PLAYER_UPDATE = {};
	TABLE_UPDATE = {};
	FUNCS = {};
	PLAYER_CREATE = {};
	TABLE_CREATE = {};
	V = {};
}












