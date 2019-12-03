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
const zmax = 100;
function getSymbolKey(name) { return name.replace(new RegExp(' ', 'g'), '_').toLowerCase(); }
function bringCardToFront(id) { let elem = document.getElementById(id); elem.style.zIndex = zmax; }
function sendCardToBack(id) { let c = UIS[id]; let elem = document.getElementById(id); elem.style.zIndex = c.zIndex; }
function _makeCardDiv(oid,o) {
	let key = getSymbolKey(o.name);
	let symbol = symbols[key];
	let color = symbolColors[key];
	let d = document.createElement('div');
	$(d).on("mouseenter", function () { bringCardToFront(this.id); }); //this.parentNode.appendChild(this);})
	$(d).on("mouseleave", function () { sendCardToBack(this.id); })
	$(d).on("click", function () { removeCardFromHand(this.id); })

	d.innerHTML = 'hallo';
	d.style.position = 'absolute';
	let dx=0;
	d.style.left = '' + dx + 'px';
	// d.style.width='100px';
	// d.style.height='200px';
	d.style.top = '0px';
	//d.style.backgroundColor = randomColor();

	d.innerHTML = `
		<div class="card">
			<p style='font-size:22px;'>${o.name}</p>
			<div class="cardCenter">
				<div class="circular" style='background:${color}'><i class="fa fa-${symbol} fas"></i></div>
			</div>
			<hr>
			<p style='font-size:20px;'>${o.desc}</p>
			<div style='color:${color};position:absolute;left:8px;top:8px;width:35px;height:35px'>
			<i class="fa fa-${symbol}"></i>
			</div>
		</div>
	`;
	return d;
}
function removeCardFromHand(id) {
	let ms = UIS[id];
	let hand = ms.hand;
	if (nundef(hand)) return;
	console.log('hand before removing', hand.cards.map(x=>x.id));

	removeInPlace(hand.cards,ms);
	hand.numCards = hand.cards.length;
	ms.detach();
	ms.hand = null; //idParent is still same!

	repositionCards(hand);

	console.log('hand after removing', hand.cards.map(x=>x.id));
}
function repositionCards(hand){
	let el = hand.elem;
	let W=hand.w;
	let H=hand.H;
	let w=hand.wCard;
	let h=hand.hCard;
	let n=hand.numCards;
	let dx=n>1?(W-w)/(n-1):0;
	if (dx > w) dx=w;
	let x=0;
	let y=0;
	let i=0;
	for(const c of hand.cards){
		c.zIndex = c.elem.style.zIndex = i; 
		i+=1;
		c.setPos(x,y);
		x+=dx;
	}
}
function addCardToHand(id, idHand) {
	let ms = UIS[id];
	let hand = UIS[idHand];
	ms.hand = hand;
	if (nundef(hand.numCards)) {
		hand.numCards = 1;
		hand.dx=0;
		hand.cards = [ms];
	} else {
		hand.numCards += 1;
		hand.cards.push(ms);
	}
	let n = hand.numCards;
	ms.zIndex = n;

	//calc card height
	let hCard = ms.elem.offsetHeight;
	console.log(hCard);
	//let hHand = 200;// 
	let hHand = hand.elem.offsetHeight;
	console.log(hHand);
	let wCard = ms.elem.offsetWidth;
	console.log('w1',wCard);
	let scale=1;
	if (hCard >= hHand){
		scale = hHand/hCard;
		ms.elem.style.transform = `scale(${scale})`;
		ms.elem.style.transformOrigin = '0% 0%';
	}
	hand.scale = scale;

	wCard = ms.elem.offsetWidth;
	console.log('w2',wCard);
	let wReal = wCard*scale;
	let hReal = hCard*scale;
	hand.wCard = wReal;
	hand.hCard = hReal;

	repositionCards(hand);
}


//#region test
var cards1 = {
	'147-2c93ddaf':
	{
		desc: "Move the Robber. Steal 1 resource card from the owner of an adjacent settlement or city.",
		name: "Knight",
		obj_type: "devcard",
		visible: { _set: ["White", "Red", "Blue", "Orange"] },
	},
	'147-2c93dda3':
	{
		desc: "1 Victory Point!",
		name: "Victory Point",
		obj_type: "devcard",
		visible: { _set: ["White", "Red", "Blue", "Orange"] },
	},
	'147-2c33dda3':
	{
		desc: "Take any 2 resources from the bank. Add them to your hand. They can be 2 of the same or 2 different resources.",
		name: "Year of Plenty",
		obj_type: "devcard",
		visible: { _set: ["White", "Red", "Blue", "Orange"] },
	},
	'147-2c23dda3':
	{
		desc: "Place 2 new roads as if you had just built them.",
		name: "Road Building",
		obj_type: "devcard",
		visible: { _set: ["White", "Red", "Blue", "Orange"] },
	},
	'147-2c13dda3':
	{
		desc: "When you play this card, announce 1 type of resource. All other players must give you all their resource cards of that type.",
		name: "Monopoly",
		obj_type: "devcard",
		visible: { _set: ["White", "Red", "Blue", "Orange"] },
	},

};
var card1 = cards1['147-2c93ddaf'];
function testCards() {
	_initGameGlobals();	hideLobby(); hideLogin(); showGame();	initDom();

	let d = UIS['a_d_game'].elem;
	//d.style.display='flex';
	let dx = 0;
	let i = 0;
	for (const k in cards1) {
		let c = makeCard(k,cards1[k],'a_d_game');
		console.log(c);
	}
	for (const k in cards1) {
		let kNew = k+'1';
		let c = makeCard(kNew,cards1[k],'a_d_game');
		console.log(c);
	}
}
























