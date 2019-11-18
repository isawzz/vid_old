function _startShort() {
	timit.start_of_cycle(getFunctionCallerName());
	if (isdef(UIS)) {
		stopInteraction();
		clearLog();
	}

	_sendRoute('/begin/1', d6 => {
		//console.log(d6, 'type:', typeof d6);
		let user =  isdef(S.gameInfo.userList) ? S.gameInfo.userList[0]:USERNAME;
		timit.showTime('sending status');
		_sendRoute('/status/' + user, d7 => {
			//console.log(d7, 'type:', typeof d7);
			let data = JSON.parse(d7);
			//console.log(data);
			timit.showTime('start processing');
			processData(data);
			gameStep();
		});
	});
}