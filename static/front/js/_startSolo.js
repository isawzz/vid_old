function _startSolo() {
	timit.start_of_cycle(getFunctionCallerName());
	S.vars.switchedGame = true;
	S.settings.game = GAME;

	_checkCleanup();

	S.user = {};
	G = { table: {}, players: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }

	//if (S.settings.useSpec) loadUserSpec([loadUserCode, sendInitNewSoloGame_test2]); else sendInitNewSoloGame_test2();
	sendInitNewSolo();
	// if (GAME == 'ttt') sendInitNewSoloGame_test2();
	// else sendInitNewSoloGame_test3();
}
function sendInitNewSolo() {
	S.gameInfo.nPlayers = playerList.length;
	let n = S.gameInfo.nPlayers;
	S.gameInfo.userList = [USERNAME];
	for (let i = 1; i < n; i++) {
		S.gameInfo.userList.push('bot' + i);
	}

	S.gameInfo.playerList = S.gameInfo.player_names.slice(0, S.gameInfo.nPlayers);
	initSolo();
}
function initSolo() {
	let soloUser = S.gameInfo.userList[0];
	let agentNames = S.gameInfo.userList.slice(1);
	let ids = S.gameInfo.player_names.slice(0, S.gameInfo.nPlayers);
	let idSolo = ids[0];
	let idAgents = ids.slice(1);
	console.log('active players:', ids)
	console.log('starting solo game with', soloUser, 'playing', idSolo);
	console.log('AIs:', agentNames, 'playing', idAgents);
	timit.showTime('sending restart');
	_sendRoute('/restart', d0 => {
		timit.showTime('sending select game');
		_sendRoute('/game/select/' + S.settings.game, d2 => {
			_sendRoute('/add/player/' + soloUser + '/' + idSolo, d4 => {
				console.log(d4);
				_createAgents(agentNames, 'regular', d5a => {
					console.log(d5a);
					//make chain just as in hotseat!!!
					let chain = [];
					for (let i = 0; i < agentNames.length; i++) {
						let cmd = '/add/player/' + agentNames[i] + '/' + idAgents[i];
						chain.push(cmd);
					}
					chainSend(chain, d5 => {
						console.log(d5);
						_sendRoute('/begin/1', d6 => {
							console.log(d6);
							let user = S.gameInfo.userList[0];
							timit.showTime('sending status');
							_sendRoute('/status/' + user, d7 => {
								let data = JSON.parse(d7);
								console.log('initial data', data)
								processData(data);
								specAndDOM([gameStep]);
							});
						});
					});
				});
			});
		});
	});
}
