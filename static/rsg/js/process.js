//convert data to various objects in G and M >pre-UI processing
function processData(data) {
	if (G.end){
		//noch von voriger runde!
		console.log(USERNAME,'has G.end!!!!')
		stopBlinking('a_d_status');
		stopInteraction();
		clearLog();
		console.log('signals:',G.signals)
		//delete G.signals.receivedEndMessage;
	}
	S.gameInProgress = true;
	timit.showTime('start processing!');

	//if it is another human or backend AI's turn what should I do upon receiving data?
	//I should definitely NOT change player and move for that player!!!!
	//also I should show the game, but NOT show all the data
	//maybe I should present the data
	// I should have a waiting for 
	// I should present and then enter a kind of waiting loop???
	// I should maybe send a msg via sockets each time a user has moved
	// then I could wait for that message and 'itsYouTurn' check whole turn it is and
	// send status if it is my turn or front AI's turn;
	// who is sending front AI's turn? it could be the one whose turn it was last
	// means, I have to wait for me turn to continue playing

	G.serverData = data;
	G.phase = G.serverData.phase;

	processTable(data);
	//console.log('created:',G.tableCreated)
	// timit.showTime('...objects up to date!');
	//let itsMyTurn = 
	processPlayers(data);
	// timit.showTime('...players up to date!');

	// processStatus(); //nothing to do

	//if (!itsMyTurn && !G.serverData.end) return false;

	processLog(data);

	if (processEnd(data)) return;// false; //no more actions or waiting_for!

	if (!processActions(data)) { processWaitingFor(); }

	//return;// itsMyTurn;

	// timit.showTime('...processing done!');

}
function processTable(data) {
	if (!G.table) G.table = {};
	G.tableCreated = [];
	G.tableRemoved = [];
	G.tableUpdated = {}; //updated also has prop change info

	if (data.table) {
		let allkeys = union(Object.keys(G.table), Object.keys(data.table));
		for (id of allkeys) {
			let o_new = id in data.table ? data.table[id] : null;
			let o_old = id in G.table ? G.table[id] : null;
			let changes = propDiffSimple(o_old, o_new); //TODO: could add prop filter here already!!!
			if (changes.hasChanged) {
				G.tableUpdated[id] = changes;
				if (nundef(o_old)) {
					G.tableCreated.push(id);

				} else if (nundef(o_new)) {
					G.tableRemoved.push(id);
					//console.log('removed:',id)
				}
			}
		}
		G.table = data.table;
	}
}
function processPlayers(data) {
	//should also process player change!!!
	//should return true if proceed (it's this terminals turn) or false
	if (!S.players) _initPlayers();  //adding additional player info for RSG! such as index,id,altName,color
	G.playersCreated = [];
	G.playersRemoved = [];
	G.playersUpdated = {}; //updated also has prop change info

	G.previousPlayer = G.player;

	let canProceed = false;

	delete G.playerChanged;
	if (data.players) {
		let plkeys = union(Object.keys(G.players), Object.keys(data.players));
		for (id of plkeys) {
			let pl_new = id in data.players ? data.players[id] : null;
			let pl_old = id in G.players ? G.players[id] : null;
			let changes = propDiffSimple(pl_old, pl_new); //TODO: could add prop filter here already!!!
			if (changes.hasChanged) {
				G.playersUpdated[id] = changes;
				if (nundef(pl_old)) {
					G.playersCreated.push(id);
				} else if (nundef(pl_new)) {
					G.playersRemoved.push(id);
				}
			}
			if (pl_new.obj_type == 'GamePlayer') {
				//id is the GamePlayer!
				//if id is me, do as before: set G.player = id
				//else if id is frontAI, and G.previousPlayer is me, also
				//else DO NOT send a move
				//should I see possible moves of opp? NO
				//maybe should send status and present that instead?
				//header should definitely show who's turn it is
				//actions should NOT be presented!
				if (id != G.previousPlayer) G.playerChanged = true;

				//console.log(id,'isMyPlayer?',isMyPlayer(id))
				//if (G.previousPlayer) console.log(G.previousPlayer,'isMyPlayer?',isMyPlayer(G.previousPlayer))
				//console.log(id,'isFrontAIPlayer?',isFrontAIPlayer(id))

				//console.log('G.player is',G.player)
				if (nundef(G.player) || isMyPlayer(id) || G.player == id || isMyPlayer(G.previousPlayer) && isFrontAIPlayer(id)) {
					G.player = id;
					G.playerIndex = S.players[id].index;
					canProceed = true;
				} else {
					console.log('this must be multiplayer mode!!! OR i will never get here hopefully!!!!!!!!!!!!!!!!')
					console.log('playmode:',PLAYMODE,S.settings.playmode);
					console.log('I am',G.player,'player changed:',G.playerChanged)
					console.log('processPlayers: waiting for',G.serverData.waiting_for);
					console.log('NOT MY TURN!!! HAVE TO WAIT!!!');
				}

			}
		}

		//TODO: if players are created or removed during game, reflect in S.players!!! (for now, just assume player ids/# doesn't change)

		//augment player data
		G.players = data.players;
		G.playersAugmented = jsCopy(G.players);		//compute augmented players for convenience
		for (const pl in G.players) {
			G.playersAugmented[pl].color = S.players[pl].color;
			G.playersAugmented[pl].altName = S.players[pl].altName; //probier es aus!
			G.playersAugmented[pl].id = pl; //probier es aus!
			G.playersAugmented[pl].index = S.players[pl].index; //probier es aus!
			G.playersAugmented[pl].username = S.players[pl].username; //probier es aus!
			G.playersAugmented[pl].playerType = S.players[pl].playerType; //probier es aus!
			G.playersAugmented[pl].agentType = S.players[pl].agentType; //probier es aus!
		}
	}
	return canProceed;
}
var logCounter=0;
function processLog(data) {
	if (!G.log) G.log = {}; 
	let pl = G.player;
	if (!G.log[pl]) G.log[pl]={};
	let dict = G.log[pl];
	G.logUpdated = []; //keys to new logs
	if (isdef(data.log)) {
		for (const logEntry of data.log) {

			//save this log so it isnt created multiple times!!!
			//let key = logEntry.line.map(x => isSimple(x) ? x : x.val).join(' ');
			let key = ''+logCounter+'_'+logEntry.line.map(x => isSimple(x) ? x : x.val).join(' ');
			logCounter += 1;
			
			if (dict[key]) continue;
			dict[key] = logEntry;
			G.logUpdated.push(key);
		}
	}
}
function processEnd(data) {
	G.end = data.end;
	if (G.end) {
		if (G.signals.receivedEndMessage) delete G.signals.receivedEndMessage;
		else socketEmitMessage({ type: 'end', data: G.player });
		setAutoplayFunctionForMode();
	}
	return G.end;
}
function processActions(data) {
	if (nundef(G.serverData.options)) { G.tupleGroups = null; return false; }

	G.tupleGroups = getTupleGroups();
	return true;
}
function processWaitingFor() {
	if (nundef(G.serverData.waiting_for)) {
		error('No options AND No waiting_for data!!!!!!!!!!');
		return;
	}

	//console.log('change player to ',G.serverData.waiting_for[0]);
	//error('Missed player change!'); //TODO: geht nur 1 action + fixed player order
}

