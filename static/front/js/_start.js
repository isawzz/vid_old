var view=null;
var socket=null;

function _start(){ //works!!!
	//view sollte locally gesaved werden genauso wie anderer state
	_startLogin();
}
function _startLogin(){
	
	loginView();

}
function _startLobby(){

	lobbyView();

}
function _startGame(){
	gameView();
	_SYS_START();
}