//#region create MS 
function makeInfobox(uid, oid, o) {
	let id = makeIdInfobox(oid);
	if (isdef(UIS[id])) { 
		//console.log('CANNOT create ' + id + ' TWICE!!!!!!!!!'); 
		return; 
	}
	let ms = new RSG();
	ms.id = id;
	let domel = document.createElement('div');
	domel.style.cursor = 'default';
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = 'a_d_game'; //wer soll parent von infobox sein? brauch div!
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);

	let sTitle = oid + ': ' + o.obj_type;
	ms.title(sTitle);

	//let pos = staticPos(ms);
	//ms.setPos(pos.x, pos.y);
	ms.setBg('sienna')
	ms.elem.style.border = '2px solid dimgray';

	ms.o = o;
	ms.isa['infobox'] = true;

	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	ms.attach();

	let x = ms.tableX(o);
	//console.log(ms.id,ms.refs,ms.refs['table'])
	ms.addMouseEnterHandler('title', highlightMsAndRelatives);
	ms.addMouseLeaveHandler('title', unhighlightMsAndRelatives);
	ms.addMouseEnterHandler('', ()=>bringInfoboxToFront(ms));
	ms.addClickHandler('',()=>ms.hide())
	ms.refs['table'].map(x => {
		UIS[x].addMouseEnterHandler('title', highlightMsAndRelatives);
		UIS[x].addMouseLeaveHandler('title', unhighlightMsAndRelatives);
	});
	bringInfoboxToFront(ms);
	return ms;
}



function makeRoot() {
	let ms = new RSG();
	let id = 'R_d_root';
	ms.id = id;
	ms.elem = domId(id);
	ms.domType = getTypeOf(ms.elem);
	ms.IdParent = null;
	ms.isAttached = true;
	UIS[id] = ms;
	return ms;
}
function makeDomArea(domel) {
	if (nundef(domel.id)) return;
	let ms = new RSG();
	let id = domel.id;
	ms.id = id;
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = domel.parentNode.id;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);
	ms.isAttached = true;
	UIS[id] = ms;
	listKey(IdOwner, id[2], id);
	return ms;
}
function makeArea(areaName, idParent) {
	let ms = new RSG();
	let id = 'm_A_' + areaName;
	ms.id = id;
	let domel = document.createElement('div');
	//el.innerHTML='hallo!';
	// el.style.backgroundColor = randomColor();
	domel.style.position = 'absolute';
	// el.style.left='0px';
	// el.style.top=''+testPosY+'px'; testPosY+=100;
	// el.style.width='100%';
	// el.style.height='50%';
	ms.elem = domel;
	ms.elem.id = id;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(ms.elem);
	ms.cat = DOMCATS[ms.domType];
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);
	ms.attach();
	UIS[id] = ms;
	linkObjects(id, areaName);
	//console.log(oid2ids[areaName]);
	listKey(IdOwner, id[2], id);
	return ms;
}
function makeLogArea(plid) {
	let ms = new RSG();
	let idParent = 'a_d_log';
	let id = idParent + '_' + plid;
	ms.id = id;
	let el = document.createElement('div');
	el.style.position = 'absolute';
	el.style.left = '0px';
	el.style.top = '0px';
	el.style.width = '100%';
	el.style.height = '100%';
	el.style.overflowY = 'auto';
	ms.elem = el;
	ms.elem.id = id;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(ms.elem);
	ms.cat = DOMCATS[ms.domType];
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);
	ms.attach();
	UIS[id] = ms;
	listKey(IdOwner, id[2], id);
	return ms;
}

