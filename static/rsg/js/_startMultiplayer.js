function _startMultiplayer(){
	whichGame(onWhichGame);
}
function sendInit(){
	//which user should initialize if more than 1 user is impersonated???
	//first one I'd say!
	//is there always going to be 1 user w/ USERNAME? I guess so
	//let username = USERNAME;
	// spec and dom? what about 
	//what about restarting a multiplayer game???????
	timit.showTime('sending status');
	_sendRouteJS('/status/' + USERNAME, d7 => {
		//let data = JSON.parse(d7);
		data = d7.response;


		//multiplayer mode: hier muss bereits checken ob GamePlayer in S.plAddedByMe ist
		if (S.settings.playMode == 'multiplayer'){
			//check who GamePlayer is
			if ('players' in data){
				for(const id in data.players){
					let pl = data.players[id];
					if (pl.obj_type == 'GamePlayer'){
						if (pl != G.player){
							//player change
							if (!(id in S.plAddedByMe)){
								//other player! have to wait!!!!
								enterWaitingLoop(); return;
							}
						}
					}
				}
			}
		}

		processData(data);
		specAndDOM([gameStep]);
	});

}