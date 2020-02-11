function updateTableCardCollections(oid){

	if (nundef(collections[oid])) return;
	let msArea = getTabletopCardsArea();
	//console.log(msArea);
	if (isEmpty(collections)){
		//console.log('no table card collections!');
		return;
	}
	for (const propName of G.tableUpdated[oid].summary) {
		//console.log(propName, 'has changed!');
		let o = G.table[propName];
		//console.log('player.'+propName,o)
		let plColl = getTableCollections(oid,propName);
		//console.log(plColl)
		if (isdef(plColl)) {
			for (const key in plColl) {
				let ha = plColl[key];
				let idCollection = getCollectionArea(key, msArea);
				//let divHand = UIS[idCollection].elem;
				//divHand.style.position = null;
				//getSimpleSetElements(ha.hand)
				//ha.hand = {_set:ha.hand};
				showPlayerHandNew(ha.name, ha.arr, key);
			}
		}
	}

}
function updateTableCardCollections_COPY(oid){

	if (nundef(collections[oid])) return;
	let msArea = getTabletopCardsArea();
	//console.log(msArea);
	if (isEmpty(collections)){
		//console.log('no table card collections!');
		return;
	}
	for (const propName of G.tableUpdated[oid].summary) {
		//console.log(propName, 'has changed!');
		let o = G.table[propName];
		//console.log('player.'+propName,o)
		let plColl = getTableCollections(oid,propName);
		//console.log(plColl)
		if (isdef(plColl)) {
			for (const key in plColl) {
				let ha = plColl[key];
				let idCollection = getCollectionArea(key, msArea);
				let divHand = UIS[idCollection].elem;
				divHand.style.position = null;
				getSimpleSetElements(ha.hand)
				//ha.hand = {_set:ha.hand};
				showPlayerHandNew(ha.name, ha.arr, key);
			}
		}
	}

}
function showHands(oid,propList,cardFunc,areaName){

}

function _showHand(oids, idArea) {
	let idHand = idArea;
	let hand = UIS[idArea];
	let areaName = getAreaName(idArea);
	// //console.log('areaName for',idArea,'is',areaName,'(_showHand)');
	// //console.log('_showHand',oids,hand)
	for (const oid of oids) {
		//let id = getMainId(oid);
		//console.log('getMainId for',oid,':',id)
		let ms = getVisual(oid);//UIS[id];
		if (nundef(ms)) {
			//console.log('making card for:',oid,idHand);
			ms = makeCard(oid, G.table[oid], idHand);
			//console.log('created card:',oid,ms.id,areaName);

		}
		if (!_isInHand(oid, idHand)) {
			//console.log('not in hand:',oid,idHand)
			//alert('SHOULD ALREADY HAVE BEEN ADED!!!!!!!!!!!!!'+oid)
			addCardToHand(oid, idArea);
		}
	}
}






