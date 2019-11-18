function _startHotseat() {
	//console.log('loooooooooooooooooooooong');
	timit.start_of_cycle(getFunctionCallerName());
	S.vars.switchedGame = true;
	S.settings.game = GAME;

	checkCleanup();
	// if (!S.vars.firstTime) { //cleanup
	// 	pageHeaderClearAll();
	// 	restoreBehaviors();
	// 	stopBlinking('a_d_status');
	// 	openTabTesting('London');
	// 	UIS['a_d_status'].clear({ innerHTML: '<div id="c_d_statusText">status</div>' });
	// 	UIS['a_d_actions'].clear({ innerHTML: '<div id="a_d_divSelect" class="sidenav1"></div>' });
	// 	let areaPlayer = isdef(UIS['a_d_player']) ? 'a_d_player' : isdef(UIS['a_d_players']) ? 'a_d_players' : 'a_d_options';
	// 	//console.log('area for players is', areaPlayer)
	// 	for (const id of ['a_d_log', 'a_d_objects', areaPlayer, 'a_d_game']) clearElement(id);
	// 	delete S.players;
	// } else S.vars.firstTime = false;

	S.user = {};
	G = { table: {}, players: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }

	if (S.settings.useSpec) loadUserSpec([loadUserCode, sendInitNewGame]); else sendInitNewGame();
}
function loadUserSpec(callbacks = []) {
	timit.showTime(getFunctionCallerName());
	S.path.spec = '/examples_front/' + S.settings.game + '/' + S.settings.game + '_ui.yaml';
	loadYML(S.path.spec, dSpec => {
		S.user.spec = dSpec;
		if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
	});
}
function loadUserCode(callbacks = []) {
	timit.showTime(getFunctionCallerName());
	S.path.script = '/examples_front/' + S.settings.game + '/' + S.settings.game + '_ui.js';
	loadScript(S.path.script, dScript => {
		loadText(S.path.script, code => {
			S.user.script = code;
			//console.log(code);
			if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
		});
	});
}
function sendInitNewGame() {
	timit.showTime('sending restart');
	_sendRoute('/restart', d0 => {
		timit.showTime('sending select game');
		_sendRoute('/game/select/' + S.settings.game, d2 => {
			//console.log(d2, getTypeOf(d2));
			timit.showTime('sending game info');
			_sendRoute('/game/info/' + S.settings.game, d4 => {
				//console.log(d4, getTypeOf(d4));
				S.gameInfo = JSON.parse(d4);
				let chain = [];
				//let users = ['felix', 'amanda', 'lauren', 'anuj', 'tawzz', 'gul', 'vladimir', 'tom'];
				let i = 0;
				S.gameInfo.userList = [];
				for (const pl of S.gameInfo.player_names) {
					let user = i>0?USERNAME + i:USERNAME;
					let cmd = '/add/player/' + user + '/' + pl;
					S.gameInfo.userList.push(user);
					i += 1;
					chain.push(cmd);
				}
				timit.showTime('sending player logins');
				chainSend(chain, d5 => {
					_sendRoute('/begin/1', d6 => {
						let user = S.gameInfo.userList[0];
						timit.showTime('sending status');
						_sendRoute('/status/' + user, d7 => {
							let data = JSON.parse(d7);
							processData(data);
							specAndDOM([gameStep]);
						});
					});
				});
			});
		});
	});
}


















function chainSend(msgChain, callback) {
	let akku = [];
	this.chainSendRec(akku, msgChain, callback);
}
function chainSendRec(akku, msgChain, callback) {
	if (msgChain.length > 0) {
		//console.log('sending:', msgChain[0]);
		_sendRoute(msgChain[0], d => {
			//console.log('received:', d)
			akku.push(d);
			this.chainSendRec(akku, msgChain.slice(1), callback)
		});
	} else {
		//console.log(akku);
		callback(akku);
	}
}
