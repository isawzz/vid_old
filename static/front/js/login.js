const names = ['felix', 'amanda', 'taka', 'microbe', 'dwight', 'jim', 'michael', 'pam', 'kevin', 'darryl', 'lauren', 'anuj', 'david', 'holly', 'rhiannon', 'jeremy', 'unicorn', 'tim'];
const clientData = {}; //{ id: sock.id, name, gameName, playerId, state }

function onLoginSubmitted(e) {
	prelude(getFunctionCallerName(), e);
	e.preventDefault();
	let name = getInputValue('login');
	if (empty(name)) name = chooseRandom(names);
	login(name);
}
function login(username) {	
	prelude(getFunctionCallerName(), username);	
	_sendRoute('/login/'+username,d=>{
		clientData.name=d;
		console.log(d);
		lobbyView();
	});

}
function onClickLogout() {	prelude(getFunctionCallerName(), clientData.name);	logout();}

function logout() { 
	_sendRoute('/logout',d=>{
		clientData.name=null;
		console.log(d);
		loginView();
	})
	// addMessage(username + ' has left'); clearChat(); clearMessages(); loginView(); 
}
