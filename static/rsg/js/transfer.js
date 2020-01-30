var elements = {}; //global element collection for resize event
function registerElement(ms) {
	//console.log(ms);
	elements[ms.id] = ms;
}
class DeckMS {
	constructor(oid, o) {
		this.o = o;
		this.oid = this.id = oid;
		this.elem = document.createElement('div');
		this.elem.id = oid;
		o.mount(this.elem);
		registerElement(this);
	}
	detach() {
		if (this.parent) {
			// remove from last parent!
			this.parent.removeChild(this.elem);
			this.parent = null;
		}
	}
	attachTo(div, {placeInCenter=true}={}) {
		this.detach();
		this.parent = div;
		div.appendChild(this.elem);
		if (placeInCenter) this.center();
	}
	center() {
		if (this.parent) {
			let d = this.elem;
			let wParent = this.parent.offsetWidth;
			let wElem = this.o.cards.length>0? this.o.cards[0].elem.offsetWidth:78; //this.elem.offsetWidth;
			let hParent = this.parent.offsetHeight;
			let hElem = this.o.cards.length>0? this.o.cards[0].elem.offsetHeight : 110; //this.elem.offsetHeight;
			//console.log(wParent, wElem, hParent, hElem);
			d.style.position = 'relative';
			this.centerX = (wParent - wElem) / 2;
			this.centerY = (hParent - hElem) / 2;
			this.w = wElem;
			this.h = hElem;
			d.style.left = '' + this.centerX + 'px';
			d.style.top = '' + this.centerY + 'px';
		}
	}
	setPos(x, y) {
		this.elem.style.left = '' + (this.centerX + x) + 'px';
		this.elem.style.top = '' + (this.centerY + y) + 'px';
	}
}

function addDeckTo(deck, domel, id, flip = false, drag = false) {
	if (nundef(id)) id = getUID();
	clearElement(domel);
	let ms = new DeckMS(id, deck);
	ms.attachTo(domel);
	if (flip) enableFlipForDeck(ms.o);
	if (drag) enableDragForDeck(ms.o);
	return ms;
}
function addGridTo(d, rows, cols, gap = '2px') {
	console.log(d, rows, cols, gap);
	//need to have defined css vars and grid-item class!!! >>needs my.css!!!
	//see my.css
	d.classList.add('gridContainer'); // see _lib/css/my.css
	d.style.setProperty('--grid-rows', rows);
	d.style.setProperty('--grid-cols', cols);
	d.style.setProperty('--grid-gap', gap);
	let cells = [];
	for (let r = 0; r < rows; r++) {
		cells[r] = [];
		for (let c = 0; c < cols; c++) {
			let cell = document.createElement("div");
			console.log(cell)
			cell.innerText = (r + ',' + c);
			d.appendChild(cell).className = "grid-item";
			cells[r].push(cell);

		}
	}
	return cells;
}
function enableFlipForDeck(d) {
	d.cards.forEach(function (card, i) {
		card.enableFlipping();
	});
}
function enableDragForDeck(d) {
	d.cards.forEach(function (card, i) {
		card.enableDragging();

	});
}
function makeUnitString(nOrString, unit = 'px', defaultVal = '100%') {
	if (nundef(nOrString)) return defaultVal;
	if (isNumber(nOrString)) nOrString = '' + nOrString + unit;
	return nOrString;
}
function makeDeck({ kind, N, nJokers, fPrep, fDraw, bDraw, x, y, w, h } = {}) {
	if (nundef(kind)) kind = 'deck52';
	let params = {
		kind: kind,
		fPrepFace: isdef(fPrep) ? fPrep : window[kind + 'Prep'],
		fUpdateFace: isdef(fDraw) ? fDraw : window[kind + 'Update'],
		fPrepBack: isdef(bDraw) ? bDraw : window[kind + 'Back'],
		fUpdateBack: isdef(bDraw) ? bDraw : window[kind + 'Back'],
		size: { w: 78, h: 110 },
		orientation: 'portrait',
		repeat: 1,
		numJokers: isdef(nJokers) ? nJokers : 0,
	};
	//calc total number of deck cards if possible or 100
	//console.log(params)
	let defStyle = { deck52: { n: 52 }, catan: { n: 20 }, free: {}, deckEmpty: { n: 0 } };
	N = isdef(N) ? N : defStyle[params.kind].n;
	params.N = N;
	params.NTotal = N + (isdef(nJokers) ? nJokers : 0);
	//console.log('___________',params)
	return DeckB.fDeck(params);
}

