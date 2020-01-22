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

		//ms parent could be someuser area inside but not fully covering a_d_game!
		// //

		// let parentOfMs = UIS[ms.idParent];
		// let parentX=parentOfMs.x;
		// let parentY = parentOfMs.y;
		// let objX = ms.x;
		// let objY = ms.y;
		// let x=parentX+objX;
		// let y=parentY+objY;

		// console.log('idParent:',ms.idParent)
		// console.log('ccord in a_d_game:',parentX,parentY,objX,objY,x,y)

		// let defX=ms.x+area.w/2;
		// let defY=ms.y+area.h/2;
		// console.log('...using:',defX,defY);
		let pos = calcMainVisualPosCenterInGameArea(ms)
		msInfobox.setPos(pos.x,pos.y); //ms.x+area.w/2, ms.y+area.h/2);
	}

}
function calcMainVisualPosCenterInGameArea(ms){
	let area = UIS['a_d_game'];

	//ms parent could be someuser area inside but not fully covering a_d_game!
	let parent = UIS[ms.idParent];
	//if this parent does not have coords, look at his parent
	if (nundef(parent.x)) parent = UIS[parent.idParent];

	let offX=0;
	let offY=0;
	if (ms.cat == 'g'){offX=parent.w/2;offY=parent.h/2;}

	let x=offX+parent.x+ms.x;
	let y=offY+parent.y+ms.y;

	return {x:x,y:y};

}
function hideInfobox(oid) { let id = makeIdInfobox(oid); if (UIS[id]) UIS[id].hide(); }
function destroyInfoboxFor(oid) { let id = makeIdInfobox(oid); if (UIS[id]) deleteRSG(id); }
function clearInfoboxes() {
	let ids = Array.from(getIdsInfobox());
	for (const id of ids) { deleteRSG(id); }
	maxZIndex = 10;
}

// function staticPos(ms) {
// 	let gameArea = UIS['a_d_game'];
// 	let actionArea = UIS['a_d_actions'];
// 	let pageHeaderArea = UIS['a_d_header'];
// 	let statusArea = UIS['a_d_status'];
// 	let x = actionArea.w + gameArea.w / 2 + ms.x;
// 	let y = pageHeaderArea.h + statusArea.h + gameArea.h / 2 + ms.y;
// 	return { x: x, y: y };
// }








