function _startSolo() {
	//console.log('loooooooooooooooooooooong');
	timit.start_of_cycle(getFunctionCallerName());
	S.vars.switchedGame = true;
	S.settings.game = GAME;

	checkCleanup();

	S.user = {};
	G = { table: {}, players: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }

	if (S.settings.useSpec) loadUserSpec([loadUserCode, sendInitNewSoloGame]); else sendInitNewSoloGame();
}

function sendInitNewSoloGame() {
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
				S.gameInfo.userList = playerList;
				let nPlayers = playerList.length;

				//set usernames

				for (const pl of playerList) {
					if (pl.type == 'me') pl.username = USERNAME;
					else pl.username = pl.type.substring(0, 3) + 'bot' + i;
					i += 1;
				}
				console.log('solo players:',playerList);
				i=0;
				let cmd;
				for (const pl of playerList) {
					if (pl.type == 'me') {
						cmd = '/add/player/' + pl.username + '/' + pl.id;
						chain.push(cmd);
						
					}else{
						cmd = 'add/client/agent/'+ pl.username+'/'+pl.type; //('randy', 'polly', interface='agent', agent_type='pass', timeout=None, seed=I.seed, prob=.5)
						chain.push(cmd);
						cmd = '/add/player/' + pl.username + '/' + pl.id;
						chain.push(cmd);
					}
					i += 1;
				}

				// for (const pl of S.gameInfo.player_names) {
				// 	let user = i > 0 ? USERNAME + i : USERNAME;
				// 	let cmd = '/add/player/' + user + '/' + pl;
				// 	S.gameInfo.userList.push(user);
				// 	i += 1;
				// 	chain.push(cmd);
				// }
				timit.showTime('sending player logins');
				console.log('hotseat player adding', chain);
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
}

