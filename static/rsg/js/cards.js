function detectDecks(tableObjects, areaName) {
	//look for table objects that are decks
	let deckKeys = allCondDict(tableObjects, x => isDeckObject(x));	if (isEmpty(deckKeys)) return null;
	//if got decks, make a deck area
	let deckArea = makeDeckArea(areaName,deckKeys.length); //areaName = deckArea.id;
	//create deck uis
	let msDecks = deckKeys.map(x=>makeDeckSuccess(x,tableObjects[x],deckArea.id));
	
	// line up in deck area
	let x = 0;
	let ysign = 1;
	let yfactor = 0;
	let yheight = 140;
	let y = yfactor * yheight * ysign;
	let areaCenter = {x:deckArea.w/2,y:deckArea.h/2};
	let topLeftOffset = {x:areaCenter.x-78/2,y:areaCenter.y-110/2};
	//topLeftOffset = areaCenter;
	for(const ms of msDecks){
		//position decks relative to center of deck area
		ms.attach();
		ms.setPos(x+topLeftOffset.x,y+topLeftOffset.y);
		if (ysign > 0) { yfactor += 1; }
		ysign = -ysign;
		y = yfactor * yheight * ysign;
	}
	return deckKeys;
}
function makeDeckSuccess(oid,o,areaName){
	let id = 'm_t_' + oid; //oid;
	if (isdef(UIS[id])) { error('CANNOT create ' + id + ' TWICE!!!!!!!!!'); return; }

	let ms = new RSG();
	ms.id = id;
	ms.oid = oid;
	ms.o = o;
	ms.isa.deck = true;

	//let parent = 

	ms.elem = document.createElement('div');
	ms.elem.id = id;// getUID(); // id+'hallo';
	ms.parts.elem = ms.elem;
	ms.domType = getTypeOf(ms.elem);
	ms.cat = DOMCATS[ms.domType];
	ms.idParent = areaName;
	UIS[areaName].children.push(id);
	//console.log('******** vor link', id, oid)
	listKey(IdOwner, id[2], id);
	linkObjects(id, oid);
	UIS[id] = ms;

	//ms.setSize(78,110);
	//ms.setBg('red');
	// ms.elem.classList.add('cardTest')
	ms.elem.classList.add('deckBase');
	//ms.elem.style.backgroundColor = 'yellow';

	let topmost = makeStapel(ms.elem,Math.min(25,o.deck_count)); //300);
	ms.topmost = topmost;
	//console.log('zIndex',ms.elem.style.zIndex)

	//ms.addClass('cardBack')

	return ms;

}
function getDummy(i){
	let dummy=document.createElement('div');
	dummy.classList.add('cardBack');
	// dummy.style.backgroundColor = 'green'; //randomColor();
	// dummy.style.position = 'relative';
	// dummy.style.width = '100px';
	// dummy.style.height='100px';
	let gap = '-2px';//-1;
	// dummy.style.left=''+(gap*i)+'px';
	// dummy.style.top=''+(gap*i)+'px';
	dummy.style.left=gap; //''+(-gap)+'px';
	dummy.style.top=gap; //'-1px';
	//dummy.style.zIndex = 100+i*gap;
	return dummy;
}
function makeStapel(elem,n){
	//let dummy=getDummy(0);
	let parent=elem;
	for(let i=1;i<=n;i++){
		let dummy = getDummy(i);
		elem.appendChild(dummy);
		elem = dummy;
		// console.log(parent);
		// console.log(dummy);
		// parent.appendChild(dummy);
		// parent = dummy;
	}
	return elem;
}
function makeDeckArea(areaName,numDecks){
	//make a deck area to represent decks
	//TODO: table size should be adjusted to deck area needed height!
	let parentOfDeckArea = UIS[areaName];
	let deckHeight = 140;
	let deckNum = 7; //deckKeys.length
	let deckHeightNeeded = deckNum * deckHeight;
	//console.log(deckHeightNeeded, parentOfDeckArea.h)
	if (deckHeightNeeded > parentOfDeckArea.h) setAreaHeight(areaName, deckHeightNeeded);
	else deckHeightNeeded = parentOfDeckArea.h;

	//width 
	//width of area should be able to hold max num of top_cards of deck (next)
	//leave for now

	let deckAreaName = 'deckArea';
	let ms = makeArea(deckAreaName, areaName);
	ms.setBg('blue');
	ms.setBounds(0, 0, 200, deckHeightNeeded, 'px');
	return ms;
}






