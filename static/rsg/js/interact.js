var choiceCompleted = false;
var frozen = false;
var boatFilters = [];
var boatHighlighted = null;

function startInteraction() {
	//window.scrollTo(0,0); //better: remove scrollIntoView bei log window
	boatFilters = [];
	if (isdef(IdOwner.a)) IdOwner.a.map(x => _addStandardInteraction(x));
	if (isdef(IdOwner.l)) IdOwner.l.map(x => _addStandardInteraction(x)); //da muss click handler removen!!!!
	if (isdef(IdOwner.p)) IdOwner.p.map(x => _addStandardInteraction(x));
	if (isdef(IdOwner.r)) IdOwner.r.map(x => _addStandardInteraction(x));
	//if (isdef(IdOwner.s)) IdOwner.s.map(x => addStandardInteraction(x)); //anderen clickHandler
	if (isdef(IdOwner.t)) IdOwner.t.map(x => _addStandardInteraction(x)); //anderen clickHandler
	_preselectFirstVisualsForBoats();
	choiceCompleted = false;
	let nBoats = getBoatIds().length;
	let autoplay = S_autoplayFunction(G) || nBoats < 2 || robbedDescInBoats();
	if (autoplay) {
		//console.log(nBoats<2?'autoplay:...only 1 option!!!':'different function....');
		setTimeout(onClickStep, S_AIThinkingTime);
		return;
	} else {
		setAutoplayFunctionForMode();
		unfreezeUI();
	}
}
function stopAllHighlighting() {
	//only unhighlight all, leave handlers on
	if (isdef(IdOwner.a)) IdOwner.a.map(x => _removeAllHighlighting(x));
	if (isdef(IdOwner.l)) IdOwner.l.map(x => _removeAllHighlighting(x)); //da muss click handler removen!!!!
	if (isdef(IdOwner.p)) IdOwner.p.map(x => _removeAllHighlighting(x));
	if (isdef(IdOwner.r)) IdOwner.r.map(x => _removeAllHighlighting(x));
	if (isdef(IdOwner.s)) IdOwner.s.map(x => _removeAllHighlighting(x)); //anderen clickHandler
	if (isdef(IdOwner.t)) IdOwner.t.map(x => _removeAllHighlighting(x)); //anderen clickHandler
	setTimeout(hideTooltip, 500);
}
function stopInteraction() {
	//remove all handlers
	if (isdef(IdOwner.a)) IdOwner.a.map(x => _removeInteraction(x));
	if (isdef(IdOwner.l)) IdOwner.l.map(x => _removeInteraction(x)); //da muss click handler removen!!!!
	if (isdef(IdOwner.p)) IdOwner.p.map(x => _removeInteraction(x));
	if (isdef(IdOwner.r)) IdOwner.r.map(x => _removeInteraction(x));
	if (isdef(IdOwner.s)) IdOwner.s.map(x => _removeInteraction(x)); //anderen clickHandler
	if (isdef(IdOwner.t)) IdOwner.t.map(x => _removeInteraction(x)); //anderen clickHandler
	setTimeout(hideTooltip, 500);
}

function keyUpHandler(ev) {
	checkControlKey(ev); //infobox.js

}
function keyDownHandler(ev) {
	checkArrowKeys(ev);
}
function checkArrowKeys(ev) {
	if (!ev.ctrlKey) return;
	//if (!isControlKeyDown && boatHighlighted) unhighlightBoat();

	//isControlKeyDown = true;

	if (ev.keyCode == '13' && boatHighlighted) onClickSelectTuple(null, boatHighlighted);
	else if (ev.keyCode == '38') _highlightPrevBoat();
	else if (ev.keyCode == '40') _highlightNextBoat();
	else if (ev.keyCode == '37') { }	// left arrow
	else if (ev.keyCode == '39') { }	// right arrow
}

//#region onClick...
function onClickCatan() {
	GAME = S.settings.game = 'catan';
	PLAYMODE = S.settings.playmode = 'hotseat'; // das wird in specAndDom gemacht! setPlaymode(currentPlaymode);
	S.gameConfig = gcs[GAME];
	_startNewGame('starter');

}
function onClickCheat(code) { sendRoute('/cheat/' + code, null); }