//#region tuple helpers
function handleSet(x) {
	//console.log('handleSet')
	let irgend = x.map(exp);

	//soll list von list of actions returnen
	let res = stripSet(irgend);
	//console.log('set returns',res)
	return res;
	// //console.log(irgend)
	// //console.log(tsRec('irgend',irgend))
}
function multiCartesi() {
	//each arg is a list of list
	let arr = Array.from(arguments);
	if (arr.length > 2) {
		return cartesi(arr[0], stripSet(multiCartesi(...arr.slice(1))));
	} else if (arr.length == 2) return cartesi(arr[0], arr[1]);
	else if (arr.length == 1) return arr[0];
	else return [];
}
function extractTuples(x) {

	if (isList(x))
		if (isListOfListOfActions(x)) return x;
	return isList(x) && x.length > 0 ? stripSet(x[0]) : x;
}
function stripSet(x) {
	if (isListOfListOfActions(x)) return x;
	else if (isActionElement(x)) return [[x]];
	else if (isList(x) && isActionElement(x[0])) return [x];
	else return [].concat(...x.map(stripSet));
	//return isList(x)&&x.length>0?stripSet(x[0]):x;
}
function isListOfListOfActions(x) {
	return isList(x) && x.length > 0 && isList(x[0]) && x[0].length > 0 && isActionElement(x[0][0]);
}
function handleTuple(x) {
	//console.log('handleTuple')

	let irgend = x.map(exp);//console.log('irgend',tsRec(irgend))
	//supposedly, irgend contains lists of action elements
	//these should be combined via cartesian
	return multiCartesi(...irgend);
}

