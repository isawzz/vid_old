var WAITINGFORPLAYER = null;

function presentTable() {
	_tableRemove();
	_tableCreateNew();
	_tableUpdate();
}
function _tableRemove() {
	for (const oid of G.tableRemoved) {
		//console.log('deleting all related to', oid)
		deleteOid(oid);
	}
}
function _tableCreateNew() {
	for (const oid of G.tableCreated) {
		let o = G.table[oid];

		//default objects are objects in objects tab underneath game area!
		if (!defaultVisualExists(oid) && S.settings.table.createDefault == true) {
			//console.log('>>>>>>>>>>>>>>>>>should create default object for',oid)
			makeDefaultObject(oid, G.table[oid], S.settings.table.defaultArea);
		}

		if (S.settings.table.ignoreTypes.includes(o.obj_type)
			|| mainVisualExists(oid)
			|| !S.settings.boardDetection && !S.settings.deckDetection && !S.settings.userStructures) {
			//console.log('NOT creating main visual!!!',oid,o.obj_type)
			continue;
		}

		let updatedVisuals;
		if (S.settings.userBehaviors) {
			updatedVisuals = runBehaviors(oid, G.table, TABLE_CREATE);
		}
		//console.log('updatedVisuals',updatedVisuals)
		if (nundef(updatedVisuals) || !updatedVisuals.includes(oid)) {
			//console.log('trying to make main visual for',oid,o.obj_type )
			let ms = makeMainVisual(oid, G.table[oid]);
			if (ms === null && !defaultVisualExists(oid) && S.settings.table.createDefault != false) {
				makeDefaultObject(oid, G.table[oid], S.settings.table.defaultArea);
			}
		}

	}
}
function _tableUpdate() {
	for (const oid in G.tableUpdated) {
		let o = G.table[oid];

		if (isStructuralElement(oid)) continue; //eg., boards not updated!

		let changedProps = G.tableUpdated[oid].summary;

		//update main visual
		let ms = getVisual(oid);
		if (ms) {
			//console.log('update:',oid,'is line',ms.isLine)
			let updatedVisuals;
			if (S.settings.userBehaviors) {
				updatedVisuals = runBehaviors(oid, G.table, TABLE_UPDATE);
			}
			//if (ms.isLine) console.log('updatedVisuals',updatedVisuals)
			//console.log(updatedVisuals)
			if (nundef(updatedVisuals) || !updatedVisuals.includes(oid)) {
				//console.log('oid',oid,'has NOT been updated!!!!!')
				if (changedProps.includes('loc')) _presentLocationChange(oid, ms);
				//console.log('presenting main!',oid)
				presentMain(oid, ms, G.table);
				// } else {
				// 	console.log('oid',oid,'has been updated!!!!!')
			}
		}

		//update default visual
		if (!S.settings.table.createDefault || ms && S.settings.table.createDefault == 'miss') continue;

		presentDefault(oid, G.table[oid]);
	}
}

function presentPlayers() {
	//TODO: players remove
	_playersCreateNew();
	_playersUpdate();
}
function _playersCreateNew() {
	//creation of new players
	for (const pid of G.playersCreated) {

		if (!defaultVisualExists(pid) && S.settings.player.createDefault)
			makeDefaultPlayer(pid, G.playersAugmented[pid], S.settings.player.defaultArea);

		if (mainVisualExists(pid)) continue;

		let updatedVisuals;
		if (S.settings.userBehaviors) {
			updatedVisuals = runBehaviors(pid, G.playersAugmented, PLAYER_CREATE);
		}
		//console.log('updatedVisuals',updatedVisuals)
		if (isPlain() && (nundef(updatedVisuals) || !updatedVisuals.includes(pid))) {
			let ms = makeMainPlayer(pid, G.playersAugmented[pid], S.settings.player.defaultMainArea);
			if (ms === null && !defaultVisualExists(pid) && S.settings.table.createDefault != false) {
				makeDefaultObject(pid, G.playersAugmented[pid], S.settings.table.defaultArea);
			}
		}
	}
}
function _playersUpdate() {
	//presentation of existing changed players 
	for (const pid in G.playersUpdated) {
		let pl = G.playersAugmented[pid];

		//update main visual
		let updatedVisuals = {};
		if (S.settings.userBehaviors) {

			updatedVisuals = runBehaviors(pid, G.playersAugmented, PLAYER_UPDATE);
			runBindings(pid, G.playersAugmented)
		}

		let ms = getVisual(pid);
		if (!updatedVisuals[pid] && isdef(ms)) {
			presentMainPlayer(pid, ms, G.playersAugmented, false);
		}

		//update default visual
		if (!S.settings.player.createDefault || ms && S.settings.player.createDefault != true) continue;
		let plms = presentDefault(pid, pl, false);
		_onPlayerChange(pid);
	}
}