//#region deck presentation
function centerDeck(ms) {
	let parent = UIS[ms.idParent];
	if (parent) {
		let d = ms.elem;
		let wParent = parent.offsetWidth;
		let wElem = ms.deck.cards.length > 0 ? ms.deck.cards[0].elem.offsetWidth : 78; //this.elem.offsetWidth;
		let hParent = parent.offsetHeight;
		let hElem = ms.deck.cards.length > 0 ? ms.deck.cards[0].elem.offsetHeight : 110; //this.elem.offsetHeight;
		//console.log(wParent, wElem, hParent, hElem);
		d.style.position = 'relative';
		ms.centerX = (wParent - wElem) / 2;
		ms.centerY = (hParent - hElem) / 2;
		ms.w = wElem;
		ms.h = hElem;
		d.style.left = '' + ms.centerX + 'px';
		d.style.top = '' + ms.centerY + 'px';
	}
}
function setDeckPos(ms,x, y) {
	ms.elem.style.left = '' + (ms.centerX + x) + 'px';
	ms.elem.style.top = '' + (ms.centerY + y) + 'px';
}


function detectDecks_dep(tableObjects, areaName) {
	let deckKeys = allCondDict(tableObjects, x => isDeckObject(x));
	//console.log('table', tableObjects)
	//console.log('decks', deckKeys, tableObjects[deckKeys])

	if (isEmpty(deckKeys)) return null;

	//console.log('decks', deckKeys.map(x => tableObjects[x]));

	//make a deck area to represent decks
	//TODO: table size should be adjusted to deck area needed height!
	let parentOfDeckArea = UIS[areaName];
	let deckHeight = 140;
	let deckNum = 7; //deckKeys.length
	let deckHeightNeeded = deckNum * deckHeight;
	//console.log(deckHeightNeeded, parentOfDeckArea.h)
	if (deckHeightNeeded > parentOfDeckArea.h) setAreaHeight(areaName, deckHeightNeeded);
	else deckHeightNeeded = parentOfDeckArea.h;

	//width 
	//width of area should be able to hold max num of top_cards of deck (next)
	//leave for now

	let deckAreaName = 'deckArea';
	let ms = makeArea(deckAreaName, areaName);
	ms.setBg('blue');
	ms.setBounds(0, 0, 200, deckHeightNeeded, 'px');
	areaName = ms.id;

	let parent = UIS[areaName];
	let div1 = parent.elem;
	//div1.style.display='flex'

	let x,y;
	for (const deckKey of deckKeys){ //[0, 1, 2, 3, 4, 5, 6]) { //deckKeys) {
		let numCards = randomNumber(10, 50);// o.deck_count;
		let deck1 = makeDeck({ kind: 'deck52', N: numCards });
		//console.log('deck',deck1)

		//old code:
		// let ms1 = new DeckMS(getUID(),deck1);
		// ms1.attachTo(div1);
		// ms1.setPos(x, y);

		//new code:
		//let n=Number(deckKey);
		//let k = isdef(n)?''+(n+1):deckKey;
		let k=deckKey;
		let ms1 = makeDeckMS(k,tableObjects[deckKey], deck1, areaName, x, y); // tableObjects, areaName);
		console.log(k,typeof k,oid2ids[k],oid2ids['0'])
		console.log('check',k,mainVisualExists(k))
		// if (k=='0'){
		// 	console.log(ms1)
		// 	console.log(UIS);
		// 	throw new Exception();
		// }
	}
	return deckKeys;
}