//#region ok
const defaultGameplayerAreaName = 'gameplayerArea';
const defaultTabletopCardsAreaName = 'tabletopCardsArea';
const defaultDeckAreaName = 'deckArea';
function isCardSet(o) {
	if (nundef(o)) return false;
	if (nundef(o._set)) return false;
	let arr = o._set;
	if (!isList(arr)) return false;
	for (const el of arr) {
		if (nundef(el)) return false;
		if (nundef(el._obj)) return false;
		let card = G.table[el._obj];
		if (nundef(card) || card.generic_type != 'card') return false;
	}
	return true;
}
function detectDecks(tableObjects, areaName) {
	//look for table objects that are decks
	let deckKeys = allCondDict(tableObjects, x => isDeckObject(x)); if (isEmpty(deckKeys)) return null;
	//if got decks, make a deck area
	S.settings.hasCards = true;
	let deckArea = makeDeckArea(areaName, deckKeys.length); //areaName = deckArea.id;
	//create deck uis
	let msDecks = deckKeys.map(x => makeDeckSuccess(x, tableObjects[x], deckArea.id));
	// line up in deck area
	lineupDecks(msDecks, deckArea);

	return deckKeys;
}
function lineupDecks(msDecks, deckArea) {
	let x = 0;
	let ysign = 1;
	let yfactor = 0;
	let yheight = 140;
	let y = yfactor * yheight * ysign;
	let areaCenter = { x: deckArea.w / 2, y: deckArea.h / 2 };
	let topLeftOffset = { x: areaCenter.x - 78 / 2, y: areaCenter.y - 110 / 2 };
	//topLeftOffset = areaCenter;
	for (const ms of msDecks) {
		//position decks relative to center of deck area
		ms.attach();
		ms.setPos(x + topLeftOffset.x, y + topLeftOffset.y);
		if (ysign > 0) { yfactor += 1; }
		ysign = -ysign;
		y = yfactor * yheight * ysign;
	}
}
function makeDeckSuccess(oid, o, areaName) {
	let id = 'm_t_' + oid; //oid;
	if (isdef(UIS[id])) { error('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }

	let ms = new RSG();
	ms.id = id;
	ms.oid = oid;
	ms.o = o;
	ms.isa.deck = true;

	ms.elem = document.createElement('div');
	ms.elem.id = id;
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(ms.elem);
	ms.cat = DOMCATS[ms.domType];
	ms.idParent = areaName;
	UIS[areaName].children.push(id);
	//console.log('******** vor link', id, oid)
	listKey(IdOwner, id[2], id);
	linkObjects(id, oid);
	UIS[id] = ms;

	ms.elem.classList.add('deckBase');
	//ms.elem.style.backgroundColor = 'yellow';

	// timit.showTime('vor makeStapel!');
	let num = o.deck_count == 0 ? 0 : o.deck_count / 2 + 1;
	let topmost = makeStapel(ms.elem, num); //o.deck_count/4+1); //Math.min(25,o.deck_count)); //300);
	ms.topmost = topmost;
	if (topmost != ms.elem) ms.parts['topmost'] = topmost;
	//console.log('topmost', topmost);
	//console.log(ms);
	// timit.showTime('nach makeStapel!')

	return ms;

}
function makeStapel(elem, n) {
	let parent = elem;
	for (let i = 1; i <= n; i++) {
		let dummy = document.createElement('div');
		elem.appendChild(dummy);
		dummy.classList.add('cardBack');
		elem = dummy;
	}
	return elem;
}
function makeDeckArea(areaName, numDecks) {
	//make a deck area to represent decks
	let parentOfDeckArea = UIS[areaName];
	let deckHeight = 140;
	let deckHeightNeeded = numDecks * deckHeight;
	//console.log(deckHeightNeeded, parentOfDeckArea.h)
	if (deckHeightNeeded > parentOfDeckArea.h) setAreaHeight(areaName, deckHeightNeeded);
	else deckHeightNeeded = parentOfDeckArea.h;

	//width 
	//width of area should be able to hold max num of top_cards of deck (next)
	//leave for now

	let deckAreaName = 'deckArea';
	let ms = makeArea(deckAreaName, areaName);
	ms.setBg('seagreen');
	ms.setBounds(0, 0, 200, deckHeightNeeded, 'px');
	return ms;
}
//TODO: present a deck found in table
//TODO: remove cards from a deck
//TODO: extended presentation of top_cards (overlapping)
//#endregion

//#region API: catan cards!
function addCardToHand(oid, areaName) {
	//idHand = isdef(idHand)?idHand:getMainId(areaName);
	//areaName = idHand[0]=='a'?idHand:getAreaName(idHand);
	let idHandMS = getIdArea(areaName);
	let idCardMS = getMainId(oid);
	//console.log('....addCardToHand','oid',oid,'id',id,'areaName',areaName,'idHand',idHand);
	let ms = UIS[idCardMS];
	let msHand = UIS[idHandMS];
	ms.hand = idHandMS;
	if (nundef(msHand.numCards)) {
		msHand.numCards = 1;
		msHand.dx = 0;
		msHand.cards = [oid];
	} else {
		msHand.numCards += 1;
		msHand.cards.push(oid);
	}
	let n = msHand.numCards;
	ms.zIndex = n;
	//console.log('addCardToHand: isAttached=',ms.isAttached, 'hand.numCards',n);
	ms.attach('hand');
	//console.log('...isAttached=',ms.isAttached)

	//calc card height
	let hCard = ms.elem.offsetHeight;
	let bounds = getBounds(ms.elem);
	let hCard1 = bounds.height;
	//console.log(hCard);
	//console.log('height of card: offsetHeight:',hCard,'bounds.height',hCard1)

	//calc hand height:
	let hHand = getBounds(msHand.elem).height;
	let partHand = msHand.parts['hand'];
	if (isdef(partHand)) hHand -= getBounds(partHand, true).y;
	//console.log('height of hand (part)',hHand);
	msHand.hHand = hHand;

	//let hHand = bounds.height;// !!!!!
	//let hHand = hand.elem.offsetHeight;
	//console.log(hHand);
	let wCard = ms.elem.offsetWidth;
	//console.log('w1',wCard);
	let scale = 1;
	if (hCard >= hHand) {
		scale = hHand / hCard;
		ms.elem.style.transform = `scale(${scale})`;
		ms.elem.style.transformOrigin = '0% 0%';
	}
	msHand.scale = scale;

	wCard = ms.elem.offsetWidth;
	//console.log('w2',wCard);
	let wReal = wCard * scale;
	let hReal = hCard * scale;
	msHand.wCard = wReal;
	msHand.hCard = hReal;


	_repositionCards(msHand);
}
function removeCardFromHand(oid, hand, subArea) {
	//console.log('removeCardFromHand', oid)
	let id = getMainId(oid);
	if (isdef(id)) {
		//id could be null if card has already been deleted, in that case, no need to detach!
		//console.log(id);
		let ms = UIS[id];
		//console.log(ms);
		ms.detach();
		ms.hand = null; //idParent is still same!
	}
	if (nundef(hand)) return;
	//console.log('hand before removing', hand.cards.toString());

	removeInPlace(hand.cards, oid);
	hand.numCards = hand.cards.length;

	_repositionCards(hand, subArea);

	//console.log('hand after removing', hand.cards.toString());
}
function showPlayerHandNew(name, cardArr, areaName) {
	//console.log(getFunctionCallerName())
	//showPlayerHandNew(ha.name,ha.hand, getAreaName(idHand));	

	//let oPlayer = G.playersAugmented[plid];
	//let oCards = hand;
	if (isSet(cardArr)) cardArr = cardArr._set;
	//now oCards should be a list!

	//console.log(oCards)

	if (!isListOfLiterals(cardArr)) { alert('wrong format of cards property: ' + propName); }
	let oids = cardArr.map(x => isdef(x._obj)? x._obj:x);
	let idHand = getIdArea(areaName);
	//console.log('showPlayerHand: idArea for',areaName,'is',idHand)
	if (_handChanged(oids, idHand)) {
		//console.log('hand of',plid,'has changed:',ids)
		_clearHand(idHand, 'hand');
		_showHand(oids, idHand, 'hand');
	}

}
function showPlayerHand_dep(plid, propName, areaName) {
	//console.log(getFunctionCallerName())

	let oPlayer = G.playersAugmented[plid];
	let oCards = oPlayer[propName];
	if (isSet(oCards)) oCards = oCards._set;
	//now oCards should be a list!

	//console.log(oCards)

	if (!isListOfLiterals(oCards)) { alert('wrong format of cards property: ' + propName); }
	let oids = oCards.map(x => x._obj);
	let idHand = getIdArea(areaName);
	//console.log('showPlayerHand: idArea for',areaName,'is',idHand)
	if (_handChanged(oids, idHand)) {
		//console.log('hand of',plid,'has changed:',ids)
		_clearHand(idHand);
		_showHand(oids, idHand);
	}

}

function makeFakeCards(gpl) {
	// let pid = G.player;
	// let gpl = G.playersAugmented[G.player];
	//first 
	//first check if player has any kind of object that has changed and is a set of cards
	//console.log('updating gameplayer hands!!!!!!!', pid, G.player)

	//test ob tatsaechlich alle buildings findet!
	//let handDummy = jsCopy(gpl['hand']);
	//gpl['buildings']={farms:[handDummy,jsCopy(handDummy)],estates:[jsCopy(handDummy)]};
	let ids = _getAllCardsIdsFromTable();
	let idsHand = gpl.hand._set.map(x => x._obj);
	//console.log('ids',ids,'hand ids:',idsHand);
	let restIds = arrMinus(ids, idsHand);
	//console.log('restIds',restIds);
	let i = Math.floor(restIds.length / 2);
	let f1 = { _set: [] };
	for (let n = 0; n < i; n++) {
		f1._set.push({ _obj: restIds[n] });
	}
	let f2 = { _set: [] };
	//console.log('restIds',restIds);
	for (let n = i; n < restIds.length; n++) {
		f2._set.push({ _obj: restIds[n] });
		//console.log(i,n,restIds[n]);
	}
	//console.log('farms',f1,f2);
	//console.log('buildings',gpl.buildings)
	gpl.buildings.farm = [f1, f2];// {_set:[f1,f2]};
	//console.log('buildings',gpl.buildings)
}



function _getAllCardsIdsFromTable() {
	let res = [];
	let t = G.table;
	for (const k in t) {
		let cand = t[k];
		let isCard = cand.generic_type == 'card';
		if (isCard) res.push(k)
		//console.log(':::',cand);
	}
	return res;
}
function _makeTabletopCardsArea(areaName){
	let deckArea = getMainArea(defaultDeckAreaName);
	//console.log('deckArea', deckArea)
	let parentArea = UIS[areaName];
	if (isdef(deckArea)) {
		let x = deckArea.w;
		let h = parentArea.h / 2;
		let y = 0;
		let w = parentArea.w - deckArea.w;
		let id = 'tabletopCardsArea';
		let ms = makeArea(id, areaName);
		ms.setBg('seagreen');
		ms.setBounds(x, y, w, h, 'px');
		ms.nextCoords = { x: 0, y: 0 };
		ms.elem.classList.add('flexWrap');
		return ms;

	}

}
function _makeGameplayerArea(plAreaName,areaName) {

	let deckArea = getMainArea(defaultDeckAreaName);
	//console.log('deckArea', deckArea)
	let parentArea = UIS[areaName];
	if (isdef(deckArea)) {
		let x = deckArea.w;
		let h = parentArea.h / 2;
		let y = h;
		let w = parentArea.w - deckArea.w;
		let ms = makeArea(plAreaName, areaName);
		ms.setBg('seagreen');
		ms.setBounds(x, y, w, h, 'px');
		ms.nextCoords = { x: 0, y: 0 };
		ms.elem.classList.add('flexWrap');
		return ms;

	}

}
function _makeHandArea(key, handAreaName, parentAreaId) {
	//eine handArea is ein horizontal streifen, height=110px, w=parent area width, x=0, y=::how many handareas are in this area?
	//um y festzustellen, muss ich sehen ob derselbe player schon 
	//eigentlich sollt ich es machen wie in dem objects flexgrid!!!!!!!!
	//>>schau wie ich es da gemacht habe!!!!
	/*
	ideal code:

	*/
	let parentArea = UIS[parentAreaId];
	if (isdef(parentArea)) {
		//let h = 300;
		//let w=parentArea.w;
		let ms = makeArea(handAreaName, parentAreaId);
		ms.setBg(randomColor());
		//ms.setHeight(h);
		ms.title(stringAfter(key,'.'));
		let bTitle = getBounds(ms.parts.title);
		//console.log('---------title bounds:',bTitle); //getBounds(ms.parts.title));
		//ms.cardOffsetXY = { x: 0, y: 35 };
		ms.parts['title'].fontSize = '12px';
		ms.elem.style.minWidth = bTitle.width + 'px'; //'90px';
		ms.elem.style.minHeight = '160px';
		ms.body('hand');//,'red');
		let div = ms.parts['hand'];
		div.style.position = 'relative';
		div.style.left = '10px';
		div.style.top = '10px';
		div.style.width = 'auto';
		div.style.height = 'auto';

		return ms;

	}

}
function _repositionCards(msHand) {
	//console.log('hand',hand,'cards',hand.cards)
	if (msHand.numCards == 0) return;
	// let el = hand.elem;
	//console.log(msHand)



	let dTitle = msHand.parts.title;
	let dBody = msHand.parts.hand;
	let dHand = msHand.elem;
	let bTitle = getBounds(dTitle);
	let bBody = getBounds(dBody, true);
	let bHand = getBounds(dHand);
	let yBody = bTitle.height;
	let hHand = msHand.hHand;
	let hAvailable = hHand - yBody;
	let wHand = bHand.width;
	//console.log('hHand',hHand,'wHand',wHand,'yBody',yBody,'hAvailable',hAvailable)

	let W = wHand;
	let H = hHand;
	// let W = msHand.w;
	// let H = msHand.H;
	let w = msHand.wCard;
	let h = msHand.hCard;
	let n = msHand.numCards;
	//console.log('W',W,'H',H,'wCard',w,'hCard',h)

	let x, y, dx, padding;
	// let offset = isdef(msHand.cardOffsetXY) ? msHand.cardOffsetXY : { x: 0, y: 0 };
	let offset = { x: 0, y: 0 };
	if (msHand.adjustSize) {
		//hand has not been given a specific width, so adjust width to content and parent!!!
		//same as height!!!
		W = w + (n) * w / 4;
		H = h; // + 20;
		padding = 0;//10;
		msHand.setSize(W + 2 * padding + yBody, H); //w + n * w / 4 + 20, h + 20);
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
	for (const oidCard of msHand.cards) {
		let id = getMainId(oidCard);
		let c = UIS[id];
		c.zIndex = c.elem.style.zIndex = i;
		i += 1;
		c.setPos(x, y);
		x += dx;

	}
}



//#region helpers
//das muss eigentlich in catan_ui.js!!!!!!! oder mindestens in userspec!!!!
var symbols = {
	knight: 'user-secret',
	victory_point: 'trophy',
	road_building: 'road',
	monopoly: 'umbrella',
	year_of_plenty: 'tree',
};
var symbolColors = {
	knight: 'red',
	victory_point: 'gold',
	road_building: 'dimgray',
	monopoly: 'violet',
	year_of_plenty: 'green',
};
function detectSymbolKey(o) {
	if (isdef(o.name)) return o.name;
	let res = null;
	for (const k in o) {
		if (!isLiteral(o[k]) || k == 'obj_type') continue;
		if (k.toLowerCase().includes('name') && isString(o[k])) return o[k];
	}
	let k = firstCondDict(o, x => isLiteral(o[k]));
	if (isdef(k)) return o[k];
}
function getMatchingPictoKey(o, key) {
	let sym = o.obj_type;
	if (sym in S.settings.symbols) { sym = S.settings.symbols[sym]; }
	if (!(sym in iconChars)) {
		//console.log("didn't find key", sym);
		symNew = Object.keys(iconChars)[randomNumber(5, 120)]; //abstract symbols
		//console.log('will rep', sym, 'by', symNew)
		S.settings.symbols[sym] = symNew;
		sym = symNew;
	}
}
function _getSymbolKey(name) { return name.replace(new RegExp(' ', 'g'), '_').toLowerCase(); }

function cards52GetRankFromName(name) {
	let rank;
	let n = firstNumber(name);
	if (isdef(n) && !isNaN(n)) rank = n;
	else {
		let ch = name.toLowerCase()[0];
		rank = ch == 'k' ? 13 : ch == 'q' ? 12 : 11;
	}
	return rank;
}
function setSide(cardDiv, newSide) {
	if (!cardDiv.isCard) return;
	let faceElem = cardDiv.faceElem;
	let backElem = cardDiv.backElem;
	if (newSide === 'front') {
		if (cardDiv.side === 'back') {
			cardDiv.removeChild(backElem);
		}
		cardDiv.side = 'front';
		cardDiv.appendChild(faceElem);
		cardDiv.setAttribute('class', 'cardMy ' + getSuitName(cardDiv.suit) + ' rank' + cardDiv.rank);
	} else {
		if (cardDiv.side === 'front') {
			cardDiv.removeChild(faceElem);
		}
		cardDiv.side = 'back';
		cardDiv.appendChild(backElem);
		cardDiv.setAttribute('class', 'cardMy');
	}
}
function getSuitName(suit) {
	// return suit name from suit value
	return suit === 0 ? 'spades' : suit === 1 ? 'hearts' : suit === 2 ? 'clubs' : suit === 3 ? 'diamonds' : 'joker';
}

function _makeCardDivAristocracy(oid, o) {
	let elem = document.createElement('div');
	let faceElem = document.createElement('div');
	let backElem = document.createElement('div');

	// add classes
	faceElem.classList.add('face');
	backElem.classList.add('back');
	//rank and suit

	let cardName = isdef(o.name) ? o.name : 'King';
	let rank = cards52GetRankFromName(cardName); //i % 13 + 1;
	let suit = 0; //i / 13 | 0;
	//console.log('card', oid, o.name, 'rank', rank, 'suit', suit);
	//elem.setAttribute('class', 'cardMy ' + getSuitName(suit) + ' rank' + rank);


	elem.faceElem = faceElem;
	elem.backElem = backElem;
	elem.isCard = true;
	elem.suit = suit;
	elem.rank = rank;
	// elem.style.position = 'absolute';
	// let dx = 0;
	// elem.style.left = '' + dx + 'px';
	// elem.style.width='100px';
	// elem.style.height='200px';
	// elem.style.top = '0px';

	setSide(elem, 'front');

	//console.log(elem)
	return elem; // {elem:elem,faceEleme:faceElem,backElem:backElem};
}

function _makeCardDivDefault(oid, o) {
	//how to make a regular card?
	//schau auch zu detectColor
	//schau auch zu get
	let symbolKeyPropName = 'name'; //detectSymbolKey(o);
	let key = _getSymbolKey(o[symbolKeyPropName]); //replaceAll(o[symbolKeyPropName],' ','_').toLowerCase(); //_getSymbolKey(o[symbolKeyPropName]);
	let symbol = symbols[key]; //getMatchingPictoKey(o,key); //symbols[key]; //sollte sein: getPictoChar
	let color = symbolColors[key]; //detectColor(o,key); // //sollte sein: detectColor
	//console.log('_makeCardDivDefault', 'prop', symbolKeyPropName, 'key', key, 'icon', symbol, 'color', color);

	let d = document.createElement('div');
	$(d).on("mouseenter", function () { magnifyFront(this.id); });// bringCardToFront(this.id); }); //this.parentNode.appendChild(this);})
	$(d).on("mouseleave", function () { minifyBack(this.id); });// { sendCardToBack(this.id); })
	//$(d).on("click", function () { removeCardFromHand(oid); })

	d.innerHTML = 'hallo';
	d.style.position = 'absolute';
	let dx = 0;
	d.style.left = '' + dx + 'px';
	// d.style.width='100px';
	// d.style.height='200px';
	d.style.top = '0px';
	//d.style.backgroundColor = randomColor();

	let ch = iconChars[symbol];
	let text = String.fromCharCode('0x' + ch);
	let family = (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';

	d.innerHTML = `
		<div class="cardCatan">
			<p style='font-size:22px;'>${o.name}</p>
			<div class="cardCenter">
				<div class="circular" style='background:${color}'><span style='color:white;font-size:70px;font-weight:900;font-family:${family}'>${text}</span></div>
			</div>
			<hr>
			<p style='font-size:20px;'>${o.desc}</p>
			<div style='color:${color};position:absolute;left:8px;top:8px;width:35px;height:35px'>
				<span style='font-family:${family}'>${text}</span>
			</div>
		</div>
	`;
	return d;
}
function _makeCardDivCatan(oid, o) {
	//how to make a regular card?
	//schau auch zu detectColor
	//schau auch zu get
	let symbolKeyPropName = 'name'; //detectSymbolKey(o);
	let key = _getSymbolKey(o[symbolKeyPropName]); //replaceAll(o[symbolKeyPropName],' ','_').toLowerCase(); //_getSymbolKey(o[symbolKeyPropName]);
	let symbol = symbols[key]; //getMatchingPictoKey(o,key); //symbols[key]; //sollte sein: getPictoChar
	let color = symbolColors[key]; //detectColor(o,key); // //sollte sein: detectColor
	//console.log('_makeCardDivCatan', 'prop', symbolKeyPropName, 'key', key, 'icon', symbol, 'color', color);

	let d = document.createElement('div');
	$(d).on("mouseenter", function () { magnifyFront(this.id); });// bringCardToFront(this.id); }); //this.parentNode.appendChild(this);})
	$(d).on("mouseleave", function () { minifyBack(this.id); });// { sendCardToBack(this.id); })
	//$(d).on("click", function () { removeCardFromHand(oid); })

	d.innerHTML = 'hallo';
	d.style.position = 'absolute';
	let dx = 0;
	d.style.left = '' + dx + 'px';
	// d.style.width='100px';
	// d.style.height='200px';
	d.style.top = '0px';
	//d.style.backgroundColor = randomColor();

	let ch = iconChars[symbol];
	let text = String.fromCharCode('0x' + ch);
	let family = (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';

	d.innerHTML = `
		<div class="cardCatan">
			<p style='font-size:22px;'>${o.name}</p>
			<div class="cardCenter">
				<div class="circular" style='background:${color}'><span style='color:white;font-size:70px;font-weight:900;font-family:${family}'>${text}</span></div>
			</div>
			<hr>
			<p style='font-size:20px;'>${o.desc}</p>
			<div style='color:${color};position:absolute;left:8px;top:8px;width:35px;height:35px'>
				<span style='font-family:${family}'>${text}</span>
			</div>
		</div>
	`;
	return d;
}
function magnifyFront(id) {
	//console.log('magnify!')
	let card = UIS[id];
	let hand = UIS[card.hand];

	if (hand.scale != 1) {
		card.setScale(1);
	}
	_bringCardToFront(id)

}
function minifyBack(id) {
	//console.log('minify!')
	let card = UIS[id];
	let hand = UIS[card.hand];
	if (hand.scale != 1) {
		card.setScale(hand.scale);
	}
	_sendCardToBack(id)

}
function _bringCardToFront(id) { let elem = document.getElementById(id); maxZIndex += 1; elem.style.zIndex = maxZIndex; }
function _sendCardToBack(id) { let c = UIS[id]; let elem = document.getElementById(id); elem.style.zIndex = c.zIndex; }
function _clearHand(idHand, subArea) {
	//console.log(getFunctionCallerName())

	let hand = UIS[idHand];
	if (hand.cards) {
		while (!isEmpty(hand.cards)) {
			//console.log(hand.cards.toString())
			removeCardFromHand(hand.cards[0], hand, subArea);
		}
	}
}
function _showHand(oids, idArea) {
	let idHand = idArea;
	let hand = UIS[idArea];
	let areaName = getAreaName(idArea);
	// //console.log('areaName for',idArea,'is',areaName,'(_showHand)');
	// //console.log('_showHand',oids,hand)
	for (const oid of oids) {
		//let id = getMainId(oid);
		//console.log('getMainId for',oid,':',id)
		let ms = getVisual(oid);//UIS[id];
		if (nundef(ms)) {
			//console.log('making card for:',oid,idHand);
			ms = makeCard(oid, G.table[oid], idHand);
			//console.log('created card:',oid,ms.id,areaName);

		}
		if (!_isInHand(oid, idHand)) {
			//console.log('not in hand:',oid,idHand)
			//alert('SHOULD ALREADY HAVE BEEN ADED!!!!!!!!!!!!!'+oid)
			addCardToHand(oid, idArea);
		}
	}
}
function _isInHand(oidCard, idHand) {
	let hand = UIS[idHand];
	let cards = hand.cards;
	//console.log('_isInHand',oidCard,idHand,cards)
	return isdef(cards) && cards.includes(oidCard);
}
function _handChanged(oids, area) {
	let idHand = area;
	let hand = UIS[idHand];
	if (nundef(hand)) return false;
	let cards = hand.cards;
	if (nundef(cards) && isEmpty(oids)) return false;
	if (isdef(hand) && isdef(hand.cards)) return !sameList(oids, hand.cards);
	else return true;
}























