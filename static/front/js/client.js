//let newClient = {id:socket.id,name:username,state:clientState.loggedIn};


const names = ['felix', 'amanda', 'taka', 'microbe', 'dwight', 'jim', 'michael', 'pam', 'kevin', 'darryl', 'lauren', 'anuj', 'david', 'holly', 'rhiannon', 'jeremy', 'unicorn', 'tim'];
const clientData = {}; //{ id: sock.id, name, gameName, playerId, state }
var sock;

function addEventHandlers() {
	window.onbeforeunload = function () {
		sock.emit('disconnect', clientData);
	}
	sock = io();
	console.log('***********************************************')

	sock.on('sys', onSysReceived);
	sock.on('message', onMessageReceived);
	sock.on('loggedIn', onClientLoggedIn);
	sock.on('chat', onChatReceived);
	sock.on('joined', onClientJoined);

	//login('tom');
	//login('diana')

	document.getElementById('login_form').addEventListener('submit', onLoginSubmitted);
	document.getElementById('bLogout').addEventListener('click', onClickLogout);
	document.getElementById('chat_form').addEventListener('submit', onChatSubmitted);
	document.getElementById('bJoinGame').addEventListener('click', onClickJoinGame);
}
function onSysReceived(d) { console.log('sys', d, sock.id); }
function onLoginSubmitted(e) {
	prelude(getFunctionCallerName(), e);
	e.preventDefault();
	let name = getInputValue('login');
	if (empty(name)) name = chooseRandom(names);
	login(name);
}
function onMessageReceived(d) { prelude(getFunctionCallerName(), d); addMessage(d.data); }
function onClientLoggedIn(d) {
	prelude(getFunctionCallerName(), d);
	clientData.id = d.client.id;
	clientData.name = d.client.name;
	clientData.state = d.client.state;

	lobbyView();
	addMessage('Hi, ' + clientData.name + ', your are logged in');
}
function onClientJoined(d) {
	prelude(getFunctionCallerName(), d);
	clientData.state = d.client.state;
}
function onClickLogout() {	prelude(getFunctionCallerName(), clientData.name);	logout(clientData.name);}
function onChatSubmitted(e) { prelude(getFunctionCallerName(), e); e.preventDefault(); emitChat(); }
function onChatReceived(d) { prelude(getFunctionCallerName(), d); addChat(d.data); }
function onClickJoinGame() { prelude(getFunctionCallerName(), 'no param'); joinGame(); }

function emitChat(msg = '') { let text = msg + getInputValue('chat'); if (!empty(text)) { console.log('emit', text); sock.emit('chat', { client: clientData, data: text }); } }
function joinGame() { disableJoinButton(); sock.emit('join', { client: clientData, data: clientData.name }); }
function login(d) {	prelude(getFunctionCallerName(), d);	clientData.name = d;	sock.emit('login', d);}
function logout(username) { sock.emit('logout', username); addMessage(username + ' has left'); clearChat(); clearMessages(); loginView(); }























function handleStateChange(newState) {
	let oldState = clientData.state;
	//state transition!!!
	switch (oldState) {
		default: break;
	}
	clientData.state = newState;
	switch (newState) {
		case 'disconnected': loginView(); enableJoinButton(); clientData = {}; break;
		case 'connected': break;
		case 'loggedIn': break;
		case 'joined': disableJoinButton(); break;
		case 'playing': gameView(); break;
	}
}



























function init_old() {
	prelude(getFunctionCallerName(), [...arguments].concat([sock]));

	sock.on('chat', onChatReceived);
	// sock.on('created', onCreatedReceived);

	// document.getElementById('bJoinGame').addEventListener('click', onClickJoinGame);
	// document.getElementById('bCreateGame').addEventListener('click', onClickCreateGame);

	login('tom');
	//gameView();
	//_SYS_START();
	//emitChat('ddddddddddddddddd');
	//setTimeout(emitChat('hallo'),1300);
}




























function initLobby_ext() {

	sock.on('chat', onChatReceived);
	sock.on('message', onMessageReceived);
	sock.on('status', onClientStateChanged);
	sock.on('created', onCreatedReceived);

	console.log('socket info:\n', sock);

	document.getElementById('bLogout').addEventListener('click', onClickLogout);
	document.getElementById('chat_form').addEventListener('submit', onChatSubmitted);
	document.getElementById('bJoinGame').addEventListener('click', onClickJoinGame);
	document.getElementById('bCreateGame').addEventListener('click', onClickCreateGame);

	//login(chooseRandom(names)); //test code: auto login w/ random name
}



function onCreatedReceived(d) {
	prelude(getFunctionCallerName(), d);
	enableJoinButton(); onMessageReceived(d);
}
function onClickCreateGame() {
	prelude(getFunctionCallerName(), 'no param');
	console.log('clicked create!', clientData, sock);
	disableJoinButton(); //disable join button
	//disableCreateButton(); //disable create button

	//hier muss 
	startNewGame('ttt', d => {
		console.log('should be gameInfo:', d);
		clientData.gameInfo = d;
		sock.emit('created', clientData);
	});


}


function startNewGame(game, callback) {
	_sendRoute('/restart', d0 => {
		console.log(d0);
		_sendRoute('/game/select/' + game, d2 => {
			console.log(d2);
			_sendRoute('/game/info/' + game, d4 => {
				console.log(d4);
				let gameInfo = JSON.parse(d4);
				callback(gameInfo);
			});
		});
	});
}





