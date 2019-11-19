const names = ['felix', 'amanda', 'sabine', 'tom', 'taka', 'microbe', 'dwight', 'jim', 'michael', 'pam', 'kevin', 'darryl', 'lauren', 'anuj', 'david', 'holly'];
const clientData = {}; //{ id: sock.id, name, gameName, playerId, state }

function onLoginSubmitted(e) {
	e.preventDefault();
	let name = getInputValue('login');
	if (empty(name)) name = chooseRandom(names);
	login(name);
}
function onClickLogout() { logout(); }

function login(username) {
	_sendRoute('/login/' + username, d => {
		clientData.name = d;
		openSocket();
		lobbyView();
	});

}
function logout() { 
	closeSocket();
	_sendRoute('/logout', d => { 
		clientData.name = null;
		loginView(); 
	});
}

