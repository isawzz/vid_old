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
var flags = {};


function gameStep(data) {
	DELETED_THIS_ROUND = [];
	//timit.showTime('start presentation!');

	//console.log(jsCopy(G.serverData))
	//console.log('*** gameStep ***, data',data)
	//console.log('flags',flags)
	console.log('___________________________')

	processData(data); //from here no access to previous serverData


	//console.log('nach processData',data,G,S)

	if (flags.specAndDOM) specAndDOM([gameStepII]); else gameStepII();
}
function gameStepII() {

	//console.log('*** gameStepII ***, data',G.serverData)

	if (S_useSimpleCode) { presentTableSimple(); presentPlayersSimple(); }
	else {presentTable(); presentPlayers(); }

	timit.showTime('presentation done!!!s')
	presentStatus();

	presentLog();
	if (G.end) { presentEnd(); return; }

	//console.log('tupleGroups',G.tupleGroups);
	if (G.tupleGroups) {
		presentActions();
		//timit.showTime('...presentation done!');
		startInteraction();

		//testingMS();

		// if (!isEmpty(commandChain)) {
		// 	let nextCommand = commandChain.shift();
		// 	//unitTestGameloop('____________COMMAND=0/' + execOptions.commandChain.length, nextCommand.name);
		// 	nextCommand();
		// } 

	} else presentWaitingFor();
}







function gameStep1(data) {
	//update
	//console.log(jsCopy(G.serverData))
	G.serverData = data;
	//console.log(jsCopy(G.serverData))

	DELETED_THIS_ROUND = [];
	//timit.showTime('start presentation!');

	//console.log('*** gameStep ***, data', data)
	//console.log('flags', flags)

	//process changes from last round: 
	//if a 
	//initial data:
	//create players
	//create DOM:
	//?are main areas part of rsg or vid? both
	//dedicated areas that are part of rsg:

	processData(data); //from here no access to previous serverData

	if (flags.specAndDOM) specAndDOM([gameStepII]); else gameStepII();
}