function createPicto({ key, w = 100, h = 100, unit = 'px', fg = 'blue', bg, padding = 10, cat, parent, border, rounding }) {
	if (nundef(key)) key = getRandomKey(iconChars);
	let ch = iconChars[key];
	let family = (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';
	let text = String.fromCharCode('0x' + ch);
	cat = isdef(parent) ? getTypeOf(parent) == 'div' ? 'd' : 'g' : isdef(cat) ? cat : 'd';
	let domel;
	if (cat == 'd') {
		let d = document.createElement('div');
		d.style.textAlign = 'center';
		d.style.fontFamily = family;
		d.style.fontWeight = 900;
		d.style.fontSize = h + unit;
		if (isdef(bg)) d.style.backgroundColor = bg;
		if (isdef(fg)) d.style.color = fg;
		d.innerHTML = text;
		domel = d;
		if (isdef(padding)) d.style.padding = padding + unit;
		d.style.display = 'inline-block';
		d.style.height = h + 2 * padding + unit;
		d.style.width = d.style.height;
		//d.style.textAlign = 'center';
		console.log('padding', padding, 'unit', unit, 'w', d.style.width, 'h', d.style.height);
		if (isdef(border)) d.style.border = border;
		if (isdef(rounding)) d.style.borderRadius = rounding + unit;
	} else {
		//create a g element
		//add a rectangle element w/ or wo/ stroke and rounding
		//add a text element

	}
	domel.key = key;
	if (parent) parent.appendChild(domel);
	return domel;
}

//#region tests
function test07() {
	document.body.style.height = '100vh';

	let div1 = addDivToBody(100, 50, '%', 'blue');
	let div2 = addDivToBody(100, 50, '%', 'green');

	var deck1 = makeDeck({ kind: 'deck52', N: 30, nJokers: 5 });//DeckA();
	let ms1 = new DeckMS('deck1', deck1);
	ms1.attachTo(div1);

	deck1.cards.forEach(function (card, i) { card.enableDragging(); card.enableFlipping(); });

	var deck2 = makeDeck({ kind: 'deck52', N: 30, nJokers: 5 });//DeckA();
	let ms2 = new DeckMS('deck2', deck2);
	ms2.attachTo(div2);

}
function test08() {
	document.body.style.height = '100vh';

	let div1 = addDivToBody(100, 50, '%', 'blue');
	let div2 = addDivToBody(100, 50, '%', 'green');

	var deck1 = makeDeck({ kind: 'deck52', N: 30, nJokers: 5 });
	let ms1 = new DeckMS('deck1', deck1);
	ms1.attachTo(div1);

	let cells = addGridTo(div2, 2, 2, '10px');
	let d = cells[0][1];
	clearElement(d);
	var deck2 = makeDeck({ kind: 'deck52', N: 30, nJokers: 5 });
	let ms2 = new DeckMS('deck2', deck2);
	ms2.attachTo(d);
	//ms2.center();

	//d.innerHTML = '';

}
function test09() {
	document.body.style.height = '100vh';

	let div1 = addDivToBody(100, 50, '%', 'blue');
	let div2 = addDivToBody(100, 50, '%', 'green');

	let rows1 = 3;
	let cols1 = 3;

	let cells = addGridTo(div2, rows1, cols1, '10px');
	console.log(cells);
	for (let i = 0; i < rows1; i++) {
		for (let j = 0; j < cols1; j++) {
			let cell = cells[i][j];
			clearElement(cell);
			let ms = new DeckMS('d' + rows1 + '_' + cols1, makeDeck({ kind: 'deck52', N: 30, nJokers: 5 }));
			ms.attachTo(cell);
			enableFlipForDeck(ms.o);
			enableDragForDeck(ms.o);

		}
	}
}
function test10() {
	document.body.style.height = '100vh';

	let rows1 = 3;
	let cols1 = 3;

	let cells = addGridTo(document.body, rows1, cols1, '10px');
	console.log(cells);
	for (let i = 0; i < rows1; i++) {
		for (let j = 0; j < cols1; j++) {
			let cell = cells[i][j];
			clearElement(cell);
			let ms = new DeckMS('d' + rows1 + '_' + cols1, makeDeck({ kind: 'deck52', N: 30, nJokers: 5 }));
			ms.attachTo(cell);
			enableFlipForDeck(ms.o);
			enableDragForDeck(ms.o);

		}
	}
}
function test11() {
	document.body.style.height = '100vh';

	//add deck to body!
	let ms = addDeckTo(makeDeck({ kind: 'deck52', N: 30, nJokers: 5 }), document.body, 'discardPile', true, true);
	ms.setPos(0, -300);
}
function test12() {
	// let deck = Deck.DeckB('deck52');//,deck52DrawFace,deck52DrawFace,deck52DrawBack,deck52DrawBack);
	document.body.style.height = '100vh';

	let deck = makeDeck({ kind: 'deck52', N: 30, nJokers: 5 });
	clearElement(document.body);
	addDeckTo(deck, document.body, 'deck1', true, true);
}
function test13_simpleDD() {
	document.body.style.height = '100vh';

	let dParent = addDivToBody();
	dParent.id = 'dParent';
	let d = addDivPosTo(dParent, 20, 50, 200, 200, unit = 'px', bg = 'red');
	let purpleTarget = addDivPosTo(dParent, 250, 50, 300, 200, unit = 'px', bg = 'purple');
	let greenTarget = addDivPosTo(purpleTarget, 50, 50, 200, 120, unit = 'px', bg = 'green');

	let pic = createPicto({ key: 'whistle', parent: d, bg: 'yellow', border: '1px solid green', rounding: 12 }); //addPicto(d, 'whistle'); //returns div with centered pictogram
	pic.type = 'pic';
	//posXY(pic, dParent, 10, 20);

	makeDraggable(pic);
	makeDroppable(purpleTarget);
	//dropPosition = 'centerCentered'; 
	dropPosition = (ev, elem, target) => { posOverlap(elem, target, 10, 5, 'type'); };
}
function test13_simpleDDMultiple() {
	let dParent = addDivToBody();
	dParent.id = 'dParent';
	let purpleTarget = addDivPosTo(dParent, 250, 50, 300, 200, unit = 'px', bg = 'purple');
	let greenTarget = addDivPosTo(purpleTarget, 50, 50, 200, 120, unit = 'px', bg = 'green');
	let d = addDivPosTo(dParent, 20, 50, 200, 200, unit = 'px', bg = 'red');

	for (let i = 0; i < 7; i++) {
		let k = getRandomKey(iconChars);
		let pic = createPicto({ key: k, parent: d, bg: 'yellow', border: '1px solid green', rounding: 12 });

		//let w = actualWidth
		// createPicto is addPicto,_addPicto,picto,and __picto all in one!
		// let pic = addPicto(d, k); //returns div with centered pictogram
		pic.type = 'pic';
		posOverlap(pic, d, 120, 0, 'type');
		makeDraggable(pic);
	}
	makeDroppable(purpleTarget);
	//dropPosition = 'centerCentered'; 
	dropPosition = (ev, elem, target) => { posOverlap(elem, target, 10, 5, 'type'); };

}

//ndregion