function onClickFilterTuples(ev, ms, part) {
	//hat auf irgendein object or player geclickt
	let id = ms.id;
	if (boatFilters.includes(id)) {
		_removeFilterHighlight(ms);
		removeInPlace(boatFilters, id);
		let relids = getList(id2uids[id]);
		let boats = relids.filter(x => x[2] == 'a');
		if (isEmpty(boats)) { return; } // no effect!
		for (const bid of boats) { if (!fi.includes(bid)) { _showBoat(bid); } }//show boats that have been filtered out but do not contain any of the other filters
	} else {
		let relids = getList(id2uids[id]);
		//console.log(relids)
		let boats = relids.filter(x => x[2] == 'a');
		//console.log(boats)
		if (isEmpty(boats)) { return }//console.log('no boat!'); return; } // no effect!

		if (boats.length == 1) {
			//console.log(boats[0])
			onClickSelectTuple(null, UIS[boats[0]]);
		} else {
			boatFilters.push(id);
			_addFilterHighlight(ms);
			for (const bid of IdOwner.a) { if (!boats.includes(bid)) { _hideBoat(bid) } } //soll von tuple liste nur die tuples anzeigen, wo diese id vorkommt
			//TODO!!! soll von objects nur die anzeigen, die in einem der visible tuples vorkommen
		}
	}
}
function onClickFilterOrInfobox(ev, ms, part) { if (!ev.ctrlKey) onClickFilterTuples(ev, ms, part); else openInfobox(ev, ms, part); }

function onClickFilterAndInfobox(ev, ms, part) { onClickFilterTuples(ev, ms, part); onClickPlusControlInfobox(ev, ms, part); }

function onClickPlusControlInfobox(ev, ms, part) { if (ev.ctrlKey) { openInfobox(ev, ms, part); } }
function onClickPollStatus() {
	//poll status for USERNAME, and if does not work, poll for waiting for if it belongs to me!

	//pollStatusAs(USERNAME);
	sendStatus(USERNAME,[gameStep]);

}
function onClickLobby() {
	lobbyView();
	if (!isReallyMultiplayer) openGameConfig();
}
function onClickRestart() {
	unfreezeUI();
	_startRestartSame();
}
function onClickRunToNextPlayer() {
	let pl = G.player;
	S_autoplayFunction = (_G) => _G.player == pl;

	onClickStep(G);
}
function onClickRunToNextTurn() {
	let pl = G.player;
	S_autoplayFunction = (_G) => {
		if (_G.player != pl) {
			S_autoplayFunction = (_G1, _) => _G1.player != pl;
		};
		return true;
	};
	onClickStep(G);
}
function onClickRunToNextPhase() {
	let phase = G.phase;
	S_autoplayFunction = (_G) => _G.phase == phase;
	onClickStep(G);
}
function onClickRunToEnd() {
	S_autoplayFunction = () => true;
	onClickStep(G);
}
function onClickRunToAction(bId, keyword) {
	let b = document.getElementById(bId);
	console.log(getFunctionCallerName(), bId, keyword)
	S_autoplayFunction = (_G) => {
		//run to action available that contains keyword
		//should return true unless one of the boats.tuple has an element with val.includes(keyword)
		//console.log(getBoats());
		for (const ms of getBoats()) {
			for (const ti of ms.o.tuple) {
				if (ti.val.toString().includes(keyword)) {
					//console.log('STOP!!!!!!!!!!!!!!!!!!!!!!!!!!!')
					setAutoplayFunctionForMode();
					return false;
				}
			}
		}
		return true;
	}
	onClickStep(G);
}
function onClickStop() {
	//console.log('*** clicked STOP!!! ***');
	setAutoplayFunctionForMode(PLAYMODE);
	unfreezeUI();
	//startInteraction();
	// setTimeout(()=>setAutoplayFunctionForMode(S_playMode),1000);
	//STOP = true;
	//setTimeout(showStep,100);
}

