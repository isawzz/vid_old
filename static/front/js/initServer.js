function _initServer() {
	//init host and get gameInfo for all games
	//for now just cheat since I have that info anyway!
	timit = new TimeIt(getFunctionCallerName());
	timit.tacit();

	S = { path: {}, user: {}, settings: {}, vars: { firstTime: true } };
	counters = { msg: 0, click: 0, mouseenter: 0, mouseleave: 0, events: 0 };

	setDefaultSettings();
	S.vars.switchedGame = true;
	S.vars.firstTime = false;

	_initGameGlobals();
	S.gameInProgress = false;
	initDom();
	//presentMainMenu();

}