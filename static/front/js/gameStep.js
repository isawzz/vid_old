var G, S, M, UIS, IdOwner, id2oids, id2uids, oid2ids;
var dHelp, counters, timit; //for testing
var DELETED_IDS = [];
var DELETED_THIS_ROUND = [];
const playerColors = {
	red: '#D01013',
	blue: '#003399',
	green: '#58A813',
	orange: '#FF6600',
	yellow: '#FAD302',
	violet: '#55038C',
	pink: '#ED527A',
	beige: '#D99559',
	sky: '#049DD9',
	brown: '#A65F46',
	white: '#FFFFFF',
};

function gameStep() {
	DELETED_THIS_ROUND = [];
	timit.showTime('start presentation!');

	presentTable();

	//timit.showTime('...objects presented!');
	presentPlayers();

	presentStatus();

	presentLog();
	if (G.end) { presentEnd(); return; }

	// timit.showTime('...log presented!');
	////console.log(	S.vars.switchedGame)
	if (S.vars.switchedGame) {
		//adjustPlayerAreaWise(); //does NOT work!!!!!
		S.vars.switchedGame = false;
	}



	if (G.tupleGroups) {
		presentActions();
		timit.showTime('...presentation done!');
		startInteraction();	
	} else presentWaitingFor();
}

