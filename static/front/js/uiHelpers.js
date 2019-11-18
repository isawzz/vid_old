function addListItem(idParent,text){
	const parent = document.getElementById(idParent);
	const el = document.createElement('li');
	el.innerHTML = text;
	parent.appendChild(el);
	parent.scrollTop = el.offsetTop;
}
function addChat(msg) {	addListItem('chatEvent', msg);}
function addMessage(msg) { const parent = document.getElementById('status_message'); parent.innerHTML = msg; addListItem('events', msg); }
function clearChat(){clearElement(document.getElementById('chatEvent'));}
function clearMessages(){clearElement(document.getElementById('events'));}
function enableJoinButton(){enableButton('bJoinGame');}
function enableCreateButton(){enableButton('bCreateGame');}
function enableButton(id){enable(id)}
function disableJoinButton(){disableButton('bJoinGame');}
function disableCreateButton(){disableButton('bCreateGame');}
function disableButton(id){disable(id);}
function getInputValue(id){	const input = document.getElementById(id);	const text = input.value;	input.value = '';	return text;}
function gameView(){hideLobby(); hideLogin(); showGame();}
function loginView() { hideLobby(); showLogin(); hideGame(); }
function lobbyView() { hideLogin(); showLobby(); hideGame(); enableJoinButton(); updateLoginHeader(); }
function hideGame() { document.getElementById('R_d_root').style.display = 'none'; }
function hideLogin() { document.getElementById('a_d_login').style.display = 'none'; }
function hideLobby() { document.getElementById('a_d_lobby').style.display = 'none'; }
function showGame() { document.getElementById('R_d_root').style.display = null; }
function showLogin() { document.getElementById('a_d_login').style.display = null; }
function showLobby() { document.getElementById('a_d_lobby').style.display = null; }
function updateLoginHeader(){document.getElementById('hUsername').innerHTML = 'logged in as <b>' + clientData.name + '</b>';}