function presentStatus() {
	if (isdef(G.serverData.status)) {
		let lineArr = G.serverData.status.line;

		let areaName = isPlain() ? 'c_d_statusInHeaderText' : 'c_d_statusText';
		let d = document.getElementById(areaName);
		let ms = UIS[areaName];
		ms.clear(); clearElement(d);

		//make aux for current player (TODO: could reuse these but maybe not necessary)
		let pl = G.player;
		let msStatus = makeAux(G.playersAugmented[pl].username + ' (' + pl + ')', pl, areaName);
		let color = getPlayerColor(pl);
		msStatus.setBg(color);
		msStatus.setFg(colorIdealText(color));

		d.appendChild(document.createTextNode(': '));

		for (const item of lineArr) {
			if (isSimple(item)) {
				let s = trim(item.toString());
				if (!isEmpty(s)) {
					//console.log('adding item:', s, 'to log');
					d.appendChild(document.createTextNode(item)); //ausgabe+=item+' ';
				}
			} else if (isDict(item)) {
				//console.log(item);
				if (item.type == 'obj') {
					let oid = item.ID;
					let ms = makeAux(item.val, oid, areaName);
				} else if (item.type == 'player') {
					let oid = item.val;
					let ms = makeAux(item.val, oid, areaName);
				}
			}
		}
	}
}
function setStatus(s) {
	let areaName = isPlain() ? 'c_d_statusInHeaderText' : 'c_d_statusText';
	let d = document.getElementById(areaName);
	let ms = UIS[areaName];
	ms.clear(); clearElement(d);
	d.innerHTML = s;
}
function presentLog() {
	//add new logEntries to div
	let pl = G.player;
	let logId = 'a_d_log' + '_' + pl;
	if (!UIS[logId]) makeLogArea(pl);
	let d = document.getElementById(logId);
	//console.log('.......',logId,UIS[logId],d)
	let BASEMARGIN = 16;
	for (const k of G.logUpdated) {
		//for (const k in G.log[pl]) {
		let logEntry = G.log[pl][k];
		let lineArr = logEntry.line;
		let lineDiv = document.createElement('div');
		lineDiv.style.marginLeft = '' + (BASEMARGIN * (logEntry.level)) + 'px';
		for (const item of lineArr) {
			if (isSimple(item)) {
				let s = trim(item.toString());
				if (!isEmpty(s)) {
					//console.log('adding item:', s, 'to log');
					lineDiv.appendChild(document.createTextNode(item));
					//let node=document.createElement('div');
					//node.innerHTML = item;
					//d.appendChild(node); //ausgabe+=item+' ';
				}
			} else if (isDict(item)) {
				//console.log(item);
				if (item.type == 'obj') {
					let oid = item.ID;
					let ms = makeAux(item.val, oid, 'a_d_log', lineDiv);
				} else if (item.type == 'player') {
					let oid = item.val;
					let ms = makeAux(item.val, oid, 'a_d_log', lineDiv);
				} else {
					//console.log('unknown item in log:', item)
				}
			}
		}
		d.appendChild(lineDiv);
		d.scrollTop = d.scrollHeight;
	}
}
function presentEnd() {
	if (nundef(G.end)) return false;

	let winner = G.serverData.end.winner;
	//console.log('game over! winner',winner)

	let msg = winner == null ? 'Both players win!' : 'Winner is ' + G.playersAugmented[winner].name;
	setStatus('GAME OVER! ' + msg);
	if (winner) {
		setCSSVariable('--bgWinner', G.playersAugmented[winner].color);
		areaBlink('a_d_status');
	}

	//UI update
	S_autoplay = false;
	unfreezeUI();

	//clear action div
	let d = document.getElementById('a_d_divSelect');
	clearElement(d);
	d.scrollTop = 0;
	return true;
}
function presentActions() {
	deleteActions(); //clear rest of action data from last round
	let areaName = 'a_d_divSelect';
	UIS[areaName].elem.scrollTop = 0;
	let iGroup = 0;
	let iTuple = 0;

	for (const tg of G.tupleGroups) {
		for (const t of tg.tuples) {
			let boatInfo = { obj_type: 'boat', oids: [], desc: tg.desc, tuple: t, iGroup: iGroup, iTuple: iTuple, text: t.map(x => x.val), weg: false };
			let ms = makeDefaultAction(boatInfo, areaName);
			iTuple += 1;
		}
		iGroup += 1;
	}
}
function presentWaitingFor() {
	//console.log('changing player!')
	//hier komm ich nur her wenn es mein turn war
	//also kann switchen wenn entweder der pl me ist oder eine FrontAI
	let pl = G.serverData.waiting_for[0];
	if (nundef(G.previousWaitingFor) || G.previousWaitingFor != pl) {
		//now waiting for a new player!!!
		//update page header with that player and set G.previousWaitingFor
		G.previousWaitingFor = pl;
		console.log('presenting waiting for', pl)
		_updatePageHeader(pl);
	}
	if (S.settings.playmode != 'passplay' && (isMyPlayer(pl) || isFrontAIPlayer(pl) && isMyPlayer(G.player))) {
		let user = G.playersAugmented[pl].username;
		//console.log('just switching username to', user)
		_sendRoute('/status/' + user, d => {
			//console.log('asking for status in presentWaitingFor!!!!!',pl,USERNAME);
			//console.log('reply to status request for',user,d);
			d = JSON.parse(d);
			processData(d); gameStep();
			//else //console.log('presentWaitingFor: (hab status gesendet!) NOT MY TURN!!!! WHAT NOW?!?!?');
		});
	} else if (S.settings.playmode == 'passplay') {
		//this is where I have to output message: NOT YOU TURN ANYMORE!!!!! please click pass!!!
		_showPassToNextPlayer(pl);
	} else {
		//console.log('presentWaitingFor:',G.playersAugmented[G.player].username,'emits poll',pl);
		socketEmitMessage({ type: 'poll', data: pl });
	}

}


