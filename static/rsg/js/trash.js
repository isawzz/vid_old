











//old code: start here mit hotseat mode should work!
function _SYS_RESTART(game = 'ttt', reboot = true) { // ttt | catan
	if (isdef(game)) S_startGame = game; //see settings.js
	S_startGame = game = GAME; //for now!

	let firstTime = nundef(S);
	if (firstTime) { _initHandlersTimerGlobalsDefaultSettings(); S.vars.firstTime = true; }

	if (firstTime || reboot) {

		if (S.settings.playMode == 'multiplayer') {
			if (ROLE == 'leader') {
				createMultiplayerGame()

			} else {
				_newGame(game);
			}

		} else if (S.settings.playMode == 'hotseat') {

		} else { //solo

		}

	} else _newGame(game);
}

function _newGame(game) { if (S_playMode == 'multiplayer') _startMultiplayer(game); else _startHotseat(game); }



