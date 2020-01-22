const clientData = {}; //{ id: sock.id, name, gamename, playerId, state }
var loggedIn = false;

window.onbeforeunload = () => { if (loggedIn) logout(); };

function onLoginSubmitted(e) {
	e.preventDefault();
	let name = getInputValue('login');
	if (isEmpty(name)) name = chooseRandom(names);
	login(name);
}
function onClickLogout() { logout(); }

function login(username) {
	_sendRoute('/login/' + username, d => {
		//console.log('login response', d)
		if (d != username) {
			alert('ERROR: ' + d);
		} else {
			//console.log('!!!!!!!!! settings USERNAME in login!!!!!!')
			USERNAME = clientData.name = d;
			document.title = 'RSG: '+USERNAME;
			loggedIn = true;
			openSocket();
			lobbyView();
		}
	});

}
function logout() {
	closeSocket();
	_sendRoute('/logout/' + clientData.name, d => {
		clientData.name = null;
		loggedIn = false;
		loginView();
	});
}

