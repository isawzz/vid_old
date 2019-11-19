function _init_socketio(){

var socket = io.connect(SERVER_URL);
socket.on('connect',()=>{socket.send('User has connected!');});

}

function onMessageReceived(d) { 
	prelude(getFunctionCallerName(), d); 
	addMessage(d.data); 
}
function onChatSubmitted(e) { prelude(getFunctionCallerName(), e); e.preventDefault(); emitChat(); }
function onChatReceived(d) { prelude(getFunctionCallerName(), d); addChat(d.data); }

function emitChat(msg = '') { let text = msg + getInputValue('chat'); if (!empty(text)) { console.log('emit', text); sock.emit('chat', { client: clientData, data: text }); } }
