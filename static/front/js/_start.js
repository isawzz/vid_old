var view=null;
var socket=null;

function _start(){ //works!!!
	//view sollte locally gesaved werden genauso wie anderer state
	_initServer();


	//_startGame();

	_startLogin();

	login('felix');
	openGameConfig();
}
function _startLogin(){
	
	loginView();

}
function _startLobby(){

	lobbyView();

}
function _startGame(){
	gameView();
	initDom();
	_startHotseat();
}
function _startSoloGame(){
	gameView();
	initDom();
	_startSolo();
}