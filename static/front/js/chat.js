var socket = null;


function openSocket() {
	if (!USE_SOCKETIO) return;
	if (socket != null) { socket.open(); return; }
	socket = io.connect(SERVER_URL);
	//socket.on('disconnect', () => { socket.emit('message', 'User ' + clientData.name + ' has left!'); });
	socket.on('connect', () => { socket.emit('message', 'User ' + clientData.name + ' has connected!'); });
	socket.on('message', onMessageReceived);
	socket.on('chat', onChatReceived);


}
function closeSocket() {
	if (!USE_SOCKETIO) return;
	if (clientData.name !== null && socket !== null) {
		socket.emit('message', clientData.name + ' has left');
		socket.close();
	}
}
function socketEmitMessage(msg) {
	if (!USE_SOCKETIO) return;

	if (isDict(msg)) msg = JSON.stringify(msg);
	socket.emit('message', msg);
}
function socketEmitChat(msg = '') {
	if (!USE_SOCKETIO) return;
	let text = msg + getInputValue('chat');
	if (!empty(text)) { socket.emit('chat', text); }
}

function onMessageReceived(d) { if (!USE_SOCKETIO) return; processMessage(d); }
function onChatSubmitted(e) { if (!USE_SOCKETIO) return; e.preventDefault(); socketEmitChat(); }
function onChatReceived(d) { if (!USE_SOCKETIO) return; addChat(d); }

function tryConvertToJSON(s) {
	let res = null;
	try { res = JSON.parse(s); return res; }
	catch{
		//console.log('*** tryConvertToJSON *** no json:',s);
		return null;
	}
}

function processMessage(msg) {
	console.log('*** processMessage *** message is:\n', msg);
	let omsg = tryConvertToJSON(msg);
	if (omsg) {
		let msgType = omsg.type;
		console.log('got message', msgType, omsg);

		if (omsg.type == 'gc') {
			S.gameConfig = omsg.data;
			addMessage('updated game configuration!');
		} else if (omsg.type == 'started') {
			//TODO: spaeter mal: only send started to players in game!
			addMessage(omsg.data);
			//if this client is part of game, can now send a status start
			if (iAmInGame() && !iAmStarter()) {
				console.log('I,', USERNAME, 'am in the game!!!!!')
				_startNewGame('joiner');//AsJoiner();
			}
		} else if (omsg.type == 'poll') {
			//soll status holen
			let pl = omsg.data; // pl is the waited_for player!!!!
			if (isMyPlayer(pl)) {
				let uname = getUsernameForPlayer(pl);
				pollStatusAs(uname);
			}
		} else if (omsg.type == 'end') {
			console.log('received end!!!');
			G.signals.receivedEndMessage = true;
			//soll status holen
			let pl = omsg.data; //this time, pl is the sender!!!!!
			if (!isMyPlayer(pl)) {
				let uname = getUsernameForPlayer(pl);
				pollStatusAs(uname);
			}
		}
		return;
	}
	addMessage(msg);
	let parts = msg.split(' ');
	// username joined as White
	if (parts.length > 3 && startsWith(parts[1], 'join')) {
		let uname = parts[0];
		let plid = parts[3].trim();
		let players = S.gameConfig.players;
		//look for player with this player id:
		let plChosen = firstCond(players, x => x.id == plid);
		if (plChosen) {
			if (isJoinMenuOpen()) closeJoinConfig();
			plChosen.username = uname;
			if (checkGameConfigComplete() && iAmStarter()) {
				_startNewGame('starter');//AsStarter();
			}
		}
		//username has joined the game, need to add his name to player id
	}
}
