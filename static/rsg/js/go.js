//domType:cat
const DOMCATS = { rect: 'g', g: 'g', circle: 'g', text: 'g', polygon: 'g', line: 'g', body: 'd', svg: 'h', div: 'd', p: 'd', table: 'd', button: 'd', a: 'd', span: 'd', image: 'd', paragraph: 'd', anchor: 'd' };
//rsg types = { a: 'area', b: 'boat', c: 'chrome', d: 'def', m: 'main', n: 'none', r: 'ref',R:'root', s: 'struct', t: 'test', x: 'aux' };
//owner types = { a: 'actions',  b: 'button', c: 'chrome', d: 'dom', g: 'g_area', i:'infobox', l: 'log', m: 'messages', p: 'players', s: 'struct', t: 'table', u:'user_area' };
//id: rsgType_IdOwnerType_oidOrCounterOrName
// >>>> UIS IdOwner id2oids oid2ids id2uids
function makeIdInfobox(oid) { return 'i_i_' + oid; }
function getIdsInfobox() { return IdOwner.i ? IdOwner.i : []; }
function makeIdDefaultObject(oid) { return 'd_t_' + oid; }
function makeIdDefaultPlayer(oid) { return 'd_p_' + oid; }


//get ids for oid as list
function isStructuralElement(oid) { if (nundef(G.table) || !(oid in G.table)) return false; return 'map' in G.table[oid]; }
function defaultVisualExists(oid) { return firstCond(oid2ids[oid], x => x[0] == 'd'); }
function someVisualExists(oid) { return firstCond(oid2ids[oid], x => x[0] == 'd' || x[0] == 'm'); }
function mainVisualExists(oid) { return firstCond(oid2ids[oid], x => x[0] == 'm'); }
function isBoardElement(oid) { let o = getVisual(oid); return o.idParent[2] == 's'; }
function isBoardObject(o) { return o.map && o.fields; }
function isField(o) { return o.neighbors; }

//function getOidForId(id){ return id[0]=='d'||id[0]=='m'?substring(id,4) : stringAfter(id,'@');}
//function getOidForDefaultId(id) { return id[0] == 'd' ? id.substring(4) : null; }
//function getOid
function getOidForMainId(id) { return id[0] == 'm' ? id.substring(4) : null; }
function getAreaName(id) { return startsWith(id,'m_A')? id.substring(4):id;}
function getIdArea(areaName) {
	//name could be 'DevCards' or 'M' or 'a_d_game'
	if (startsWith(areaName, 'a_d_')) {
		//this is a built-in area
		return areaName;
	} else if (startsWith(areaName, 'm_A_')) {
		return areaName;
	} else {
		return 'm_A_' + areaName;
	}
}
function getMainId(oid) { return firstCond(oid2ids[oid], x => x[0] == 'm'); }
function getVisual(oid) { return UIS[getMainId(oid)]; }

function getDefId(oid) { return firstCond(oid2ids[oid], x => x[0] == 'd'); }
function getDefVisual(oid) { return UIS[getDefId(oid)]; }
function getPageHeaderDivForPlayer(oid) { return document.getElementById('c_c_' + G.playersAugmented[oid].username); }
function getFirstVisual(oid) { let res = getVisual(oid); return res ? res : getDefVisual(oid); }

function _getChildrenOf(id) { let ui = UIS[id]; return ui.children; }
function getList(lst) { return isdef(lst) ? lst : []; }

function getDefaultObjectIds() { return _getChildrenOf(S.settings.table.defaultArea); }
function getDefaultObjects() { return getDefaultObjectIds(x => UIS[x]); }

function getDefaultPlayerIds() { return _getChildrenOf(S.settings.player.defaultArea); }
function getDefaultPlayers() { return getDefaultPlayerIds(x => UIS[x]); }

function getAuxIds() { return getList(IdOwner.l); }
function getAux() { return getAuxIds.map(x => UIS[x]); }

