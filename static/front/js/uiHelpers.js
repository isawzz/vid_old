function addListItem(idParent, text) {
	const parent = document.getElementById(idParent);
	const el = document.createElement('li');
	el.innerHTML = text;
	parent.appendChild(el);
	parent.scrollTop = el.offsetTop;
}
function addChat(msg) { addListItem('chatEvent', msg); }
function addMessage(msg) { const parent = document.getElementById('status_message'); parent.innerHTML = msg; addListItem('events', msg); }
function clearChat() { clearElement(document.getElementById('chatEvent')); }
function clearMessages() { clearElement(document.getElementById('events')); }
function enableJoinButton() { enableButton('bJoinGame'); }
function enableCreateButton() { enableButton('bCreateGame'); }
function enableButton(id) { enable(id) }
function disableJoinButton() { disableButton('bJoinGame'); }
function disableCreateButton() { disableButton('bCreateGame'); }
function disableButton(id) { disable(id); }
function getInputValue(id) { const input = document.getElementById(id); const text = input.value; input.value = ''; return text; }
function gameView() { view='game'; hideLobby(); hideLogin(); showGame(); removeAllGlobalHandlers(); addGameViewHandlers(); }
function loginView() { view='login'; hideLobby(); showLogin(); hideGame(); clearChat(); clearMessages(); removeAllGlobalHandlers(); addLoginViewHandlers(); }
function lobbyView() { view='lobby'; hideLogin(); showLobby(); hideGame(); enableJoinButton(); updateLoginHeader(); removeAllGlobalHandlers(); addLobbyViewHandlers(); }
function hideGame() { document.getElementById('R_d_root').style.display = 'none'; }
function hideLogin() { document.getElementById('a_d_login').style.display = 'none'; }
function hideLobby() { document.getElementById('a_d_lobby').style.display = 'none'; }
function showGame() { document.getElementById('R_d_root').style.display = null; }
function showLogin() { document.getElementById('a_d_login').style.display = null; }
function showLobby() { document.getElementById('a_d_lobby').style.display = null; }
function updateLoginHeader() { document.getElementById('hUsername').innerHTML = 'logged in as <b>' + clientData.name + '</b>'; }
function addGameViewHandlers() { addEventListener('keyup', keyUpHandler); addEventListener('keydown', keyDownHandler); }
function addLoginViewHandlers() { document.getElementById('login_form').addEventListener('submit', onLoginSubmitted); }
function addLobbyViewHandlers() {
	document.getElementById('bLogout').addEventListener('click', onClickLogout);
	document.getElementById('chat_form').addEventListener('submit', onChatSubmitted);
	// document.getElementById('bJoinGame').addEventListener('click', onClickJoinGame);
}
function removeAllGlobalHandlers() {
	removeEventListener('keyup', keyUpHandler);
	removeEventListener('keydown', keyDownHandler);
	document.getElementById('login_form').removeEventListener('submit', onLoginSubmitted);
	document.getElementById('bLogout').removeEventListener('click', onClickLogout);
	document.getElementById('chat_form').removeEventListener('submit', onChatSubmitted);
	// document.getElementById('bJoinGame').removeEventListener('click', onClickJoinGame);

}