//#region local helpers
function _presentLocationChange(oid, ms) {
	//TODO: cleanup code!
	if (G.table[oid].obj_type == 'robber') {
		let o = G.table[oid];
		let changedProps = G.tableUpdated[oid];
		//		//console.log(changedProps)
		if (changedProps.summary.includes('loc')) {
			//alert('hallo! robber loc change!');
			//			//console.log(ms);
			let oidLoc = o.loc._obj;
			let visLoc = getVisual(oidLoc);
			ms.setPos(visLoc.x, visLoc.y);
		}
	}
}
function _onPlayerChange(pid) {
	if (isPlain()) return;
	if (!G.playerChanged || pid != G.player) return;
	//console.log('player has changed!!!!!!!!!!!!!!!!!!!!!!!!!')
	let o = G.playersAugmented[pid];
	//console.log('presenting player change', pid, o);
	_updatePageHeader(pid);
	if (G.previousPlayer) _updateLogArea(G.previousPlayer, pid);
	let ms = getVisual(pid);
	if (ms) {
		//console.log(ms.id);
	}
	let msDef = getDefVisual(pid);
	if (msDef) {
		//console.log('default player id', msDef.id);
		let msParentId = msDef.parentId;
		let msParent = UIS[msParentId];
		var target = msDef.elem;
		target.parentNode.scrollTop = target.offsetTop;
		//msDef.elem.scrollIntoView(false);
	}
}
function _updatePageHeader(pid) {
	//console.log('Turn:',pid)
	let ms;
	for (const pl of S.gameConfig.players) {
		ms = getPageHeaderDivForPlayer(pl.id);
		ms.classList.remove('gamePlayer');
	}
	//console.log('oid', pid)
	ms = getPageHeaderDivForPlayer(pid);
	ms.classList.add('gamePlayer');
}
function _updateLogArea(prevPlid, plid) {
	//console.log(prevPlid)
	if (prevPlid) hide('a_d_log_' + prevPlid);
	let id = 'a_d_log_' + plid;
	if (UIS[id]) show(id);
}
function _showPassToNextPlayer(plWaitingFor) {
	unfreezeUI();
	let d = document.getElementById('passToNextPlayerUI');
	let color = getPlayerColor(plWaitingFor);
	d.style.backgroundColor = color;
	let button = document.getElementById('c_b_passToNextPlayer');
	button.textContent = 'PASS TO ' + plWaitingFor;
	show('passToNextPlayerUI');

	WAITINGFORPLAYER = plWaitingFor;

	//console.log('waiting for player', WAITINGFORPLAYER);

}
function totalFreeze() {
	//player clicked the passToNextPlayer button
	//hide entire ui until the nextPlayerReady button is clicked!
	hide('passToNextPlayerUI')
	show('freezer');
}
function onClickNextPlayerReady() {
	if (WAITINGFORPLAYER !== null) {
		let user = getUsernameForPlayer(WAITINGFORPLAYER);
		//console.log('username of new player:', user)
		WAITINGFORPLAYER = null;
		_sendRoute('/status/' + user, d => {
			//console.log('asking for status in presentWaitingFor!!!!!',pl,USERNAME);
			//console.log('reply to status request for',user,d);
			hide('freezer');
			d = JSON.parse(d);
			processData(d);
			gameStep();
			//else //console.log('presentWaitingFor: (hab status gesendet!) NOT MY TURN!!!! WHAT NOW?!?!?');
		});
	}
}

