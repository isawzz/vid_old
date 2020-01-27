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

function zoom(percent) {
	console.log('zoom level',percent,'%')
	//document.body.style.zoom = ''+percent+"%"; //unangenehmer hack messes with Ctrl+
	document.body.style.transformOrigin = '0% 0%';
	let factor = percent/100;
	bodyZoom = factor;
	document.body.style.transform = 'scale('+factor+')'; //.5)'; //+(percent/100)+")";
}
function onClickAreaSizes(){
	var width = window.innerWidth;
	var height = window.innerHeight;
	console.log('_____________',width,height);
	let zoomlevel=calcScreenSizeNeeded();
	console.log(zoomlevel)
	zoom(zoomlevel);
}
function calcScreenSizeNeeded(){

	let wAreas = ['a_d_actions','a_d_game','a_d_player','a_d_log'];
	let wTotal=0;
	let wTotal2=0;
	
	for(const a of wAreas){
		let ms = UIS[a];
		let wSoll = ms.w;
		wTotal += wSoll;
		//console.log('ms.w',wSoll);
		let b=getBounds(ms.elem);
		let wIst = Math.round(b.width);
		wTotal2 += wIst;
		//console.log('w ist',wIst);
	}
	//console.log('total width min:',wTotal,'ist',wTotal2, 'aber window nur',window.innerWidth);

	let hAreas = ['a_d_header','a_d_status','a_d_game','a_d_buttons'];
	let hTotal=0;
	let hTotal2=0;
	
	for(const a of hAreas){
		let ms = UIS[a];
		let hSoll = ms.h;
		hTotal += hSoll;
		//console.log('ms.h',hSoll);
		let b=getBounds(ms.elem);
		let hIst = Math.round(b.height);
		hTotal2 += hIst;
		//console.log('w ist',hIst);
	}
	//console.log('total height min:',hTotal,'ist',hTotal2, 'aber window nur',window.innerHeight);

	return (window.innerWidth*100)/wTotal2;
}