function makeDrawingArea(id, idArea, addToUIS = false) {

	if (addToUIS && isdef(UIS[id])) { error('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;

	let idParent = idArea;
	ms.idParent = idArea;
	let parent = UIS[idParent];
	if (parent) parent.children.push(id);
	let parentElem = parent ? parent.elem : document.getElementById(idArea);

	let domel = addSvgg(parentElem, id, { originInCenter: true }); //attaches drawing area!
	ms.w=parent.w;
	ms.h=parent.h;
	//console.log(domel.offsetWidth,domel.offsetHeight,parent.w,parent.h)
	ms.isAttached = true;

	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];

	ms.isa.drawingArea = true;

	if (addToUIS) {
		listKey(IdOwner, id[2], id);
		UIS[id] = ms;
	}
	return ms;


}
function makeDrawingElement(id, idDrawingArea, addToUIS = false) {

	if (isdef(UIS[id])) {
		error('CANNOT create ' + id + ' TWICE!!!!!!!!!');
		return;
	}
	let ms = new RSG();
	ms.id = id;
	let domel = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];

	let idParent = idDrawingArea;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	if (parent) parent.children.push(id);

	if (addToUIS) {
		listKey(IdOwner, id[2], id);
		UIS[id] = ms;
	}
	return ms;
}
function makeBoardElement(oid, o, idBoard, elType) {
	let id = 'm_t_' + oid;
	if (isdef(UIS[id])) {
		error('CANNOT create ' + id + ' TWICE!!!!!!!!!');
		return;
	}
	let ms = new RSG();
	ms.id = id;
	let domel = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	ms.elem = domel;
	ms.elem.id = id;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = idBoard;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);

	ms.o = o;
	ms.isa[elType] = true;

	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	//ms.attach();
	return ms;

}
function makeBoard(idBoard, o, areaName) {
	let id = 'm_s_' + idBoard;
	if (isdef(UIS[id])) { error('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;
	let domel = addSvgg(UIS[areaName].elem, id, { originInCenter: true });
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = areaName;
	ms.idParent = areaName;
	let parent = UIS[idParent];
	parent.children.push(id);

	ms.o = o;
	ms.isa.board = true;

	linkObjects(id, idBoard);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	ms.isAttached = true;
	return ms;

}

function makeCard(oid, o, areaName) {
	let idArea = getIdArea(areaName);
	//console.log('makeCard', oid, areaName);
	let id = 'm_t_' + oid;
	if (isdef(UIS[id])) { console.log('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;
	let domel = _makeCardDiv(oid, o);
	domel.id = id;
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let parent = UIS[idArea]; //hand area
	let idParent = parent.id;
	ms.idParent = idParent;
	parent.children.push(id);

	ms.o = o;
	ms.isa.card = true; //pieces have location! if location changes a piece must change its parent!!! 

	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;

	return ms;

}

function makeRefs(idParent, refs) {
	for (const ref of refs) {
		let id = ref.id;
		let oids = ref.oids;
		if (isdef(UIS[id])) { error('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
		let ms = new RSG();
		ms.id = id;
		let domel = document.getElementById(id);
		//console.log('ref elem:',domel)
		ms.elem = domel;
		ms.parts.elem = ms.elem;
		ms.domType = getTypeOf(domel);
		ms.cat = DOMCATS[ms.domType];
		ms.idParent = idParent;
		let parent = UIS[idParent];
		parent.children.push(id);
		ms.isAttached = true;

		ms.isa.ref = true;
		ms.o = ref.oids;

		for (const oid of ref.oids) linkObjects(id, oid);
		listKey(IdOwner, id[2], id);
		UIS[id] = ms;
	}
}
function makeAux(s, oid, areaName, directParent) {
	let id = 'x_l_' + getUID() + '@' + oid;
	if (isdef(UIS[id])) { error('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;
	let domel = document.createElement('div');
	domel.classList.add('hallo');
	domel.innerHTML = s;
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = areaName;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);

	ms.isa.aux = true;

	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	//ms.attach();
	if (isdef(directParent)) { ms.isAttached = true; directParent.appendChild(ms.elem) } else ms.attach();
	return ms;

}

function makeDefaultObject(oid, o, areaName) { return _makeDefault(makeIdDefaultObject(oid), oid, o, areaName, oid + ': ' + o.obj_type); }
function makeDefaultPlayer(oid, o, areaName) { return _makeDefault(makeIdDefaultPlayer(oid), oid, o, areaName, 'player: ' + oid + '(' + getPlayerColorString(oid) + ', ' + getUser(oid) + ')'); }
function _makeDefault(id, oid, o, areaName, title) {
	if (isdef(UIS[id])) { error('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;
	let domel = document.createElement('div');
	domel.style.cursor = 'default';
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = areaName;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);

	let sTitle = title;
	ms.title(sTitle);

	ms.o = o;
	ms.isa[o.obj_type] = true;

	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	ms.attach();
	return ms;

}
function makeDefaultAction(boat, areaName) {
	let ms = new RSG();
	let id = 'd_a_' + boat.iTuple;
	if (isdef(UIS[id])) { error('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return null; }
	ms.id = id;
	let domel = document.createElement('div');
	domel.textContent = boat.text;
	domel.style.cursor = 'pointer';
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = areaName;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);

	ms.o = boat;
	ms.isa.boat = true;

	for (const tupleEl of boat.tuple) {
		if (tupleEl.type == 'obj' && isdef(tupleEl.ID)) {
			let oid = tupleEl.ID;
			boat.oids.push(oid);
			linkObjects(id, oid);
		}
	}

	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	ms.attach();
	return ms;

}

function getBoardElementStandardType(ms){
	return ms.isa.corner?'corner':ms.isa.field?'field':'edge';
}
function makeMainVisual(oid, o) {
	//examples are: building(road,settlement), robber
	//main objects are only made if loc on board element!
	//console.log(oid, o);
	//depending on size, will be labeled w/ any simple field val, or oid if none
	if (!('loc' in o) || !isBoardElement(o.loc._obj)) return null;

	let id = 'm_t_' + oid;
	if (isdef(UIS[id])) { console.log('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;
	let domel = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let locElem = getVisual(o.loc._obj);
	let parent = UIS[locElem.idParent]; //board should be parent, not board element!!!
	//console.log('parent', parent);
	//console.log('locElem', locElem);

	let idParent = parent.id;
	ms.idParent = idParent;
	parent.children.push(id);

	ms.o = o;
	ms.isa.movable = 'loc'; //pieces have location! if location changes a piece must change its parent!!! 

	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;

	let color = S.settings.useColorHintForObjects ? getColorHint(o) : randomColor();
	if (nundef(color)) color = 'black';// randomColor();
	//console.log('isEdge',locElem.isa.edge)
	//if (locElem.isa.edge) console.log(locElem.w,locElem.h,locElem)
	//console.log('........locElem.isa',locElem.isa);
	let boardElemType = getBoardElementStandardType(locElem);
	let sizeInfo=S.settings.pieceSizeRelativeToLoc[boardElemType];
	
	let baseValue = locElem[sizeInfo[0]];
	let percent = Number(sizeInfo[1]);
	let sz = (baseValue*percent)/100;

	//default piece for field,node is circle of size sz w/ symbol in middle
	if (boardElemType != 'edge'){
		makePictoPiece(ms,o,sz,color)
		ms.setPos(locElem.x, locElem.y); 
	}else{
	//default piece for edge is lineSegment along edge of length sz (w/ symbol only if addSymbolToEdges==true)
		makeLineSegment(ms,o,locElem,sz,color);
	}
	ms.attach();
	return ms;
}
function makeLineSegment(ms,o,msLoc,sz,color){
	//TODO: S.settings.addSymbolsToEdges
	let [x1,y1,x2,y2]=msLoc.getEndPointsOfLineSegmentOfLength(sz);
	//let ms2=makeDrawingElement('el2', 'board');
	ms.line({cap:'round',thickness:msLoc.thickness,x1:x1,y1:y1,x2:x2,y2:y2}).setBg(color).attach();
	ms.line({className:'overlay',cap:'round',thickness:msLoc.thickness,x1:x1,y1:y1,x2:x2,y2:y2});

}
function makePictoPiece(ms,o,sz,color){

	//console.log('unit',unit,'percent',percent,'sz',sz);
	let [w, h] = [sz,sz]; 

	let sym = o.obj_type;
	if (sym in S.settings.symbols){sym = S.settings.symbols[sym];}
	if (!(sym in iconChars)) sym = randomNumber(5,120); //abstract symbols
	ms.ellipse({ w: w, h: h, fill: color, alpha:.3 });
	let pictoColor = color == 'black'?randomColor():color;
	ms.pictoImage(sym,pictoColor, sz*2/3); //colorDarker(color),sz*2/3);
}
function makeMainPlayer(oid, o, areaName) {
	let id = 'm_p_' + oid;
	if (isdef(UIS[id])) { console.log('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }
	let ms = new RSG();
	ms.id = id;
	let title = 'player: ' + oid + '(' + getPlayerColorString(oid) + ', ' + getUser(oid) + ')';
	// _makeDefault(makeIdDefaultPlayer(oid), oid, o, areaName, ); }
	let domel = document.createElement('div');
	domel.style.cursor = 'default';
	ms.elem = domel;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(domel);
	ms.cat = DOMCATS[ms.domType];
	let idParent = areaName;
	ms.idParent = idParent;
	let parent = UIS[idParent];
	parent.children.push(id);

	let sTitle = title;
	let color = G.playersAugmented[oid].color;
	ms.title(sTitle, 'title', color);

	ms.o = o;
	ms.isa.player = true;

	linkObjects(id, oid);
	listKey(IdOwner, id[2], id);
	UIS[id] = ms;
	ms.attach();
	return ms;

}

//#region tableElemX
function tableElemX(o, keys) {
	//console.log(o,keys)
	let t = document.createElement('table');
	t.classList.add('tttable');
	let refs = [];//collect references to objects and players inside of table {oids:[oids],clid:clid,type:'p'|'t'} => parts
	let s = '';
	for (const k in o) {
		if (isdef(keys) && !keys.includes(k)) continue;
		s += '<tr><th>' + k + '</th><td>';
		let sval = transformToString(k, o[k], refs);
		s += sval + '</td>';
	}
	t.innerHTML = s;
	return { table: t, refs: refs };
}
function tableHTMLX(o, refs) {
	let s = '<table class="tttable up10">';
	for (const k in o) {
		s += '<tr><th>' + k + '</th><td>';
		let sval = transformToString(k, o[k], refs);
		s += sval + '</td>';
	}
	s += '</table>';
	return s;
}

function atleastOneElementOfXIsDictWithKey(lst, k) {
	for (const x of lst) { if (!x) continue; if (isDict(x) && k in x) return true; }
	return false;
}
function isListOf(x, key = '_obj') {
	return isList(x) && !empty(x) && atleastOneElementOfXIsDictWithKey(x, key); //isDict(x[0]) && '_obj' in x[0];
}
function makeRefLinkDiv(val, refs, prop, prefix) {
	let cl = prefix + '_r_' + getUID(); let ref = { oids: [val[prop]], id: cl }; refs.push(ref);
	let sval = `<div id=${cl} class='up10 hallo'>${val[prop].toString()}</div>`;
	return sval;
}
function makeRefLinkDiv4_obj(val, refs) { return makeRefLinkDiv(val, refs, '_obj', 't'); }
function makeRefLinkDiv4_player(val, refs) { return makeRefLinkDiv(val, refs, '_player', 'p'); }
function makeRefLinkDivList(val, refs, prop, prefix, className = 'up10 hallo') {
	let cl = prefix + '_r_' + getUID(); let ref = { oids: val.filter(x => isdef(x)).map(x => x[prop]), id: cl }; refs.push(ref);
	let sval = `<div id=${cl} class='${className}'>${val.map(x => !x ? '_' : x[prop]).toString()}</div>`;
	return sval;
}
function makeRefLinkDiv4ListOf_obj(val, refs, className = 'up10 hallo') {
	return makeRefLinkDivList(val, refs, '_obj', 't', className);
}
function makeRefLinkDiv4ListOf_player(val, refs, className = 'up10 hallo') {
	return makeRefLinkDivList(val, refs, '_player', 'p', className);
}
function makeRefLinkDiv4MatrixOf_obj(val, refs) {
	let rows = val._ndarray;
	let sval = `<div>`;
	let rowClass = 'up2 hallo';
	for (const row of rows) {
		sval += makeRefLinkDiv4ListOf_obj(row, refs, rowClass) + '<br>';
		rowClass = 'hallo';
	}
	sval += '</div>';
	return sval;
}
function transformToString(k, val, refs) {
	if (val && isDict(val) && '_set' in val) { val = val._set; }
	if (k == 'visible' && !empty(val) && !isDict(val[0])) { val = val.map(x => { return { _player: x } }); }

	let sval = null;
	if (isList(val) && empty(val)) { sval = '{ }'; }
	else if (isList(val) && isString(val[0])) { sval = '{' + val.join(',') + '}' }
	else if (isListOf(val, '_obj')) { sval = makeRefLinkDiv4ListOf_obj(val, refs); }
	else if (isListOf(val, '_player')) { sval = makeRefLinkDiv4ListOf_player(val, refs); }
	else if (val && isDict(val) && '_obj' in val) { sval = makeRefLinkDiv4_obj(val, refs); }
	else if (val && isDict(val) && '_ndarray' in val) { sval = makeRefLinkDiv4MatrixOf_obj(val, refs) }
	else if (val && isDict(val) && '_player' in val) { sval = makeRefLinkDiv4_player(val, refs); }
	else if (isDict(val)) { sval = tableHTMLX(val, refs); }
	else sval = simpleRep(val);

	// if (k == 'ports'){
	// 	console.log('ports:',k,val,sval)
	// }

	return sval;
}
//#endregion

//#region delete MS 
function _deleteFromOwnerList(id) { let owner = IdOwner[id[2]]; if (isdef(owner)) removeInPlace(owner, id); }
function deleteRSG(id) {
	//console.log('deleting',id)
	let ms = UIS[id];
	if (nundef(ms)) {
		error('object that should be deleted does NOT exist!!!! ' + id);
		//console.log(DELETED_IDS);
		//console.log(DELETED_THIS_ROUND);
		//return;
	}
	unhighlightMsAndRelatives(null, ms)
	unlink(id);
	_deleteFromOwnerList(id);
	ms.destroy();
	DELETED_IDS.push(id);
	DELETED_THIS_ROUND.push(id);
	delete UIS[id];
}
function deleteAll(rsgType, idoType) {
	let ids = IdOwner[idoType];
	//console.log(ids);
	ids = isdef(IdOwner[idoType]) ? IdOwner[idoType].filter(x => x[0] == rsgType) : []; for (const id of ids) deleteRSG(id);
}
function deleteDefaultObjects() { deleteAll('d', 't'); }
function deleteDefaultPlayers() { deleteAll('d', 'p'); }
function deleteActions() { deleteAll('d', 'a'); }
function deleteOid(oid) {
	let uids = jsCopy(oid2ids[oid]);

	//console.log('related to', oid, 'are', uids)
	//of these only have to delete main object and default object
	//no need to delete auxes?
	//no need to delete because these will be updated in all objects that have changed via table update!
	for (const uid of uids) {
		if (uid[2] == 'r' || uid[2] == 'l') continue;
		//console.log('deleting', uid);
		if (UIS[uid]) deleteRSG(uid);
	}
}
//#endregion

//#region helpers: linking UIS ...
function _addRelatives(id, oid) {
	// if (isdef(oid2ids[oid])) oid2ids[oid].map(x => listKey(id2uids, id, x)); //all other already existing uis are linked to newly created element!
	if (isdef(oid2ids[oid])) {
		for (const idOther of oid2ids[oid]) {
			if (idOther == id) {
				//console.log('object',id,'already exists in oid2ids[',oid,']'); 
				continue;
			}
			listKey(id2uids, id, idOther);
			listKey(id2uids, idOther, id);
		}
	}
}
function getUser(idPlayer) { return G.playersAugmented[idPlayer].username; }
function getPlayerColor(id) { return G.playersAugmented[id].color }
function getPlayerColorString(id) { return G.playersAugmented[id].altName }

function getColorHint(o) {
	for (const k in o) {
		if (k.toLowerCase() == 'color') return o[k];
		if (isDict(o[k]) && isdef(o[k]._player)) return getPlayerColor(o[k]._player);
	}
	return null;
}
function getRandomShape() { return chooseRandom('ellipse', 'roundedRect', 'rect', 'hex'); }
function linkObjects(id, oid) {
	if (isdef(UIS[id])) {
		//console.log('linkObjects: ui', id, 'exists and CANNOT be overriden!!!!!');
	}
	//console.log('*** created ***',id)
	_addRelatives(id, oid);
	listKey(id2oids, id, oid);
	listKey(oid2ids, oid, id);
}
function unlink(id) {
	let oids = id2oids[id];
	let uids = id2uids[id];
	//console.log('unlink', 'oids', oids)
	//console.log('unlink', 'uids', uids)
	if (isdef(uids)) for (const uid of uids) removeInPlace(id2uids[uid], id);
	if (isdef(oids)) for (const oid of oids) removeInPlace(oid2ids[oid], id);
	delete id2uids[id];
	delete id2oids[id];
}
function showTT(ev) {
	if (TTMS) {

		$(TTMS.elem).off('mouseover');
		console.log('hallo')
		let d = document.getElementById('tooltip');
		clearElement(d);
		let t = tableElem(TTMS.o);
		d.appendChild(t);
		$('div#tooltip').css({
			display: 'inline-block',
			top: ev.pageY, //clientY-dy+ms.h,//e.pageY, //clientY,
			left: ev.pageX, //clientX-dx+ms.w, //e.pageX, //clientX,
			//width: '300px',
			//height: '300px'
		});
		TTMS = null;
	}
}


//get or set attributes of a dom elem
(function ($) {
	$.fn.attrs = function (attrs) {
		var t = $(this);
		if (attrs) {
			// Set attributes
			t.each(function (i, e) {
				var j = $(e);
				for (var attr in attrs) {
					j.attr(attr, attrs[attr]);
				}
			});
			return t;
		} else {
			// Get attributes
			var a = {},
				r = t.get(0);
			if (r) {
				r = r.attributes;
				for (var i in r) {
					var p = r[i];
					if (typeof p.nodeValue !== 'undefined') a[p.nodeName] = p.nodeValue;
				}
			}
			return a;
		}
	};
})(jQuery);



















