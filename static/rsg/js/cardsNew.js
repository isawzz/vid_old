function updateTableCardCollections() {

	let msTableArea = getTabletopCardsArea();

	//console.log('***updateTableCardCollections', msTableArea.id);
	for (const oid in collections) {
		if (nundef(G.table[oid])) continue; //vislleicht muss da tableUpdated verendet werden!!!
		let o = G.table[oid];
		for (const propName in o) {
			let colls = getCollections(oid, propName);
			if (nundef(colls)) continue;

			//console.log('player collections to update for',propName, plColls)
			for (const key in colls) {
				let coll = colls[key];
				if (!coll.tbd) continue;
				let idCollection = getCollectionArea(key, msTableArea);
				//console.log('collection area id', idCollection);
				showCollection(coll, idCollection);
				coll.tbd = null;
			}

		}
	}
}

function updateGameplayerCardCollections(pid, oPlayer) {

	let msPlayerArea = getPlayerArea(pid);

	//console.log('***updateGameplayerCardCollections', 'pid', pid, 'oPlayer', oPlayer, 'player area id', msPlayerArea.id);
	for (const propName in oPlayer) {
		let plColls = getCollections(pid, propName);
		if (nundef(plColls)) continue;

		//console.log('player collections to update for',propName, plColls)
		for (const key in plColls) {
			let coll = plColls[key];
			if (!coll.tbd) continue;
			let idCollection = getCollectionArea(key, msPlayerArea);
			//console.log('collection area id', idCollection);
			showCollection(coll, idCollection);
			coll.tbd = null;
		}

	}
}
function showPlayerHand(oid, propName, cardFunc, areaName) { showCollections(collections, oid, [propName], cardFunc, areaName); }
function showCollections(pool, oid, keys, cardFunc, areaName) {
	//assumes that areaName area exists!
	let propName = keys.shift();
	let collDict = getCollections(pool, oid, propName);
	if (nundef(collDict)) return;

	let msArea = getMainArea(areaName);

	if (!msArea) {
		//console.log('area', areaName, 'does NOT exist! CANNOT PRESENT CARDS!!!');
		return;
	}


	for (const key in collDict) {
		let coll = collDict[key];
		let idCollection = getCollectionArea(key, msArea);
		showCollection(coll, idCollection);
		//showPlayerHandNew(coll.name, coll.hand, key);
	}


	// //usage: showHand(idPlayer,'devcards',FUNCS.catan_card,'DevCards');
	// //wo wuerde ich cards finden?
	// //oid ist pid, propName ist hand property
	// //oHand ist selectionFunc(o) was ein problem ist, weil wie komm ich jetzt auf die collection?
	// //propName fehlt
	// //console.log('showPlayerHand',oid,propName,cardFunc, areaName)
	// let oHand = selectionFunc(o); //selection func should return hand object
	// let arr = getValueArray(oHand);
	// if (isEmpty(arr)) return;
	// //console.log('oHand',oHand);
	// for (const idCard of arr){

	// }
	// cardFunc(o);



}
function showCollection(coll, idCollection) {
	//console.log('***showCollection', coll);
	if (coll.tbd == 'add' || coll.tbd == 'update') {
		//console.log('collection', coll.key, 'has changed:', coll.arr);
		_clearHand(idCollection, 'hand');
		//let idHand = idArea;
		let msCollection = UIS[idCollection];
		let collectionAreaName = getAreaName(idCollection);
		//console.log('areaName for', idCollection, 'is', collectionAreaName, 'msHand', msCollection);
		//let els = coll.arr;
		let els = coll.type == '_obj' ? coll.arr.map(x => x._obj) : coll.arr;
		//console.log('collection elements', els, 'type', coll.type);
		if (coll.type == '_obj') {
			for (const oid of els) {
				//let id = getMainId(oid);
				//console.log('getMainId for',oid,':',id)
				//let elContent = coll.type == '_obj' ? coll.arr.map(x => x._obj) : coll.arr;
				let ms = getVisual(oid);//UIS[id];
				if (nundef(ms)) {
					//console.log('making card for:',oid,idHand);
					ms = makeCard(oid, G.table[oid], idCollection);
					//console.log('created card:', oid, ms.id, collectionAreaName);

				}
				if (!_isInHand(oid, idCollection)) {
					//console.log('not in hand:',oid,idHand)
					//alert('SHOULD ALREADY HAVE BEEN ADED!!!!!!!!!!!!!'+oid)
					addCardToCollectionArea(oid, idCollection);
				}
			}
			repositionCards(msCollection);
		}
	}

}
function addCardToCollectionArea(oid, collectionAreaName) {
	//idHand = isdef(idHand)?idHand:getMainId(areaName);
	//areaName = idHand[0]=='a'?idHand:getAreaName(idHand);
	let idCollection = getIdArea(collectionAreaName);
	let isCard = getMainId(oid);
	//console.log('....addCardToHand','oid',oid,'id',id,'areaName',areaName,'idHand',idHand);
	let msCard = UIS[isCard];
	let msCollection = UIS[idCollection];
	msCard.hand = idCollection;
	msCard.collectionKey = msCollection.collectionKey;
	if (nundef(msCollection.numCards)) {
		msCollection.numCards = 1;
		msCollection.dx = 0;
		msCollection.cards = [oid];
	} else {
		msCollection.numCards += 1;
		msCollection.cards.push(oid);
	}
	let n = msCollection.numCards;
	msCard.zIndex = n;
	//console.log('addCardToHand: isAttached=',ms.isAttached, 'hand.numCards',n);
	msCard.attach('hand');
	//console.log('...isAttached=',ms.isAttached)

	//calc card height
	let hCard = msCard.elem.offsetHeight;
	let bounds = getBounds(msCard.elem);
	let hCard1 = bounds.height;
	//console.log(hCard);
	//console.log('height of card: offsetHeight:',hCard,'bounds.height',hCard1)

	//calc hand height:
	let hHand = getBounds(msCollection.elem).height;
	let partHand = msCollection.parts['hand'];
	if (isdef(partHand)) hHand -= getBounds(partHand, true).y;
	//console.log('height of hand (part)',hHand);
	msCollection.hHand = hHand;

	//let hHand = bounds.height;// !!!!!
	//let hHand = hand.elem.offsetHeight;
	//console.log(hHand);
	let wCard = msCard.elem.offsetWidth;
	//console.log('w1',wCard);
	let scale = 1;
	if (hCard >= hHand) {
		scale = hHand / hCard;
		msCard.elem.style.transform = `scale(${scale})`;
		msCard.elem.style.transformOrigin = '0% 0%';
	}
	msCollection.scale = scale;

	wCard = msCard.elem.offsetWidth;
	//console.log('w2',wCard);
	let wReal = wCard * scale;
	let hReal = hCard * scale;
	msCollection.wCard = wReal;
	msCollection.hCard = hReal;


	repositionCards(msCollection);
}
function repositionCards(msCollection) {
	//console.log('hand',hand,'cards',hand.cards)
	if (msCollection.numCards == 0) return;
	// let el = hand.elem;
	//console.log(msHand)



	let dTitle = msCollection.parts.title;
	let dBody = msCollection.parts.hand;
	let dHand = msCollection.elem;
	let bTitle = getBounds(dTitle);
	let bBody = getBounds(dBody, true);
	let bHand = getBounds(dHand);
	let yBody = bTitle.height;
	let hHand = msCollection.hHand;
	let hAvailable = hHand - yBody;
	let wHand = bHand.width;
	//console.log('hHand',hHand,'wHand',wHand,'yBody',yBody,'hAvailable',hAvailable)

	let W = wHand;
	let H = hHand;
	// let W = msHand.w;
	// let H = msHand.H;
	let w = msCollection.wCard;
	let h = msCollection.hCard;
	let n = msCollection.numCards;
	//console.log('W',W,'H',H,'wCard',w,'hCard',h)

	let x, y, dx, padding;
	// let offset = isdef(msHand.cardOffsetXY) ? msHand.cardOffsetXY : { x: 0, y: 0 };
	let offset = { x: 0, y: 0 };
	if (msCollection.adjustSize) {
		//hand has not been given a specific width, so adjust width to content and parent!!!
		//same as height!!!
		W = w + (n) * w / 4;
		H = h; // + 20;
		padding = 0;//10;
		msCollection.setSize(W + 2 * padding + yBody, H); //w + n * w / 4 + 20, h + 20);
		//		dx = w / 4;
		x = padding + offset.x;
		y = padding + offset.y;

	} else {


		padding = x = y = 0;//x = 10;
		//y = 10;
	}
	dx = n > 1 ? (W - w) / (n - 1) : 0;
	if (dx > w) dx = w;
	// let ms=UIS[idHand];
	// ms.setSize(300,140);

	// if (nundef(W)||nundef(H)){
	// 	dx=w/4;
	// }else{
	// 	dx = n > 1 ? (W - w) / (n - 1) : 0;
	// } 
	let i = 0;
	//console.log('---', 'W', W, 'H', H, 'w', w, 'h', h, 'n', n, 'padding', padding, 'x', x, 'y', y, 'dx', dx)
	for (const oidCard of msCollection.cards) {
		let id = getMainId(oidCard);
		let c = UIS[id];
		c.zIndex = c.elem.style.zIndex = i;
		i += 1;
		c.setPos(x, y);
		x += dx;

	}
}








function getTabletopCardsArea() {
	let msTable = getMainArea(defaultTabletopCardsAreaName);
	if (!msTable) { msTable = _makeTabletopCardsArea('a_d_game'); }
	return msTable;
}
function getPlayerArea(pid) {
	let areaName = defaultGameplayerAreaName + '_' + pid;
	let msPlayer = getMainArea(areaName);
	if (!msPlayer) { msPlayer = _makeGameplayerArea(areaName, 'a_d_game'); }
	return msPlayer;
}