function onClickSelectTuple(ev, ms, part) {
	//console.log(ev,ms,part)
	if (choiceCompleted) return;
	choiceCompleted = true;
	//let id = ms.id;
	iTuple = ms.o.iTuple;
	//console.log(counters.msg + ': ' + G.player + ' :', iTuple, ms.o.desc, ms.o.text, ms.id);
	freezeUI();
	stopAllHighlighting();
	sendAction(ms.o, [gameStep]);
}
var startBoats = ['93', '99', '109', '121', '124', '116', '106', '111', '116', '129'];
function getNextStartBoat() {
	//console.log('phase', G.phase)
	let ms = null;
	let sb = startBoats[0];
	if (G.phase == 'setup') {
		let boats = getBoats();
		for (const b of boats) {
			//console.log(b, b.o, b.o.text);
			for (const id of startBoats) {
				//console.log(b.o.text);
				for (const t of b.o.text) {
					if (t.includes(id)) {
						//console.log('choosing', id)
						sb = id;
						ms = b;
						removeInPlace(startBoats, sb);
						return ms;
					}
				}
			}
		}
	}
	//console.log(startBoats)
	return ms;
}
function onClickStep() {
	if (!this.choiceCompleted) {
		//let ms = getRandomBoat();
		//let ms = getBoatWith(['demand', 'offer'], false);
		let ms = getNextStartBoat();
		if (nundef(ms)) ms = getBoatWith(['demand', 'offer'], false);
		if (nundef(ms)) ms = getBoatWith(['buy'], true);
		if (nundef(ms)) ms = getBoatWith(['pass'], true);
		if (nundef(ms)) ms = getBoatWith(['demand', 'offer'], false);
		if (nundef(ms)) ms = getRandomBoat();
		onClickSelectTuple(null, ms);
	}
}
function onClickToggleButton(button, handlerList) {
	let current = button.textContent;
	let idx = -1;
	let i = 0;
	for (const item of handlerList) {
		if (item[0] == current) {
			idx = i; break;
		}
		i += 1;
	}
	if (idx >= 0) {
		let idxNew = (idx + 1) % handlerList.length;
		button.textContent = handlerList[idxNew][0];
		handlerList[idxNew][1]();
	}
}
function onClickTTT() {
	GAME = S.settings.game = 'ttt';
	PLAYMODE = S.settings.playmode = 'hotseat'; // das wird in specAndDom gemacht! setPlaymode(currentPlaymode);
	S.gameConfig = gcs[GAME];
	_startNewGame('starter');

}

//#region utilities
function highlightMsAndRelatives(ev, ms, partName) {
	//console.log(ms.id,partName)
	let id = ms.id;
	//console.log('------------>id',id)
	ms.high(partName);
	if (ms.isa.infobox) bringInfoboxToFront(ms);
	let relativeIds = id2uids[id];
	if (nundef(relativeIds)) return;
	for (const idRel of relativeIds) {
		let msRel = UIS[idRel];
		msRel.high('title');
	}

}
function unhighlightMsAndRelatives(ev, ms, partName) {
	let id = ms.id;
	ms.unhigh(partName);
	let relativeIds = id2uids[id];
	if (nundef(relativeIds)) return;
	for (const idRel of relativeIds) {
		let msRel = UIS[idRel];
		msRel.unhigh('title');
	}

}
function fullViewObjects() { let ids = getDefaultObjectIds(); ids.map(x => UIS[x].maximize()); }
function minimizeObjects() { let ids = getDefaultObjectIds(); ids.map(x => UIS[x].minimize()); }
function freezeUI() {
	if (frozen) return;
	frozen = true;
	show('tempFreezer');
}
function unfreezeUI() {
	if (!frozen) return;
	frozen = false;
	hide('tempFreezer');
}
function hideTooltip() { $('div#tooltip').css({ display: 'none' }); }

//#region local helpers
function _addFilterHighlight(ms) { ms.highC('green'); }
function _addStandardInteraction(id) {
	//console.log(id)
	let ms = UIS[id];
	switch (id[2]) {

		case 'a':
			ms.addClickHandler('elem', onClickSelectTuple);
			ms.addMouseEnterHandler('title', highlightMsAndRelatives);
			ms.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
			break;

		case 'l':
		case 'r':
			ms.addMouseEnterHandler('title', highlightMsAndRelatives);
			ms.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
			break;

		case 't':
			if (id[0] == 'm') { //main table objects!!!!!
				ms.addClickHandler('elem', onClickFilterOrInfobox);

				// if (ms.isa.deck) {
				// 	//card should also be magnified or minified!
				// 	//console.log('adding mouse handler to deck!!!')
				// 	ms.addMouseEnterHandler('topmost', highlightMsAndRelatives);
				// 	ms.addMouseLeaveHandler('topmost', unhighlightMsAndRelatives);
				// } else 
				if (ms.isa.card) {
					//card should also be magnified or minified!
					ms.addMouseEnterHandler('title', _highlightAndMagnify);
					ms.addMouseLeaveHandler('title', _unhighlightAndMinify);
				} else {
					ms.addMouseEnterHandler('title', highlightMsAndRelatives);
					ms.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
				}


			} else {
				ms.addClickHandler('elem', onClickFilterTuples);
				ms.addMouseEnterHandler('title', highlightMsAndRelatives);
				ms.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
			}
			break;

		default:
			ms.addClickHandler('elem', onClickFilterTuples);
			ms.addMouseEnterHandler('title', highlightMsAndRelatives);
			ms.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
			break;
	}
}
function _preselectFirstVisualsForBoats() {
	let oidlist = [];
	for (const id of getBoatIds()) {
		//select firstVisual for each oid in boat
		let oids = id2oids[id];
		//console.log(oids);
		if (isdef(oids)) oids.map(x => addIf(oidlist, x))
	}
	//console.log('oids to select:',oidlist);

	//console.log(oidlist);
	let vislist = oidlist.map(x => getMainId(x)).filter(x => x !== null);
	vislist = vislist.concat(oidlist.map(x => getDefId(x)));
	//console.log('vislist',vislist);
	vislist.map(id => UIS[id].highFrame());
}
function _removeFilterHighlight(ms) { ms.unhighC(); }
function _removeAllHighlighting(id) { let ms = UIS[id]; ms.unhighAll(); }
function _removeClickHandler(id) { let ms = UIS[id]; ms.removeClickHandler(); }
function _removeHoverHandlers(id) { let ms = UIS[id]; ms.removeHoverHandlers(); }
function _removeInteraction(id) { let ms = UIS[id]; ms.removeHandlers(); ms.unhighAll(); }