function getBoatIdByIdx(idx) {
	if (!IdOwner.a || empty(IdOwner.a)) return null;
	if (idx < 0) idx += IdOwner.a.length;
	idx = idx % IdOwner.a.length;
	return IdOwner.a[idx];
}
function getFirstBoatId() { if (!IdOwner.a || empty(IdOwner.a)) return null; return IdOwner.a[0]; }
function getLastBoatId() { if (!IdOwner.a || empty(IdOwner.a)) return null; return IdOwner.a[IdOwner.a.length - 1]; }
function getFirstBoat() { if (!IdOwner.a || empty(IdOwner.a)) return null; return UIS[getFirstBoatId()]; }
function getBoatIds() { return getList(IdOwner.a); }
function getBoats() { return getBoatIds().map(x => UIS[x]); }
function getRandomBoat() { return UIS[chooseRandom(getBoatIds())]; }
function getBoatWith(lst, isGood = true) {
	let boats = getBoats();
	if (!isGood) {
		let goodBoats = [];
		for (const b of boats) {
			//console.log(b.o.text)
			if (empty(lst.filter(x => b.o.text.includes(x)))) goodBoats.push(b);
		}
		//boats = boats.filter(x => empty(lst.filter(y => x.text.includes(y))));
		return goodBoats.length > 0 ? chooseRandom(goodBoats) : null;
	} else {
		for (const b of boats) {
			if (!empty(lst.filter(x => b.o.text.includes(x)))) return b;
		}
	}
	return null;
}
function strategicBoat(goodlist, badlist) {
	let boats = getBoats();
	let goodBoats = boats;
	if (isdef(badlist)) {
		goodBoats = [];
		for (const b of boats) {
			//console.log(b.o.text)
			if (empty(badlist.filter(x => b.o.text.includes(x)))) goodBoats.push(b);
		}
	}
	if (isdef(goodlist)) { //take it by priority! first one is highest priority!
		for (const kw of goodlist) {
			for (const b of boats) {
				if (b.o.text.includes(kw)) return b;
			}
		}
	}
	//if still here didnt find goodlist match!
	return chooseRandom(goodBoats);
}
/*

function pureId(id){return id.substring(4)}
function getIds(id, type = 'all') {
	let res = id2uids[id];
	if (nundef(res)) return [];
	if (empty(res) || type == 'all') return res;
	return res.filter(x => isdef(x[type]));
}

function getRelativeIds(id){return getList(id2ids[id]);}
function getVisuals(id, type = 'all') { return getIds(id, type).map(x => UIS[x]); }
function getVisual(oid) { return getMainVisual(oid); }
function getMainVisual(oid) { return UIS[oid]; }
function getFirstVisual(oid) { return UIS[oid] ? UIS[oid] : UIS['d@' + oid]; }

function getDefId(oid) { return firstCond(getList(oid2ids[oid]),x=>x[0]=='d');}
function getDefVisual(oid) { return UIS[getDefId(oid)];}

function getBoatId(idx) { return firstCond(getList(IdOwner.a),x=>pureId(x)==idx.toString()); }
function getBoat(idx) { return UIS[getBoatId(idx)]; }

function getBoats(id) { return getVisuals(id, 'boat') }
function getAuxVisuals(id) { return getVisuals(id, 'aux') }
*/
//************** TODO **************************/
//general shortcut to create g shapes sollte fuer beide systeme gehen!!!
function createVisual(id, areaName, { rings = 3, bg = 'darkslategray', fg = 'lime', label, shape = 'circle', iPalette, ipal, fill, x = 0, y = 0, w = 25, h = 25, sPoints, border = 'green', thickness = 1, rounding, path, txt, fz = 12, sz, overlay = true, draw = true } = {}) {
	let parent = getVisual(areaName);
	if (parent.cat == 'd') {
		if (parent.ids.length != 1) {
			error('DIV cannot have more than 1 G child!!!');
		} else {
			parent = getVisual(parent.ids[0]);
			areaName = parent.id;
			////console.log('switched areaName/parent:',areaName,parent)
		}
	}
	let ms = new __O(id, areaName, 'G');//, G.table);
	// ms.circle({sz:25,fill:'red'});//.draw();
	// ms.attach();
	// return ms;

	let options = {};
	let labelOptions = {};
	if (iPalette && ipal) fill = S.pals[iPalette][ipal];
	if (bg) ms.setBg(bg);
	if (fg) { ms.setFg(fg); }
	if (fill) options.fill = fill;
	if (x) options.x = x;
	if (y) options.y = y;
	if (h) { options.h = h; options.sz = h; }
	if (w) { options.w = w; options.sz = w; }
	if (sz) options.sz = sz;
	if (txt) { options.txt = txt; labelOptions.txt = txt; }
	if (label) { labelOptions.txt = label; }
	if (fz) { options.fz = fz; labelOptions.fz = fz; }
	if (sPoints) options.sPoints = sPoints;
	if (border) options.border = border;
	if (thickness) options.thickness = thickness;
	if (rounding) options.rounding = rounding;
	if (path) options.path = './assets/images/transpng/' + path + '.png';
	if (rings) {
		////console.log('rings',rings);
	} else rings = 1;
	dSize = Math.max(w / 6, 5);
	for (let i = 0; i < rings; i++) {
		switch (shape) {
			case 'circle':
				ms.circle(options);
				break;
			case 'hex':
				ms.hex(options);
				break;
			case 'rect':
				ms.rect(options);
				break;
			case 'poly':
				ms.poly(options);
				break;
			case 'image':
				ms.image(options);
				break;
			case 'text':
				ms.text(options);
				break;
			default:
				return null;
		}
		options.w -= dSize;
		options.sz -= dSize;
		options.h -= dSize;
		////console.log(options);
		//options.fill=colorLighter(options.fill);
	}
	if (label) {
		ms.text(labelOptions);
	}
	if (h) { options.h = h; options.sz = h; }
	if (w) { options.w = w; options.sz = w; }
	if (sz) options.sz = sz;
	if (overlay) {
		overlayOptions = jsCopy(options);
		overlayOptions.className = 'overlay';
		delete overlayOptions.fill;
		delete overlayOptions.path;
		switch (shape) {
			case 'circle':
				ms.circle(overlayOptions);
				break;
			case 'hex':
				ms.hex(overlayOptions);
				break;
			case 'rect':
				ms.rect(overlayOptions);
				break;
			case 'poly':
				ms.poly(overlayOptions);
				break;
			case 'image':
				ms.rect(overlayOptions);
				break;
			case 'text':
				ms.text(overlayOptions);
				break;
			default:
				return null;
		}
	}
	if (draw) ms.attach();
	return ms;
}


//*********************** BACK END ************************* */
//access to backend objects
function getPlayer(id) { return G.playersAugmented[id]; }
function getObject(id) { return G.table[id]; }
function getFields(board) {
	let fids = board.strInfo.fields;
	return fids.map(x => G.table[x]);
}
function getCorners(board, func) {
	let fids = board.strInfo.corners;
	let res = [];
	for (const id of board.strInfo.corners) {
		if (func(G.table[id]) || func(getVisual(id))) {
			let o = getVisual(id);
			for (const prop in G.table[id]) {
				o[prop] = G.table[id][prop];
			}
			res.push(o);
		}
	}
	return res;

}
function getFieldEdges(o) {
	//let o=G.table[f.id];
	let edgeIds = o.edges.map(x => x._obj);
	return edgeIds.map(x => isdef(x) ? G.table[x] : x);
}
function getEdgeCorners(o) {
	//let o=G.table[e.id];
	let cornerIds = o.corners.map(x => x._obj);
	return cornerIds.map(x => isdef(x) ? G.table[x] : x);
}