function handleAction(x) {
	return [[x]];
}
function expand1_99(x) {
	//console.log('input', tsRec(x))
	if (isDict(x)) {
		if ('_set' in x) {
			//console.log('handleSet wird aufgerufen')
			return handleSet(x._set);
		} else if ('_tuple' in x) {
			//console.log('handleTuple wird aufgerufen')
			return handleTuple(x._tuple);
		} else if ('type' in x) {
			return handleAction(x);
		} else { error('IMPOSSIBLE OBJECT', x); return null; }
	} else { error('IMPOSSIBLE TYPE', x); return null; }
}
//toString
function tsRec(x) {
	//console.log('input',x)
	if (isList(x)) { return '[' + x.map(tsRec).join('') + ']'; }
	if (isDict(x)) {
		if ('_set' in x) {
			return '{' + tsRec(x._set) + '}';
		} else if ('_tuple' in x) {
			return '(' + tsRec(x._tuple) + ')'
		} else if ('type' in x) {
			return tsAction(x)
		} else { return 'obj unknown'; }
	} else return 'type unknown';
}
function tsAction(x) { if ('ID' in x) return x.ID; else return x.val; }

function findPool(id) {
	if (G.players[id]) return G.playersAugmented;
	else if (G.table[id]) return G.table;
}

function getGamePlayer() {
	for (const k in G.playersAugmented) {
		o = G.playersAugmented[k];
		if (o.obj_type == 'GamePlayer') return o;
	}
}
function sysColor(iPalette, ipal) { return S.pals[iPalette][ipal]; }
function t2(act) {
	let res = [];
	for (const key in act) {
		let data = act[key].actions;
		//console.log('data', data);
		let e = exp(data);
		//console.log(e)
		res.push(e)
	}
	return res;
}


function t1() {
	let a1 = { type: 1 };
	let a2 = { type: 2 };
	let a3 = { type: 3 };
	let a = {
		tic: {
			actions:
			{
				_set:
					[{ _tuple: [{ _set: [a1, a2, a3] }] }]
			}
		}
	};
}
var cnt = 0;
function exp_dep(data) {
	//console.log('' + cnt + ": ", data); cnt += 1;
	if (isDict(data) && 'type' in data) {
		//console.log('returning', [data])
		return [data];
	}
	if (is_Set(data) && data._set.length == 1) {
		//console.log('returning', data._set[0])
		return exp(data._set[0]);
	}
	if (is_Set(data) && data._set.length > 1) {
		//console.log('returning', data._set.map(exp));
		return data._set.map(exp);
	}
	if (is_Tuple(data) && data._tuple.length == 1) {
		//console.log('returning', exp(data._tuple[0]))
		return exp(data._tuple[0]);
	}
	if (is_Tuple(data) && data._tuple.length > 1) data = data._tuple;
	if (isList(data) && empty(data)) return [];
	if (isList(data) && data.length == 1) return exp(data[0])
	if (isList(data)) {
		let a = exp(data[0]); //this is a list of tuples
		let rest = data.slice(1);
		let tlist = exp(rest);
		//console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>returning', a, tlist, carteset(a, tlist))
		return carteset(a, tlist);

	}
}


function expand99(e) {
	let res = [];
	e = expand1_99(e);
	for (const el of e) {
		if (isll(el)) el.map(x => res.push(x));
		else res.push(el);
	}
	return res;
}
function isListOfActions(l) {
	return isList(l) && !empty(l) && isActionElement(l[0]);
}
function extractActionLists(lst) {
	//console.log(lst);
	let res = [];
	for (const l of lst) {
		if (isListOfActions(l)) res.push(l);
		else if (isActionElement(l)) res.push([l]);
		else {
			let r2 = extractActionLists(l);
			r2.map(x => res.push(x));
		}
	}
	return res;
}
var exp = expand1_99;

function getTupleGroups() {
	let act = G.serverData.options;

	//console.log('options', act)
	// json_str = JSON.stringify(act);
	// saveFile("yourfilename.json", "data:application/json", new Blob([json_str], { type: "" }));

	let tupleGroups = [];
	for (const desc in act) {
		let tg = { desc: desc, tuples: [] };
		//let tuples = expand99(act[desc].actions);
		let tuples = exp(act[desc].actions);
		//console.log('*** ', desc, '........tuples:', tuples);

		if (tuples.length == 1 && !isList(tuples[0])) tuples = [tuples];
		//console.log(tuples)
		tg.tuples = tuples;
		tupleGroups.push({ desc: desc, tuples: tuples });
	}
	//console.log('tupleGroups', tupleGroups);
	return tupleGroups;
}



//#endregion