//presentation of objects
function computePresentedKeys(o, isTableObject) {
	let optin = isTableObject ? S.settings.table.optin : S.settings.player.optin;
	//console.log(optin)

	if (optin) return intersection(Object.keys(o), optin);

	let optout;
	if (S.settings.useExtendedOptout) {
		let keys = [];
		optout = S.settings.extendedOptout;
		for (const k in o) { if (optout[k]) continue; keys.push(k); }
		return keys;
	}

	optout = isTableObject ? S.settings.table.optout : S.settings.player.optout;
	for (const k in o) { if (optout[k]) continue; keys.push(k); }
	return keys;

}
function presentMain(oid, ms, pool, isTableObject = true) {
	//let optin = isTableObject?S.settings.table.optin:S.settings.player.optin; //game == 'catan' ? ['res', 'num', 'building', 'port'] : ['symbol']; //cheat! keywords fuer catan vs ttt
	//console.log(optin)
	// if (ms.isLine){
	// 	console.log('not presenting edge:',oid)
	// 	return;
	// }

	let o = pool[oid];
	let validKeys = computePresentedKeys(o, isTableObject);
	//console.log(validKeys);

	let color = S.settings.useColorHintForProperties ? getColorHint(o) : ms.fg;
	// //console.log(o,color)
	let akku = [];//isField(o)?[''+oid]:[];
	// let bg, fg;
	for (const k of validKeys) {
		let val = o[k];
		if (isSimple(val)) akku.push(val.toString());
	}
	if (!isEmpty(akku)) { ms.multitext({ txt: akku, fill: color }); } else ms.clearText();
}
function presentMainPlayer(oid, ms, pool, isTableObject) {
	let o = pool[oid];
	//console.log(oid,o,G.player)
	//let ms = getVisual(oid);
	if (!ms) return;
	if (oid != G.player) { ms.hide(); return; } else ms.show();

	//filter keys using optin and optout lists
	let optin = S.settings.player.optin;
	let optout = S.settings.player.optout;

	//console.log('optin',optin,'optout',optout)
	keys = optout ? arrMinus(getKeys(o), optout) : optin ? optin : getKeys(o);

	let x = ms.tableX(o, keys); //adds or replaces table w/ prop values

	growIfDefaultMainAreaWidth(ms);

	return x;
}
function presentDefault(oid, o, isTableObject = true) {
	let ms = getDefVisual(oid);
	if (!ms) return;
	if (isPlain() && !isTableObject && G.player == oid) { ms.hide(); return null; }
	if (isPlain() && !isTableObject) ms.show();

	//filter keys using optin and optout lists
	let optin = isTableObject ? S.settings.table.optin : S.settings.player.optin;
	let optout = isTableObject ? S.settings.table.optout : S.settings.player.optout;

	keys = optout ? arrMinus(getKeys(o), optout) : optin ? optin : getKeys(o);

	let x = ms.tableX(o, keys); //adds or replaces table w/ prop values

	if (!isPlain() && !isTableObject) {
		growIfDefaultMainAreaWidth(ms);
	}

	return x;
}




