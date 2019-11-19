function openSocket() {
	if (socket != null) { socket.open(); return; }
	socket = io.connect(SERVER_URL);
	//socket.on('disconnect', () => { socket.emit('message', 'User ' + clientData.name + ' has left!'); });
	socket.on('connect', () => { socket.emit('message', 'User ' + clientData.name + ' has connected!'); });
	socket.on('message', onMessageReceived);
	socket.on('chat', onChatReceived);
}
function closeSocket() {
	if (clientData.name !== null && socket !== null) {
		socket.emit('message',clientData.name+' has left');
		socket.close();
	}
}

function onMessageReceived(d) { addMessage(d); }
function onChatSubmitted(e) { e.preventDefault(); emitChat(); }
function onChatReceived(d) { addChat(d); }

