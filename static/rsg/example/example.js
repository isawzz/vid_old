
/* global DeckA */

var prefix = DeckA.prefix

var transform = prefix('transform')

var translate = DeckA.translate

var container1 = document.getElementById('container')
var topbar1 = document.getElementById('topbar')

var bSort = document.createElement('button')
var bShuffle = document.createElement('button')
var bBySuit = document.createElement('button')
var bFan = document.createElement('button')
var bPoker = document.createElement('button')
var bFlip = document.createElement('button')

bShuffle.textContent = 'Shuffle'
bSort.textContent = 'Sort'
bBySuit.textContent = 'By suit'
bFan.textContent = 'Fan'
bPoker.textContent = 'Poker'
bFlip.textContent = 'Flip'

topbar1.appendChild(bFlip)
topbar1.appendChild(bShuffle)
topbar1.appendChild(bBySuit)
topbar1.appendChild(bFan)
topbar1.appendChild(bPoker)
topbar1.appendChild(bSort)

var deck = DeckA()

// easter eggs start

var acesClicked = []
var kingsClicked = []


deck.cards.forEach(function (card, i) {
	card.enableDragging()
	card.enableFlipping()

	card.elem.addEventListener('mousedown', onTouch)
	card.elem.addEventListener('touchstart', onTouch)

	function onTouch() {
		var card

		if (i % 13 === 0) {
			acesClicked[i] = true
			if (acesClicked.filter(function (ace) {
				return ace
			}).length === 4) {
				document.body.removeChild(topbar1)
				deck.elem.style.display = 'none'
				setTimeout(function () {
					startWinning()
				}, 250)
			}
		} else if (i % 13 === 12) {
			if (!kingsClicked) {
				return
			}
			kingsClicked[i] = true
			if (kingsClicked.filter(function (king) {
				return king
			}).length === 4) {
				for (var j = 0; j < 3; j++) {
					card = DeckA.Card(52 + j)
					card.mount(deck.elem)
					card.elem.style[transform] = 'scale(0)'
					card.setSide('front')
					card.enableDragging()
					card.enableFlipping()
					deck.cards.push(card)
				}
				deck.sort(true)
				kingsClicked = false
			}
		} else {
			acesClicked = []
			if (kingsClicked) {
				kingsClicked = []
			}
		}
	}
})

console.log(typeof(deck.cards),typeof(deck),deck.cards)
console.log(deck.cards[0])
let c = deck.cards[0]
c.text='hallo'
c.elem.innerHTML = 'Knight'
c.enableDragging();
console.log(c)
//c.setSide('front')

console.log('___________________')
console.log(DeckA.Card(1));
let d=document.getElementById('div2');
console.log(d)
let c1=deck.cards[1];
//c1.unmount(deck.elem);
//c1.mount(d);
c1.elem.innerHTML = 'BBBB';
//c1.setSide('front')


function startWinning() {
	var $winningDeck = document.createElement('div')
	$winningDeck.classList.add('deck')

	$winningDeck.style[transform] = translate(Math.random() * window.innerWidth - window.innerWidth / 2 + 'px', Math.random() * window.innerHeight - window.innerHeight / 2 + 'px')

	container1.appendChild($winningDeck)

	var side = Math.floor(Math.random() * 2) ? 'front' : 'back'

	for (var i = 0; i < 55; i++) {
		addWinningCard($winningDeck, i, side)
	}

	setTimeout(startWinning, Math.round(Math.random() * 1000))
}

function addWinningCard(deck1, i, side) {
	var card = DeckA.Card(54 - i)
	var delay = (55 - i) * 20
	var animationFrames = DeckA.animationFrames
	var ease = DeckA.ease

	card.enableFlipping()

	if (side === 'front') {
		card.setSide('front')
	} else {
		card.setSide('back')
	}

	card.mount(deck1)
	card.elem.style.display = 'none'

	var xStart = 0
	var yStart = 0
	var xDiff = -500
	var yDiff = 500

	animationFrames(delay, 1000)
		.start(function () {
			card.x = 0
			card.y = 0
			card.elem.style.display = ''
		})
		.progress(function (t) {
			var tx = t
			var ty = ease.cubicIn(t)
			card.x = xStart + xDiff * tx
			card.y = yStart + yDiff * ty
			card.elem.style[transform] = translate(card.x + 'px', card.y + 'px')
		})
		.end(function () {
			card.unmount()
		})
}

// easter eggs end

bShuffle.addEventListener('click', function () {
	deck.shuffle()
	deck.shuffle()
})
bSort.addEventListener('click', function () {
	deck.sort()
})
bBySuit.addEventListener('click', function () {
	deck.sort(true) // sort reversed
	deck.bysuit()
})
bFan.addEventListener('click', function () {
	deck.fan()
})
bFlip.addEventListener('click', function () {
	deck.flip()
})
bPoker.addEventListener('click', function () {
	deck.queue(function (next) {
		deck.cards.forEach(function (card, i) {
			setTimeout(function () {
				card.setSide('back')
			}, i * 7.5)
		})
		next()
	})
	deck.shuffle()
	deck.shuffle()
	deck.poker()
})

deck.mount(container1)

//deck.intro()
//deck.sort()

// #region secret message..

//var randomDelay = 10000 + 30000 * Math.random()

// setTimeout(function () { printMessage('Psst..I want to share a secret with you...') }, randomDelay)
// setTimeout(function () { printMessage('...try clicking all kings and nothing in between...') }, randomDelay + 5000)
// setTimeout(function () { printMessage('...have fun ;)') }, randomDelay + 10000)

function printMessage(text) {
	var animationFrames = DeckA.animationFrames
	var ease = DeckA.ease
	var message1 = document.createElement('p')
	message1.classList.add('message')
	message1.textContent = text

	document.body.appendChild(message1)

	message1.style[transform] = translate(window.innerWidth + 'px', 0)

	var diffX = window.innerWidth

	animationFrames(1000, 700)
		.progress(function (t) {
			t = ease.cubicInOut(t)
			message1.style[transform] = translate((diffX - diffX * t) + 'px', 0)
		})

	animationFrames(6000, 700)
		.start(function () {
			diffX = window.innerWidth
		})
		.progress(function (t) {
			t = ease.cubicInOut(t)
			message1.style[transform] = translate((-diffX * t) + 'px', 0)
		})
		.end(function () {
			document.body.removeChild(message1)
		})
}
//#endregion
