function addListItem(idParent, text) {
	const parent = document.getElementById(idParent);
	const el = document.createElement('li');
	el.innerHTML = text;
	parent.appendChild(el);
	parent.scrollTop = el.offsetTop;
}
function addChat(msg) { addListItem('chatEvent', msg); }
function addMessage(msg) { 
	setMessage(msg); 
	addListItem('events', msg); 
}
function setMessage(msg) { const parent = document.getElementById('status_message'); parent.innerHTML = msg;  }
function clearChat() { clearElement(document.getElementById('chatEvent')); }
function clearMessages() { clearElement(document.getElementById('events')); }
function enableJoinButton() { enableButton('bJoinGame'); }
function enableCreateButton() { enableButton('bCreateGame'); }
function enableResumeButton() { 
	//console.log('disabling RESUME button');
	enableButton('bResumeGame'); 
}
function enableButton(id) { enableStyle(id) }
function disableJoinButton() { disableButton('bJoinGame'); }
function disableCreateButton() { disableButton('bCreateGame'); }
function disableResumeButton() { 
	//console.log('disabling RESUME button');
	disableButton('bResumeGame'); 
}
function disableButton(id) { disableStyle(id); }
function getInputValue(id) { const input = document.getElementById(id); const text = input.value; input.value = ''; return text; }
function gameView() { 
	setIsReallyMultiplayer();

	if (!isReallyMultiplayer){
		hide('c_b_PollStatus');
	}

	document.title = GAME+' '+USERNAME;
	view = 'game'; isPlaying = true; 
	hideLobby(); hideLogin(); showGame(); 
	removeAllGlobalHandlers(); 
	addGameViewHandlers();  //das sind nur die key handlers

}
function loginView() { 
	view = 'login'; hideLobby(); showLogin(); hideGame(); clearChat(); clearMessages(); 
	removeAllGlobalHandlers(); 
	addLoginViewHandlers(); 
}
function lobbyView() { 
	view = 'lobby'; 
	hideLogin(); 
	showLobby(); 
	hideGame(); 
	updateLoginHeader(); 
	removeAllGlobalHandlers(); 
	addLobbyViewHandlers(); 
	//enable resume button if isPlayer
	if (isPlaying) enableResumeButton(); else disableResumeButton();
	//console.log('lobbyView isPlaying=',isPlaying)
	//enable create game button
	enableCreateButton();
	//enableJoinButton 
	enableJoinButton();
	if (!USE_SOCKETIO) hideEventList(); // openGameConfig();
}

function showGameConfig() { document.getElementById('gameConfig').style.display = null; }
function hideGameConfig() { document.getElementById('gameConfig').style.display = 'none'; }

function showJoinConfig() { show('joinConfig');}
function hideJoinConfig() { hide('joinConfig');}

function showEventList() { document.getElementById('events').style.display = null; }
function hideEventList() { document.getElementById('events').style.display = 'none'; }

function hideGame() { document.getElementById('R_d_root').style.display = 'none'; }
function hideLogin() { document.getElementById('a_d_login').style.display = 'none'; }
function hideLobby() { document.getElementById('a_d_lobby').style.display = 'none'; }
function showGame() { document.getElementById('R_d_root').style.display = null; }
function showLogin() { document.getElementById('a_d_login').style.display = null; }
function showLobby() { 
	document.getElementById('a_d_lobby').style.display = null; 
	if (!USE_SOCKETIO){		document.getElementById('a_d_chat').style.display='none';	}
}
function updateLoginHeader() { document.getElementById('hUsername').innerHTML = 'logged in as <b>' + clientData.name + '</b>'; }
function addGameViewHandlers() { addEventListener('keyup', keyUpHandler); addEventListener('keydown', keyDownHandler); }
function addLoginViewHandlers() { document.getElementById('login_form').addEventListener('submit', onLoginSubmitted); }
function addLobbyViewHandlers() {
	document.getElementById('bLogout').addEventListener('click', onClickLogout);
	if (USE_SOCKETIO)	document.getElementById('chat_form').addEventListener('submit', onChatSubmitted);
	document.getElementById('bJoinGame').addEventListener('click', onClickJoinGameLobby);
	document.getElementById('bCreateGame').addEventListener('click', onClickCreateGameLobby);
	document.getElementById('bResumeGame').addEventListener('click', onClickResumeGameLobby);
}
function removeAllGlobalHandlers() {
	removeEventListener('keyup', keyUpHandler);
	removeEventListener('keydown', keyDownHandler);
	document.getElementById('login_form').removeEventListener('submit', onLoginSubmitted);
	document.getElementById('bLogout').removeEventListener('click', onClickLogout);
	if (USE_SOCKETIO)	document.getElementById('chat_form').removeEventListener('submit', onChatSubmitted);
	document.getElementById('bJoinGame').removeEventListener('click', onClickJoinGameLobby);
	document.getElementById('bCreateGame').removeEventListener('click', onClickCreateGameLobby);
	document.getElementById('bResumeGame').removeEventListener('click', onClickResumeGameLobby);
}

function disableButtonsForMultiplayerGame(){
	if (isReallyMultiplayer) {
		if (iAmStarter()) enableButton('c_b_Restart'); else disableButton('c_b_Restart');
		disableButton('c_b_Step');
		disableButton('c_b_RunToEnd');
	}
}
function notMyTurn(){
	enableButton('c_b_PollStatus');

}
function isMyTurn(){
	disableButton('c_b_PollStatus');
}






