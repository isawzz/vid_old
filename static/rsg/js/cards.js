//#region deck presentation
function detectDeck(tableObjects,areaName){
	let deck = firstCondDict(tableObjects,x=>isDeckObject(x));
	if (nundef(deck)) return;
	console.log('deck',tableObjects[deck]);

	//show a deck w/ count cards (dummy!)
	let odeck=tableObjects[deck];
	let numCards = odeck.count;

	let div1 = UIS[areaName].elem;
	var deck1 = makeDeck({ kind: 'deck52', N: numCards });
	//deck1.cards.forEach(function (card, i) { card.enableDragging(); card.enableFlipping(); });

	//was ich jetzt brauche ist dass die oberste card vom deck interactive ist
	//muesste aus dem ganzen deck object ein ms object machen!
	// vielleicht mit deck1.elem als elem
	// wo hab ich die ms objects gemacht?

	let ms1 = new DeckMS('deck1', deck1);
	ms1.attachTo(div1);

	console.log(div1,deck1,ms1)
	
}




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






