function showDecks(){
	console.log('show decks!!!!!')
	let deckKeys=['0','1'];
	let x = 0;
	let ysign = 1;
	let yfactor = 0;
	let yheight = 140;
	let y = yfactor * yheight * ysign;
	for (const deckKey of deckKeys){ //[0, 1, 2, 3, 4, 5, 6]) { //deckKeys) {
		let ms = UIS['m_t_'+deckKey];

		console.log(ms.elem)
		ms.deck.mount(ms.elem);

		console.log(ms,x,y)
		ms.attach();

		ms.centerInDiv();
		ms.setPos(x, y);


		if (ysign > 0) { yfactor += 1; }
		ysign = -ysign;
		y = yfactor * yheight * ysign;

		//console.log(deckKey, div1, deck1, ms1); //, odeck);
	}

}
//#endregion

//#region API
function addCardToHand(oid, areaName) {
	//idHand = isdef(idHand)?idHand:getMainId(areaName);
	//areaName = idHand[0]=='a'?idHand:getAreaName(idHand);
	let idHand = getIdArea(areaName);
	id = getMainId(oid);
	//console.log('....addCardToHand','oid',oid,'id',id,'areaName',areaName,'idHand',idHand);
	let ms = UIS[id];
	let hand = UIS[idHand];
	ms.hand = idHand;
	if (nundef(hand.numCards)) {
		hand.numCards = 1;
		hand.dx = 0;
		hand.cards = [oid];
	} else {
		hand.numCards += 1;
		hand.cards.push(oid);
	}
	let n = hand.numCards;
	ms.zIndex = n;
	//console.log('addCardToHand: isAttached=',ms.isAttached, 'hand.numCards',n);
	ms.attach();
	//console.log('...isAttached=',ms.isAttached)

	//calc card height
	let hCard = ms.elem.offsetHeight;
	//console.log(hCard);
	let hHand = 200;// !!!!!
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
	hand.scale = scale;

	wCard = ms.elem.offsetWidth;
	//console.log('w2',wCard);
	let wReal = wCard * scale;
	let hReal = hCard * scale;
	hand.wCard = wReal;
	hand.hCard = hReal;

	_repositionCards(hand);
}
function removeCardFromHand(oid, hand) {
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

	_repositionCards(hand);

	//console.log('hand after removing', hand.cards.toString());
}
function showPlayerHand(plid, propName, areaName) {
	//console.log(getFunctionCallerName())

	let oPlayer = G.playersAugmented[plid];
	let oCards = oPlayer[propName];
	if (isSet(oCards)) oCards = oCards._set;
	//now oCards should be a list!
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

//#region helpers
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
function _makeCardDiv(oid, o) {
	let key = _getSymbolKey(o.name);
	let symbol = symbols[key];
	let color = symbolColors[key];
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
function _repositionCards(hand) {
	if (hand.numCards == 0) return;
	let el = hand.elem;
	let W = hand.w;
	let H = hand.H;
	let w = hand.wCard;
	let h = hand.hCard;
	let n = hand.numCards;
	let dx = n > 1 ? (W - w) / (n - 1) : 0;
	if (dx > w) dx = w;
	let x = 0;
	let y = 0;
	let i = 0;
	for (const oidCard of hand.cards) {
		let id = getMainId(oidCard);
		let c = UIS[id];
		c.zIndex = c.elem.style.zIndex = i;
		i += 1;
		c.setPos(x, y);
		x += dx;
	}
}
function _clearHand(idArea) {
	//console.log(getFunctionCallerName())

	let hand = UIS[idArea];
	if (hand.cards) {
		while (!isEmpty(hand.cards)) {
			//console.log(hand.cards.toString())
			removeCardFromHand(hand.cards[0], hand);
		}
	}
}
function _showHand(oids, idArea) {
	let idHand = idArea;
	let hand = UIS[idArea];
	let areaName = getAreaName(idArea);
	//console.log('areaName for',idArea,'is',areaName,'(_showHand)');
	//console.log('_showHand',oids,hand)
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
function _getSymbolKey(name) { return name.replace(new RegExp(' ', 'g'), '_').toLowerCase(); }






















