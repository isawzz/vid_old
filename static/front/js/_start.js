var view=null;
function _start(){ //works!!!
	//view sollte locally gesaved werden genauso wie anderer state
	_init_socketio(); //
	_startLogin();
}
function _startLogin(){
	loginView();

}
function _startLobby(){

}
function _startGame(){
	gameView();
	_SYS_START();
}