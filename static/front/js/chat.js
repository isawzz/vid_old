var socket=null;


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
		socket.emit('message',clientData.name+' has left');
		socket.close();
	}
}
function socketEmit(msg){
	if (!USE_SOCKETIO) return;
	socket.emit('message',msg);
}

function onMessageReceived(d) { if (!USE_SOCKETIO) return;addMessage(d);processMessage(d); }
function onChatSubmitted(e) { if (!USE_SOCKETIO) return;e.preventDefault(); emitChat(); }
function onChatReceived(d) { if (!USE_SOCKETIO) return;addChat(d); }