function _hideBoat(id) { let ms = UIS[id]; ms.hide(); ms.o.weg = true; }
function _showBoat(id) { let ms = UIS[id]; ms.show(); ms.o.weg = false; }
function _highlightNextBoat() {
	if (!boatHighlighted) _highlightBoat(getFirstBoatId());
	else {
		//console.log('boatHighlighted',boatHighlighted);
		let idx = boatHighlighted.o.iTuple + 1;
		//console.log('idx',idx);
		//console.log(getBoatIdByIdx(idx));
		_highlightBoat(getBoatIdByIdx(boatHighlighted.o.iTuple + 1));
	}
}
function _highlightPrevBoat() {
	if (!boatHighlighted) _highlightBoat(getLastBoatId()); else _highlightBoat(getBoatIdByIdx(boatHighlighted.o.iTuple - 1));
}
function _highlightBoat(id) {
	//console.log('...highlighBoat',id)
	if (id === null) return;
	if (boatHighlighted) {
		if (boatHighlighted.id == id) return;
		else _unhighlightBoat();
	}
	boatHighlighted = UIS[id];
	boatHighlighted.elem.scrollIntoView(false);
	highlightMsAndRelatives(null, boatHighlighted);
	_openInfoboxesForBoatOids(boatHighlighted);

}
function _openInfoboxesForBoatOids(boat) {
	let oids = boat.o.oids;
	let mainIds = oids.map(x => getMainId(x));
	for (const id of mainIds) {
		let ms = UIS[id];
		openInfobox(null, ms);
	}
}
function _closeInfoboxesForBoatOids(boat) {
	let oids = boat.o.oids;
	for (const oid of oids) hideInfobox(oid);
}
function _unhighlightBoat() {
	if (boatHighlighted) {
		unhighlightMsAndRelatives(null, boatHighlighted);
		_closeInfoboxesForBoatOids(boatHighlighted);
		boatHighlighted = null;
	}
}
function _highlightAndMagnify(ev, ms, partName) {
	//this is typical behavior for cards in a hand
	magnifyFront(ms.id);
	highlightMsAndRelatives(ev, ms, partName);
}
function _unhighlightAndMinify(ev, ms, partName) {
	minifyBack(ms.id);
	unhighlightMsAndRelatives(ev, ms, partName);
}

function robbedDescInBoats() {
	for (const id of IdOwner.a) {
		let boat = UIS[id];
		let desc = boat.desc;
		if (desc == 'robbed') {
			console.log('skip robbed!');
			return true;
		}
	}
	return false;
}
















//#region testing
function addTestInteraction(id) {
	let ms = UIS[id];
	ms.addClickHandler('title', onClickGetUIS);
	ms.addMouseEnterHandler('title', (x, pName) => x.high(pName));
	ms.addMouseLeaveHandler('title', (x, pName) => x.unhigh(pName));
}
function addBoatInteraction(id) {
	//console.log(id)
	let ms = UIS[id];
	ms.addClickHandler('elem', onClickSelectTuple);
	ms.addMouseEnterHandler('title', (x, pName) => x.high(pName));
	ms.addMouseLeaveHandler('title', (x, pName) => x.unhigh(pName));
}
function activateActions() { IdOwner.a.map(x => addBoatInteraction(x)) }
