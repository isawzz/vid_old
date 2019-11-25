function presentTable() {
	//let i = 2;
	for (const oid of G.tableRemoved) {
		//console.log('deleting all related to', oid)
		deleteOid(oid);
	}
	for (const oid of G.tableCreated) {
		//console.log('NEWLY CREATE:',oid,defaultVisualExists(oid),S.settings.table.createDefault)

		if (!defaultVisualExists(oid) && S.settings.table.createDefault==true) {
			//console.log('>>>>>>>>>>>>>>>>>should create default object for',oid)
			makeDefaultObject(oid, G.table[oid], S.settings.table.defaultArea);
		}

		if (mainVisualExists(oid)) continue;

		//hier wuerde dann create behaviors aufrufen
		if (S.settings.userBehaviors) updatedVisuals = runBEHAVIOR_new(oid, G.table, TABLE_CREATE);
		else {
			let ms = makeMainVisual(oid, G.table[oid]);
			if (ms === null && S.settings.table.createDefault == 'miss'){
				makeDefaultObject(oid, G.table[oid], S.settings.table.defaultArea);
			}
		}

		//if (S.settings.tooltips) createTooltip(oid, G.table);

		//i -= 1;	//if (i<=0)return;
	}
	for (const oid in G.tableUpdated) {
		let changedProps = G.tableUpdated[oid].summary;
		//if (G.tableCreated.includes(oid)) { continue; }

		//if (S.settings.tooltips && TT_JUST_UPDATED == oid) updateTooltipContent(oid, G.table);

		//update main visual
		let ms = getVisual(oid);
		if (ms) {
			let updatedVisuals = {};
			if (S.settings.userBehaviors) updatedVisuals = runBEHAVIOR_new(oid, G.table, TABLE_UPDATE);
			if (!updatedVisuals[oid]) {
				if (changedProps.includes('loc')) presentLocationChange(oid, ms);
				presentMain(oid, ms, G.table);
			}
		}

		//update default visual
		if (!S.settings.table.createDefault || ms && S.settings.table.createDefault == 'miss') continue;
		presentDefault(oid, G.table[oid]);
	}
}
function presentLocationChange(oid, ms) {
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
function presentPlayers() {
	//creation of new players
	for (const pid of G.playersCreated) {

		if (!defaultVisualExists(pid) && S.settings.player.createDefault) makeDefaultPlayer(pid, G.playersAugmented[pid], S.settings.player.defaultArea);

		if (mainVisualExists(pid)) continue;

		//hier wuerde dann create behaviors aufrufen

		//if (S.settings.tooltips) createTooltip(pid, G.playersAugmented);
	}
	//presentation of existing changed players 
	for (const pid in G.playersUpdated) {
		let o = G.playersAugmented[pid];
		//if (G.playersCreated.includes(pid)) { continue; }

		//if (S.settings.tooltips && TT_JUST_UPDATED == pid) updateTooltipContent(pid, G.playersAugmented);

		//update main visual
		let ms = getVisual(pid);
		if (ms) {
			let updatedVisuals = {};
			if (S.settings.userBehaviors) updatedVisuals = runBEHAVIOR_new(pid, G.playersAugmented, PLAYER_UPDATE);
			if (!updatedVisuals[pid]) {
				presentMain(oid, ms, G.playersAugmented,false);
			}
			//if (!updatedVisuals[pid]) o.table(G.playersAugmented[pid]);
		}

		//update default visual
		if (!S.settings.player.createDefault || ms && S.settings.player.createDefault != true) continue;
		let plms = presentDefault(pid, G.playersAugmented[pid], false);
		onPlayerChange(pid);
		//measure plms somehow
		// //console.log('is new game:',S.vars.switchedGame);
		// if (S.vars.switchedGame)  measureDefaultPlayerElement(plms);
	}
}
function onPlayerChange(pid) {
	if (!G.playerChanged || pid != G.player) return;
	//console.log('player has changed!!!!!!!!!!!!!!!!!!!!!!!!!')
	let o = G.playersAugmented[pid];
	//console.log(pid, o);
	updatePageHeader(pid);
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
function updatePageHeader(pid){
	//console.log('Turn:',pid)
	let ms;
	for (const pl of S.gameConfig.players){
		ms=getPageHeaderDivForPlayer(pl.id);
		ms.classList.remove('gamePlayer');
	}
	ms = getPageHeaderDivForPlayer(pid);
	ms.classList.add('gamePlayer');
}
function adjustPlayerAreaWise() {
	//do UI updates that have to do with measuring elements from server
	//players: S.vars.wDefaultPlayer
	let areaName = S.settings.player.defaultArea;
	let msArea = UIS[areaName];
	let wArea = msArea.w;
	let minWidth = S.vars.wDefaultPlayer + 10;
	//console.log('minWidth for player', minWidth, 'wArea', wArea)
	if (wArea < minWidth) {
		let diff = S.vars.wDefaultPlayer + 10 - wArea;
		//console.log('should resize player area')
		setCSSVariable('--wPlayers', minWidth)

	}

}
function measureDefaultPlayerElement(plms) {
	//console.log('defaultPlayer', plms);
	let elem = plms.elem;
	let w = $(elem).width();
	if (nundef(S.vars.wDefaultPlayer)) S.vars.wDefaultPlayer = w;
	else if (w > S.vars.wDefaultPlayer) S.vars.wDefaultPlayer = w;
	//console.log('w of player', w);


}
function presentStatus() {
	if (isdef(G.serverData.status)) {
		let lineArr = G.serverData.status.line;
		let areaName = 'c_d_statusText';
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
				if (!empty(s)) {
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
	let areaName = 'c_d_statusText';
	let d = document.getElementById(areaName);
	let ms = UIS[areaName];
	ms.clear(); clearElement(d);
	d.innerHTML = s;
}
function presentLog() {
	//add new logEntries to div
	let d = document.getElementById('a_d_log');
	let BASEMARGIN = 16;
	for (const k of G.logUpdated) {
		let logEntry = G.log[k];
		//let level = logEntry.level ? logEntry.level : 1; //TODO: use level!
		//level=Math.max(1,level);
		//d.appendChild(document.createTextNode('-'.repeat(level-1)));
		let lineArr = logEntry.line;
		let lineDiv = document.createElement('div');
		lineDiv.style.marginLeft = '' + (BASEMARGIN * (logEntry.level)) + 'px';
		//lineDiv.appendChild(document.createTextNode(''+logEntry.level))
		for (const item of lineArr) {
			if (isSimple(item)) {
				let s = trim(item.toString());
				if (!empty(s)) {
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
		d.scrollTop = d.scrollHeight; //lineDiv.scrollIntoView(false);
		//d.appendChild(document.createElement('br'));
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
	if (nundef(G.previousWaitingFor) || G.previousWaitingFor != pl){
		//now waiting for a new player!!!
		//update page header with that player and set G.previousWaitingFor
		G.previousWaitingFor = pl;
		updatePageHeader(pl);
	}
	if (isMyPlayer(pl) || isFrontAIPlayer(pl) && isMyPlayer(G.player)) {
		let user = G.playersAugmented[pl].username;
		_sendRoute('/status/' + user, d => {
			//console.log('asking for status in presentWaitingFor!!!!!',pl,USERNAME);
			//console.log('reply to status request for',user,d);
			d = JSON.parse(d);
			processData(d); gameStep();
			//else console.log('presentWaitingFor: (hab status gesendet!) NOT MY TURN!!!! WHAT NOW?!?!?');
		});
	} else {
		//console.log('presentWaitingFor:',G.playersAugmented[G.player].username,'emits poll',pl);
		socketEmitMessage({type:'poll',data:pl});
	}

}

//presentation of objects
function getUser(idPlayer) { return G.playersAugmented[idPlayer].username; }
function getPlayerColor(id) { return G.playersAugmented[id].color }
function getPlayerColorString(id) { return G.playersAugmented[id].altName }
function computePresentedKeys(o,isTableObject){
	let optin = isTableObject? S.settings.table.optin:S.settings.player.optin;
	//console.log(optin)

	if (optin) return intersection(Object.keys(o),optin);

	let optout;
	if (S.settings.useExtendedOptout){
		let keys = [];
		optout = S.settings.extendedOptout;
		for (const k in o){ if (optout[k]) continue; keys.push(k); }
		return keys;
	}

	optout = isTableObject? S.settings.table.optout : S.settings.player.optout;
	for (const k in o){ if (optout[k]) continue; keys.push(k); }
	return keys;

}
function presentMain(oid, ms, pool, isTableObject = true) {
	//let optin = isTableObject?S.settings.table.optin:S.settings.player.optin; //game == 'catan' ? ['res', 'num', 'building', 'port'] : ['symbol']; //cheat! keywords fuer catan vs ttt
	//console.log(optin)

	let o = pool[oid];
	let validKeys = computePresentedKeys(o, isTableObject);
	//console.log(validKeys)

	let color = S.settings.useColorHintForProperties? getColorHint(o):ms.fg;
	// console.log(o,color)
	let akku = [];//isField(o)?[''+oid]:[];
	// let bg, fg;
	for (const k of validKeys) {
		let val = o[k];
		if (isSimple(val)) akku.push(val.toString());
	}
	if (!empty(akku)) { ms.multitext({ txt: akku, fill: color }); } else ms.clearText();
}
function presentDefault(oid, o, isTableObject = true) {
	let ms = getDefVisual(oid);
	if (!ms) return;

	//filter keys using optin and optout lists
	let optin = isTableObject ? S.settings.table.optin : S.settings.player.optin;
	let optout = isTableObject ? S.settings.table.optout : S.settings.player.optout;

	//console.log('optin',optin,'optout',optout)
	keys = optout ? arrMinus(getKeys(o), optout) : optin ? optin  : getKeys(o);

	let x = ms.tableX(o, keys); //adds or replaces table w/ prop values
	return x;



}


function computePresentedKeysDefault(o,pool){
	let optin = pool == G.table? S.settings.table.optin:S.settings.player.optin;

	if (optin) return intersection(Object.keys(o),optin);

	let optout;
	if (S.settings.useExtendedOptout){
		let keys = [];
		optout = S.settings.extendedOptout;
		for (const k in o){ if (optout[k]) continue; keys.push(k); }
		return keys;
	}

	optout = pool == G.table? S.settings.table.optout : S.settings.player.optout;
	for (const k in o){ if (optout[k]) continue; keys.push(k); }
	return keys;

}



