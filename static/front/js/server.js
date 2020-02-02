//#region API
function sendAction(boat, callbacks) {
	//timit.timeStamp('send');
	let pl = G.playersAugmented[G.player];
	let route = '/action/' + pl.username + '/' + G.serverData.key + '/' + boat.desc + '/';
	let t = boat.tuple;
	//console.log('tuple is:',t);

	_sendRouteJS(route + t.map(x => _pickStringForAction(x)).join('+'), data => {
		if (!isEmpty(callbacks)) callbacks[0](data, arrFromIndex(callbacks, 1));
	});
}
function sendGetAllGames(callback) {
	_sendRouteJS('/game/available', glist => {
		let chain = [];
		console.log(glist);//glist is a list!!!
		for (const g of glist) chain.push({ cmd: '/game/info/' + g, f: _sendRouteJS, data: null });
		_cmdChainSend(chain, res => {
			//console.log(res);//res is a list of JSON objects 
			let info = {};
			res.map(x => info[x.short_name] = x);
			if (callback) callback(info); // (!isEmpty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
		});
	});
}
function sendInitNewGame() {
	let cmdChain = _prepCommandChain(S.gameConfig);

	//timit.showTime('sending init new game (as starter!)');
	_sendRoute('/restart', _ => {
		//timit.showTime('sending select game');
		_sendRoute('/game/select/' + S.settings.game, _ => {
			_cmdChainSend(cmdChain, _ => {
				_sendRoute('/begin/' + SEED, _ => {
					let unameStarts = S.gameConfig.players[0].username;

					//make sure this is the correct username!!!
					if (unameStarts != USERNAME) {
						alert('username wrong!!!!', unameStarts, USERNAME);
					}
					//timit.showTime('sending status');
					sendStatus(unameStarts, [
						data => {
							if (isReallyMultiplayer) socketEmitMessage({ type: 'started', data: USERNAME + ' has started the game!' });
							gameStep(data);
						}]);
				});
			});
		})
	});
}
function sendRestartGame(username, seed, callbacks) {
	// timit.showTime('sending restart game');
	_sendRoute('/begin/' + seed, d6 => {
		sendStatus(username, callbacks);
	});
}
function sendRoute(cmd, callback) { _sendRoute(cmd, callback); }
function sendStatus(username, callbacks) {
	_sendRouteJS('/status/' + username, data => {
		// console.log('back from _sendStatusJS in sendStatus, data:',data)
		if (!isEmpty(callbacks)) callbacks[0](data, arrFromIndex(callbacks, 1));
	});
}
function sendStatusNewGame() { sendStatus(USERNAME, [gameStep]); }


//#region helpers
function _cmdChainSend(msgChain, callback) {
	let akku = [];
	_cmdChainSendRec(akku, msgChain, callback);
}
function _cmdChainSendRec(akku, msgChain, callback) {
	if (msgChain.length > 0) {
		msgChain[0].f(msgChain[0].cmd, d => {
			akku.push(d);
			_cmdChainSendRec(akku, msgChain.slice(1), callback)
		}, msgChain[0].data);
	} else {
		callback(akku);
	}
}
function _pickStringForAction(x) {
	//x is a tuple element, eg., {type:'fixed', val:'pass'} or {ID: "0", val: "hex[0]", type: "obj"}
	//console.log('pickStringForAction',x)
	if (x.type == 'fixed') return x.val;
	if (x.type == 'obj') return x.ID;
	if (x.type == 'player') return x.val;
}
function _prepCommandChain(gc) {
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
	return cmdChain;
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
	console.log('*** _sendRouteBase *** ', returnJS, route)
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
				//console.log('raw',response);
				//console.log('json',js)
				if (js.error) { console.log(js.error.msg); }
				if (callback) callback(returnJS ? js : response);
			} catch{
				//alert('NOT JSON: '+response);
				if (callback) callback(returnJS ? { response: response } : response);
			}

		},
		error: err => { error(err); alert(err); },
	});
}
//#endregion

