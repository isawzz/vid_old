//#region helpers: linking UIS ...
function _addRelatives(id, oid) {
	// if (isdef(oid2ids[oid])) oid2ids[oid].map(x => listKey(id2uids, id, x)); //all other already existing uis are linked to newly created element!
	if (isdef(oid2ids[oid])) {
		for (const idOther of oid2ids[oid]) {
			if (idOther == id) {
				console.log('object', id, 'already exists in oid2ids[', oid, ']');
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
function getRandomShape() { return chooseRandom(['ellipse', 'roundedRect', 'rect', 'hex']); }
function linkObjects(id, oid) {
	// if (isdef(UIS[id])) {
	// 	console.log('linkObjects: ui', id, 'exists and CANNOT be overriden!!!!!');
	// }
	_addRelatives(id, oid);
	listKey(id2oids, id, oid);
	listKey(oid2ids, oid, id);

	//#region testcode
	// if (oid == '0' && id[0]=='m'){
	// 	console.log('link',id,'to',oid)
	// 	console.log(id2oids)
	// 	console.log(oid2ids)
	// }
	// if (isdef(UIS[id])) {
	// 	console.log('linkObjects: ui', id, 'exists and CANNOT be overriden!!!!!');
	// } else {
	// 	//console.log('*** created ***', id)
	// }
	// _addRelatives(id, oid);
	// listKey(id2oids, id, oid);
	// if (oid == '0') console.log('...................',oid2ids[oid], typeof oid, id, typeof id)
	// if (nundef(oid2ids[oid])) oid2ids[oid]=[];
	// if (oid == '0') console.log('...................',oid2ids[oid], typeof oid)
	// oid2ids[oid].push(id);
	// if (oid == '0') console.log('...................',oid2ids[oid], typeof oid)
	// //listKey(oid2ids, oid, id);
	// if (isdef(Number(oid))&& id[0]=='m'){
	// 	console.log('linked',id,'to',oid)
	// 	console.log(id2oids)
	// 	console.log(oid2ids)
	// 	console.log('__________________')
	// }
	// //console.log('after linking:',id2oids[id],oid2ids[oid]);
	//#endregion
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








