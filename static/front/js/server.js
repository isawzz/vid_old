function pollStatusAs(uname) {
	console.log('_________pollStatusAs', uname);
	_sendRoute('/status/' + uname, d7 => {
		let data = JSON.parse(d7);
		console.log('poll data', data);
		if (processData(data)) gameStep();
		else console.log('pollStatusAs: NOT MY TURN!!!! WHAT NOW?!?!?');

	});

}

function sendStatusNewGame() {
	//timit.showTime('sending status init (for joiners)');
	_sendRoute('/status/' + USERNAME, d7 => {
		let data = JSON.parse(d7);
		//console.log('initial data', data)
		processData(data);
		specAndDOM([gameStep]);
		// if (processData(data)) specAndDOM([gameStep]);
		// else console.log('sendStatusNewGame: NOT MY TURN!!!! WHAT NOW?!?!?');

	});
}
function sendInitNewGame() {
	let gc = S.gameConfig;
	let nPlayers = gc.numPlayers;
	let cmdChain = [];
	for (let i = 0; i < nPlayers; i++) {
		let plInfo = gc.players[i];
		let isAI = plInfo.agentType !== null;
		let isBackendAI = USE_BACKEND_AI && isAI;
		if (isBackendAI) {
			let cmd = 'add/client/agent/' + plInfo.username;
			cmdChain.push({ cmd: cmd, f: _postRoute, data: { agent_type: plInfo.agentType, timeout: null } });
			cmd = '/add/player/' + plInfo.username + '/' + plInfo.id;
			cmdChain.push({ cmd: cmd, f: _sendRoute, data: null });
		} else {
			let cmd = '/add/player/' + plInfo.username + '/' + plInfo.id;
			cmdChain.push({ cmd: cmd, f: _sendRoute });
		}
	}
	//timit.showTime('sending init new game (as starter!)');
	_sendRoute('/restart', _ => {
		//timit.showTime('sending select game');
		_sendRoute('/game/select/' + S.settings.game, _ => {
			cmdChainSend(cmdChain, _ => {
				_sendRoute('/begin/' + SEED, _ => {
					let unameStarts = gc.players[0].username;
					//timit.showTime('sending status');
					_sendRoute('/status/' + unameStarts, d7 => {
						let data = JSON.parse(d7);
						if (isReallyMultiplayer) socketEmitMessage({ type: 'started', data: USERNAME + ' has started the game!' });
						processData(data);
						specAndDOM([gameStep]);

					});
				});
			})
		});
	});
}

function sendAction(boat, callbacks = []) {
	//timit.timeStamp('send');
	let pl = G.playersAugmented[G.player];
	let route = '/action/' + pl.username + '/' + G.serverData.key + '/' + boat.desc + '/';
	let t = boat.tuple;
	//console.log('tuple is:',t);

	_sendRoute(route + t.map(x => pickStringForAction(x)).join('+'), data => {
		data = JSON.parse(data)
		processData(data);
		if (!isEmpty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
	});
}

function _postRoute(route, callback, data) {
	if (nundef(counters)) counters = { msg: 0 };
	counters.msg += 1;
	let prefix = last(SERVER_URL) == '/' ? dropLast(SERVER_URL) : SERVER_URL;
	if (route[0] != '/') route = '/' + route;
	let url = prefix + route;
	console.log(counters.msg + ': request sent: ' + url + '\nPOST data:', data);
	$.ajax({
		type: 'POST',
		url: url,
		data: JSON.stringify(data),
		success: response => callback(response),
		error: function (e) {
			callback(e.responseText)
		},
		dataType: "json",
		contentType: "application/json"
	});
}
function _sendRoute(route, callback) { _sendRouteBase(false, route, callback); }
function _sendRouteJS(route, callback) { _sendRouteBase(true, route, callback); }
function _sendRouteBase(returnJS, route, callback) {
	if (nundef(counters)) counters = { msg: 0 };
	counters.msg += 1;
	let prefix = last(SERVER_URL) == '/' ? dropLast(SERVER_URL) : SERVER_URL;
	if (route[0] != '/') route = '/' + route;
	let url = prefix + route;
	//console.log(counters.msg + ': request sent: ' + url);

	$.ajax({
		url: url,
		type: 'GET',
		success: response => {
			try {
				let js = JSON.parse(response);
				if (js.error) { console.log(js.error.msg); }
				if (callback) callback(returnJS ? js : response);
			} catch{
				//console.log('NOT JSON: ',response);
				if (callback) callback(returnJS ? { response: response } : response);
			}

		},
		error: err => { error(err); alert(err); },
	});
}
//#region helpers
function cmdChainSend(msgChain, callback) {
	let akku = [];
	this.cmdChainSendRec(akku, msgChain, callback);
}
function cmdChainSendRec(akku, msgChain, callback) {
	if (msgChain.length > 0) {
		msgChain[0].f(msgChain[0].cmd, d => {
			akku.push(d);
			this.cmdChainSendRec(akku, msgChain.slice(1), callback)
		}, msgChain[0].data);
	} else {
		callback(akku);
	}
}
function pickStringForAction(x) {
	//x is a tuple element, eg., {type:'fixed', val:'pass'} or {ID: "0", val: "hex[0]", type: "obj"}
	//console.log('pickStringForAction',x)
	if (x.type == 'fixed') return x.val;
	if (x.type == 'obj') return x.ID;
	if (x.type == 'player') return x.val;
}


