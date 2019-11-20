var maxZIndex=10;
function bringInfoboxToFront(ms){
	ms.elem.style.zIndex = maxZIndex;
	maxZIndex += 1;
}
function checkControlKey(ev) {
	//console.log('key released!', ev);
	if (ev.key == 'Control') {
		isControlKeyDown = false;
		clearInfoboxes();
	}
}
function openInfobox(ev, ms, part) {
	//von ms hol ich mir oid

	let oid = getOidForMainId(ms.id);
	if (!oid) return;

	let id = makeIdInfobox(oid);
	let ibox=UIS[id];
	if (ibox) {
		let elem = ibox.elem;
		if (isVisible(elem)){
			//console.log('infobox',ibox.id,'VISIBLE',elem);
			hide(elem);
		}else{
			//console.log('infobox',ibox.id,'NOT visible',elem);
			show(elem);
		}
	} else {
		let msInfobox = makeInfobox(ms.id, oid, G.table[oid]);
		//von ev hol ich mir pos
		//console.log('pos von ms',ms.x,ms.y,ms.w,ms.h)
		//let pos = ms.calcCenterPos(ev); //mach hier ein posAtCenterOf(msOther)???
		//msInfobox.setPos(pos.x, pos.y);
		let area = UIS['a_d_game'];
		msInfobox.setPos(ms.x+area.w/2, ms.y+area.h/2);
	}

}
function hideInfobox(oid) { let id = makeIdInfobox(oid); if (UIS[id]) UIS[id].hide(); }
function destroyInfoboxFor(oid) { let id = makeIdInfobox(oid); if (UIS[id]) deleteRSG(id); }
function clearInfoboxes() {
	let ids = Array.from(getIdsInfobox());
	//console.log('clearInfoboxes', ids)
	for (const id of ids) { deleteRSG(id); }
	maxZIndex = 10;
}

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

function staticPos(ms) {
	let gameArea = UIS['a_d_game'];
	let actionArea = UIS['a_d_actions'];
	let pageHeaderArea = UIS['a_d_header'];
	let statusArea = UIS['a_d_status'];
	let x = actionArea.w + gameArea.w / 2 + ms.x;
	let y = pageHeaderArea.h + statusArea.h + gameArea.h / 2 + ms.y;
	return { x: x, y: y };
}








