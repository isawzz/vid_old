class RSG {
	constructor() {
		this.children = [];
		this.parts = {};
		this.handlers = { click: {}, mouseenter: {}, mouseleave: {} };
		this.isAttached = false;
		this.texts = []; //akku for text elems, each elem {w:textWidth,el:elem}
		this.refs = {}; //by key same as parts
		this.isa = {};
		this.orig = {}; //at least remember bg,fg,x,y,w,h,shape,scale,rot when first assign (ground or elem)
		this.bgs = {}; //TODO: eliminate!
		this.fgs = {}; //TODO: eliminate!
	}
	//#region picto
	pictoImage(key, fg, sz) {
		this._picto(key, 0, 0, sz, sz, fg);
		this.isPicto = true;
		this.picto = this.elem.children[1];
		this.texts = [];
	}
	_picto(key, x, y, w, h, fg, bg) {
		//soll das ein g oder ein d sein?
		//sollte eigentlich fuer beide gehen!
		//zuerst als g
		let ch = iconChars[key];
		//if (nundef(ch)) ch = chooseRandom(Object.values(iconChars));
		let family = (ch[0] == 'f' || ch[0] == 'F') ? 'pictoFa' : 'pictoGame';
		let text = String.fromCharCode('0x' + ch);
		//key="skiing-nordic";
		if (this.cat == 'g') {
			if (isdef(bg)) this.rect({ w: w, h: h, fill: bg, x: x, y: y });
			// this.text({txt:'\uf520',family:'picto',x:x,y:y,fz:h,fill:fg});
			this.text({ txt: text, family: family, weight: 900, x: x, y: y, fz: h, fill: fg });
			this.orig.fg = fg;
			//this.text({ className:'overlay', txt: text, family: family, weight: 900, x: x, y: y, fz: h, fill: fg });
			return this;
		} else {

		}
	}

	//#endregion

	//#region text
	computeTextColors(fill, alpha = 1, textBg = null) {
		fill = fill ? fill : this.fg ? this.fg : textBg ? colorIdealText(textBg) : this.bg ? colorIdealText(this.bg) : null;
		if (!fill) {
			fill = 'white';
			textBg = 'gray';
		}
		fill = anyColorToStandardString(fill, alpha);
		return { fill: fill, bg: textBg ? textBg : this.bg };
	}
	setTextFill(r, fill, alpha = 1, textBg = null) {
		let textColors = this.computeTextColors(fill, alpha, textBg);
		//console.log('text color fill='+fill,'bg='+this.bg,'fg='+this.fg,'textBg='+textBg)
		r.setAttribute('fill', textColors.fill);
		r.setAttribute('stroke', 'none');
		r.setAttribute('stroke-width', 0);
		return textColors.bg;
	}
	setTextBorder(color, thickness = 0) {
		//to set stroke for line or text different from fill!
		let c = anyColorToStandardString(color);
		let children = arrChildren(this.elem);
		unitTestMS('setTextBorder', children);
		for (const ch of children) {
			//console.log(ch.getAttribute('stroke-width'));
			let t = getTypeOf(ch);
			if (t == 'text' || t == 'line') {
				ch.setAttribute('stroke-width', thickness);
				ch.setAttribute('stroke', c);
			}
		}
	}
	calcTextWidth(txt, fz, family, weight) {
		let sFont = weight + ' ' + fz + 'px ' + family; //"bold 12pt arial"
		sFont = sFont.trim();
		let wText = getTextWidth(txt, sFont);
		return wText;
	}

	addFrame(color) {
		if (this.cat == 'd') {
			//console.log(this.body)
			this.body.style.boxSizing = 'border-box';
			//console.log('adding a frame')
			this.body.style.border = '5px solid ' + color;
		}
	}
	addFlexTitleBody() {
		let content = this.elem.innerHTML;
		clearElement(this.elem);
		let d = this.elem;
		d.style.display = 'flex';
		d.style.flexDirection = 'column';
		let dTitle = document.createElement('div');
		this.title = dTitle;
		this.title.style.padding = '6px';
		this.title.style.textAlign = 'center';
		let dBody = document.createElement('div');
		dBody.style.flexGrow = 1;
		dBody.style = "flex-grow:1;overflow:auto;padding:0px 6px"
		this.body = dBody;
		this.body.innerHTML = content;
		this.elem.appendChild(this.title);
		this.elem.appendChild(this.body);
	}

	setTitle({
		txt,
		className = null,
		isOverlay = false,
		isMultiText = false,
		replaceFirst = true,
		fill = null,
		textBg = null,
		alpha = 1,
		x = 0,
		y = 0,
		fz = 20,
		family = 'Arial, Helvetica, sans-serif',
		weight = ''
	} = {}) {


		if (this.cat == 'd') {
			if (nundef(this.body) || nundef(this.title)) {
				this.addFlexTitleBody();
			}
			clearElement(this.title);
			if (isdef(textBg)) this.title.style.backgroundColor = textBg;
			if (isdef(fill)) this.title.style.color = fill;
			this.title.innerHTML = txt;
			return this;
		}
		let isFirstChild = this.elem.childNodes.length == 0;

		let r = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		if (isFirstChild) {
			this.ground = r;
		}
		r.setAttribute('font-family', family);
		r.setAttribute('font-weight', weight);

		// CSS classes
		if (isOverlay) {
			r.classList.add('overlay');
			this.overlay = r;
		}
		r.classList.add('msText');
		if (className) {
			r.classList.add(className);
		}

		textBg = this.setTextFill(r, fill, alpha, textBg);
		if (isFirstChild) {
			//console.log('ist das hier?!?!?!?!?!?!?')
			this.bgs.ground = textBg;
			this.fgs.ground = fill;
		}
		//console.log('text: textBg='+textBg)
		let wText = this.calcTextWidth(txt, fz, family, weight);

		if (this.isLine && !isMultiText) {
			x += this.x;
			y += this.y;
			//console.log(x, y);
			if (this.textBackground) {
				this.elem.removeChild(this.textBackground);
			}

			this.textBackground = this.getRect({ w: wText + 10, h: fz * 1.5, fill: textBg });
			this.textBackground.setAttribute('rx', 6);
			this.textBackground.setAttribute('ry', 6);
		}
		r.setAttribute('font-size', '' + fz + 'px');
		r.setAttribute('x', x);
		r.setAttribute('y', y + fz / 2.8);
		r.setAttribute('text-anchor', 'middle');
		r.textContent = txt;
		r.setAttribute('pointer-events', 'none'); // geht!!!!!!

		if (replaceFirst && this.texts.length > 0) {
			let ch = this.texts[0].el; //findChildOfType('text', this.elem);

			//console.log('this.textx[0]',ch,this.texts,this)
			this.elem.insertBefore(r, ch);
			if (this.isLine) {
				this.elem.insertBefore(this.textBackground, r);
			}
			this.removeTexts();
		} else {
			if (this.isLine && !isMultiText) {
				this.elem.appendChild(this.textBackground);
			}
			this.elem.appendChild(r);
		}

		let res = { el: r, w: wText };
		this.texts.push(res);
		return res;
	}

	text({
		txt,
		className = null,
		isOverlay = false,
		isMultiText = false,
		replaceFirst = true,
		fill = null,
		textBg = null,
		alpha = 1,
		x = 0,
		y = 0,
		fz = 20,
		family = 'Arial, Helvetica, sans-serif',
		weight = ''
	} = {}) {

		//console.log('MS.text: family:',family,'txt',txt)
		if (this.cat == 'd') {

			if (isEmpty(txt)) {
				//console.log('erasing...')
				this.elem.innerHTML = ''; return this;
			}
			//console.log('ist ein text!!!!!')
			//this.elem.style.maxWidth = this.w+'px';
			this.elem.style.textAlign = 'center';
			this.elem.style.color = fill ? fill : this.fg ? this.fg : 'white';
			//this.elem.style.padding = '20px';
			//console.log('fz',fz,this.elem)
			let margin = this.h / 2 - fz / 2;
			this.elem.innerHTML = `<div style='margin-top:${margin}px;font-size:${fz}px;'>${txt}</div>`;
			this.elem.boxSizing = 'border-box';
			return this;
		}

		if (isdef(txt) && !isString(txt)) txt = txt.toString();
		if (isEmpty(txt)) {
			//console.log('erasing...')

			this.removeTexts(); return this;
		}


		// ms.text({txt: val, force: force, shrinkFont: shrinkFont, wrap: wrap, fz: fz, bg: 'white', fill: 'black'});
		//TODO: shrinkFont,wrap,ellipsis options implementieren
		//if replaceFirst true ... if this elem already contains a text, that text child is replaced by new text
		let isFirstChild = this.elem.childNodes.length == 0;

		//let r = getText({txt:txt,className:className,isOverlay:isOverlay,fill:fill,textBg:textBg,alpha:alpha,x:x,y:y,fz:fz,family:family,weight:weight});

		let r = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		if (isFirstChild) {
			this.ground = r;
		}
		r.setAttribute('font-family', family);
		r.setAttribute('font-weight', weight);

		//console.log()

		// CSS classes
		if (isOverlay) {
			r.classList.add('overlay'); //className);
			this.overlay = r;
		}
		r.classList.add('msText');
		if (className) {
			r.classList.add(className);
		}
		//console.log('classes attached to new text element',r.getAttribute('class'),r.classList);

		textBg = this.setTextFill(r, fill, alpha, textBg);
		if (isFirstChild) {
			this.bgs.ground = textBg;
			this.fgs.ground = fill;
		}
		//console.log('text: textBg='+textBg)
		let wText = this.calcTextWidth(txt, fz, family, weight);

		if (this.isLine && !isMultiText) {
			x += this.x;
			y += this.y;
			//console.log(x, y);
			if (this.textBackground) {
				this.elem.removeChild(this.textBackground);
			}

			this.textBackground = this.getRect({ w: wText + 10, h: fz * 1.5, fill: textBg });
			this.textBackground.setAttribute('rx', 6);
			this.textBackground.setAttribute('ry', 6);
		}
		r.setAttribute('font-size', '' + fz + 'px');
		r.setAttribute('x', x);
		r.setAttribute('y', y + fz / 2.8);
		r.setAttribute('text-anchor', 'middle');
		r.textContent = txt;
		r.setAttribute('pointer-events', 'none'); // geht!!!!!!

		//console.log('texts',this.texts.length,'replaceFirst',replaceFirst,'txt',txt)
		if (replaceFirst && this.texts.length > 0) {
			let ch = this.texts[0].el; //findChildOfType('text', this.elem);

			//console.log('this.texts[0].el',ch, '\nr', r,'\ntexts:',this.texts,this)
			this.elem.insertBefore(r, ch);
			if (this.isLine) {
				this.elem.insertBefore(this.textBackground, r);
			}
			this.removeTexts();
		} else {
			if (this.isLine && !isMultiText) {
				this.elem.appendChild(this.textBackground);
			}
			//console.log('mache appendChild mit ',txt)
			this.elem.appendChild(r);
		}

		let res = { el: r, w: wText };
		this.texts.push(res);
		//console.log('MS.text done: res',res)
		//console.log(r)
		return res;
	}
	reduceFontSize(el, n) {
		//console.log('reduceFontSize');
		let fz = el.getAttribute('font-size');
		fz = firstNumber(fz);
		if (fz > n) fz -= n;
		//this.elem.removeChild(el);
		el.setAttribute('font-size', '' + fz + 'px');
	}
	clearText() { this.removeTexts(); }
	removeTexts() {
		for (const t of this.texts) {
			this.elem.removeChild(t.el);
		}
		this.texts = [];
	}
	multitext({
		replacePrevious = true,
		className = '',
		maxWidth = 1000,
		txt = ['one', 'two', 'three'],
		fz = 20,
		fill = null,
		textBg = null,
		padding = 1,
		alpha = 1,
		x = 0,
		y = 0,
		family = 'Arial, Helvetica, sans-serif',
		weight = 'lighter'
	}) {
		let nChar = 0;
		for (const s of txt) { nChar = Math.max(nChar, s.length); }
		let maxFH = Math.round(this.h / txt.length);
		let maxFW = Math.round((this.w / nChar) * 2);

		let fzFit = Math.min(maxFH, maxFW) - 2 * padding;
		if (fzFit < fz) fz = fzFit;
		if (fzFit > 5 * fz) fz *= 5;//fzFit;
		// let stdFonts=[6,14,28,54,100];
		// let fz1=stdFonts[0];
		// for(let i=0;i<stdFonts.length;i++){if (stdFonts[i]>fzFit) break; else fz1=stdFonts[i];}
		// //console.log('fzOrig',fz,'fzFit',fz1);
		// fz=fz1;

		if (replacePrevious) this.removeTexts();

		let h = txt.length * (fz + padding);

		let textColors = this.computeTextColors(fill, alpha, textBg);
		if (this.isLine) {
			x += this.x;
			y += this.y;

			let tbg = this.textBackground ? this.textBackground : this.getRect();

			tbg.setAttribute('height', h);
			tbg.setAttribute('fill', textColors.bg);
			if (!this.textBackground) {
				this.textBackground = tbg;
				this.elem.appendChild(this.textBackground);
			}
			this.textBackground.setAttribute('rx', 6);
			this.textBackground.setAttribute('ry', 6);
		}

		let yStart = y - h / 2 + fz / 2;
		let maxW = 0;
		let akku = [];
		for (const t of txt) {
			let tel = this.text({
				isMultiText: true,
				replaceFirst: false,
				className: className,
				maxWidth: maxWidth,
				txt: t,
				fz: fz,
				fill: fill,
				padding: padding,
				alpha: alpha,
				x: x,
				y: yStart,
				family: family,
				weight: weight
			});
			maxW = Math.max(maxW, tel.w);
			akku.push(tel);
			yStart += fz + padding;
		}
		let isFirstChild = this.elem.childNodes.length == 0;
		if (isFirstChild || this.isLine) {
			this.ground = this.textBackground;
			this.w = maxW + 2 * padding;
			this.h = h;
		}
		if (this.isLine) {
			this.textBackground.setAttribute('width', this.w);
			this.textBackground.setAttribute('x', x - this.w / 2);
			this.textBackground.setAttribute('y', y - this.h / 2);
		}
		if (isFirstChild) { this.bgs.ground = textColors.bg; this.fg.ground = fill; }

		return this;

	}
	//#endregion

	//#region internal
	_setFill(el, fill, alpha) {
		if (fill != null && fill !== undefined) {
			fill = anyColorToStandardString(fill, alpha);
			el.setAttribute('fill', fill);
			return fill;
		}
		return null;
	}
	//#endregion

	//#region primitive shapes

	_ellipse() { return document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'); }
	_circle() { return document.createElementNS('http://www.w3.org/2000/svg', 'ellipse'); }

	_rect() { return document.createElementNS('http://www.w3.org/2000/svg', 'rect'); }
	_square() { return document.createElementNS('http://www.w3.org/2000/svg', 'rect'); }
	_quad() { return document.createElementNS('http://www.w3.org/2000/svg', 'rect'); }
	_roundedRect() { return document.createElementNS('http://www.w3.org/2000/svg', 'rect'); }

	_hex() { return document.createElementNS('http://www.w3.org/2000/svg', 'polygon'); }

	_triangle() { return document.createElementNS('http://www.w3.org/2000/svg', 'polygon'); }
	_triangleDown() { return document.createElementNS('http://www.w3.org/2000/svg', 'polygon'); }
	_star() { return document.createElementNS('http://www.w3.org/2000/svg', 'polygon'); }

	_line() { return document.createElementNS('http://www.w3.org/2000/svg', 'line'); }

	_image() { return document.createElementNS('http://www.w3.org/2000/svg', 'image'); }

	_text() { return document.createElementNS('http://www.w3.org/2000/svg', 'text'); }

	//#endregion

	//#region geo: TODO: update!
	ellipse({ idx, border, thickness = 0, className = '', w = 50, h = 25, fill, alpha = 1, x = 0, y = 0 } = {}) {
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');

		if (this.isLine) {
			x += this.x;
			y += this.y;
		}

		let bg = this._setFill(r, fill, alpha);

		r.setAttribute('stroke-width', thickness);
		if (thickness > 0) {
			border = anyColorToStandardString(border, alpha);
			r.setAttribute('stroke', border);
		}

		// _initGroundOrig(className,r,bg,r.getAttribute('stroke'),x,y,w,h,'ellipse',1,0,thickness);
		if (this.elem.childNodes.length == 0 || className.includes('ground')) {
			this.ground = r;
			this.bgs.ground = bg;
			this.fgs.ground = r.getAttribute('stroke');
			this.w = w;
			this.h = h;
		}

		r.setAttribute('rx', w / 2);
		r.setAttribute('ry', h / 2);
		r.setAttribute('cx', x); //kann ruhig in unit % sein!!!
		r.setAttribute('cy', y);
		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			}
		}
		if (isdef(idx) && this.elem.childNodes.length > idx) {
			this.elem.insertBefore(r, this.elem.childNodes[idx]);
		} else {
			this.elem.appendChild(r);
		}
		return this;
	}
	getRect({ border, thickness = 0, className = '', w = 50, h = 25, fill, alpha = 1, x = 0, y = 0, rounding } = {}) {
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

		if (this.isLine) {
			x += this.x;
			y += this.y;
		}

		//console.log(this)
		r.setAttribute('width', w);
		r.setAttribute('height', h);
		r.setAttribute('x', -w / 2 + x);
		r.setAttribute('y', -h / 2 + y);

		let bg = this._setFill(r, fill, alpha);
		if (this.elem.childNodes.length == 0 || className.includes('ground')) {
			this.ground = r;
			this.bgs.ground = bg; this.fgs.ground = r.getAttribute('stroke');
			this.w = w;
			this.h = h;
		}


		r.setAttribute('stroke-width', thickness);
		if (thickness > 0) {
			border = anyColorToStandardString(border, alpha);
			r.setAttribute('stroke', border);
		}

		//testGSM('rect nachher', fill);

		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			}
		}
		return r;
	}
	circle({ idx, border, thickness = 0, className = '', sz = 25, fill, alpha = 1, x = 0, y = 0 } = {}) {
		return this.ellipse({
			idx: idx,
			className: className,
			w: sz,
			h: sz,
			fill: fill,
			border: border,
			thickness: thickness,
			alpha: alpha,
			x: x,
			y: y
		});
	}
	hex({ idx, className = '', x = 0, y = 0, w, h = 0, fill, alpha = 1, border = 'white', thickness = 0, flat = false }) {
		//flat=true means  TODO: implement!
		//if h<=0, heightis calculated from width!
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

		if (h <= 0) { h = (2 * w) / 1.73; }
		let pts = size2hex(w, h, x, y);
		r.setAttribute('points', pts);

		let bg = this._setFill(r, fill, alpha);
		if (this.elem.childNodes.length == 0 || className.includes('ground')) {
			this.ground = r;
			this.bgs.ground = bg; this.fgs.ground = r.getAttribute('stroke');
			this.w = w;
			this.h = h;
		}


		if (thickness > 0) {
			border = convertToRgba(border, alpha);
			r.setAttribute('stroke', border);
			r.setAttribute('stroke-width', thickness);
		}

		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			}
		}
		this.elem.appendChild(r);
		if (className.includes('ground')) { this.w = w; this.h = h; this.x = x; this.y = y; }
		return this;
	}
	triangle({ idx, className = '', x = 0, y = 0, w, h = 0, fill, alpha = 1, border = 'white', thickness = 0 }) {
		let pts = size2triup(w, h, x, y);
		if (this.elem.childNodes.length == 0 || className.includes('ground')) { this.w = w; this.h = h; this.x = x; this.y = y; }
		this.poly({ idx: idx, className: className, pts: pts, fill: fill, alpha: alpha, border: border, thickness: thickness });
		return this;
	}
	triangleDown({ idx, className = '', x = 0, y = 0, w, h = 0, fill, alpha = 1, border = 'white', thickness = 0 }) {
		let pts = size2tridown(w, h, x, y);
		this.poly({ idx: idx, className: className, pts: pts, fill: fill, alpha: alpha, border: border, thickness: thickness });
		if (this.elem.childNodes.length == 1 || className.includes('ground')) { this.w = w; this.h = h; this.x = x; this.y = y; }
		return this;
	}
	star({ idx, className = '', n = 6, w, h = 0, x = 0, y = 0, fill, alpha = 1, border = 'white', thickness = 0 }) {
		h = h == 0 ? w : h;
		let rad = w / 2;
		let pOuter = getCirclePoints(rad, n);
		let pInner = getCirclePoints(rad / 2, n, 180 / n);
		//console.log(pOuter,pInner)
		let pts = [];
		for (let i = 0; i < n; i++) {
			pts.push(pOuter[i]);
			pts.push(pInner[i]);
		}
		for (let i = 0; i < pts.length; i++) {
			pts[i].X = (pts[i].X + w / 2) / w;
			pts[i].Y = (pts[i].Y + h / 2) / h;
		}
		let sPoints = polyPointsFrom(w, h, x, y, pts);
		//let sPoints = pts.map(p=>''+p.X+','+p.Y).join(' ');
		//console.log(sPoints)
		this.poly({ idx: idx, className: className, pts: sPoints, fill: fill, alpha: alpha, border: border, thickness: thickness });
		if (this.elem.childNodes.length == 1 || className.includes('ground')) { this.w = w; this.h = h; this.x = x; this.y = y; }
		return this;
	}
	image({ idx, className = '', path = '', w = 50, h = 50, x = 0, y = 0 } = {}) {
		//<image xlink:href="firefox.jpg" x="0" y="0" height="50px" width="50px"/>
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'image');
		r.setAttribute('href', path);

		r.setAttribute('width', w);
		r.setAttribute('height', h);
		r.setAttribute('x', -w / 2 + x);
		r.setAttribute('y', -h / 2 + y);
		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			}
		}
		if (this.elem.childNodes.length == 0) {
			this.w = w;
			this.h = h;
		}
		this.elem.appendChild(r);
		return this;
	}
	getEndPointsOfLineSegmentOfLength(d) {
		if (!this.isLine) return null;
		let x1 = this.x1;
		let y1 = this.y1;
		let x2 = this.x2;
		let y2 = this.y2;
		let dx = x2 - x1;
		let dy = y2 - y1;
		let mx = dx / 2;
		let my = dy / 2;
		let sx = x1;
		let sy = y1;
		//console.log('distance', this.distance, 'length', this.length)
		let factor = d / this.distance;
		let ex = x1 + factor * dx;
		let ey = y1 + factor * dy;
		let addx = (1 - factor) * dx / 2;
		let addy = (1 - factor) * dy / 2;
		return [sx + addx, sy + addy, ex + addx, ey + addy];

	}

	line({ idx, cap, className = '', x1 = 0, y1 = 0, x2 = 100, y2 = 100, fill, alpha = 1, length, thickness = 2 } = {}) {
		// <line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		r.setAttribute('x1', x1);
		r.setAttribute('y1', y1);
		r.setAttribute('x2', x2);
		r.setAttribute('y2', y2);

		if (isdef(cap)) r.setAttribute('stroke-linecap', cap);


		// Math.max(thickness,Math.abs(x1-x2)/2); 
		// this.h=Math.max(thickness,Math.abs(y1-y2)/2);

		let isFirstChild = this.elem.childNodes.length == 0;

		let stroke = anyColorToStandardString(fill, alpha);
		if (thickness > 0) {
			r.setAttribute('stroke', stroke);
			r.setAttribute('stroke-width', thickness);
		}
		if (className !== '') {
			r.setAttribute('class', className);
		}
		if (className.includes('overlay')) {
			r.setAttribute('class', 'overlay_line');
			this.overlay = r; //set the interactive element!
		}
		if (isFirstChild || className.includes('ground')) {
			this.ground = r;
			this.bgs.ground = stroke; this.fgs.ground = stroke;
			this.isLine = true;
			this.x = Math.round((x1 + x2) / 2);
			this.y = Math.round((y1 + y2) / 2);
			this.x1 = x1;
			this.y1 = y1;
			this.x2 = x2;
			this.y2 = y2;
			this.center = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
			this.distance = distance(x1, y1, x2, y2);

			if (length) {
				this.length = this.h = length; //default case!
			} else {
				this.length = this.h = this.distance; //default case!
			}

			this.thickness = thickness;
			this.w = thickness;
		}

		this.elem.appendChild(r);
		return this;
	}
	poly({ idx, className = '', pts = '0,0 100,0 50,80', fill, alpha = 1, border = 'white', thickness = 0 }) {
		let r = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		r.setAttribute('points', pts);

		let isFirstChild = this.elem.childNodes.length == 0;

		let bg = this._setFill(r, fill, alpha);
		if (isFirstChild || className.includes('ground')) {
			this.ground = r;
			this.bgs.ground = bg; this.fgs.ground = r.getAttribute('stroke');

			//TODO!!!!!!
			// this.w = w;
			// this.h = h;
		}

		if (thickness > 0) {
			border = anyColorToStandardString(border, alpha);
			r.setAttribute('stroke', border);
			r.setAttribute('stroke-width', thickness);
		}



		if (className !== '') {
			r.setAttribute('class', className);
			if (className.includes('overlay')) {
				this.overlay = r; //set the interactive element!
			}
		}
		this.elem.appendChild(r);
		return this;
	}
	rect({ idx, border, thickness = 0, className = '', w = 50, h = 25, fill, alpha = 1, x = 0, y = 0, rounding } = {}) {
		let r = this.getRect({ border: border, thickness: thickness, className: className, w: w, h: h, fill: fill, alpha: alpha, x: x, y: y, rounding: rounding });

		if (isdef(idx) && this.elem.childNodes.length > idx) {
			this.elem.insertBefore(r, this.elem.childNodes[idx]);
		} else {
			this.elem.appendChild(r);
		}
		return this;
	}
	roundedRect({ idx, border, thickness = 0, className = '', w = 150, h = 125, fill = 'darkviolet', rounding = 10, alpha = 1, x = 0, y = 0 } = {}) {
		return this.rect({ idx: idx, border: border, thickness: thickness, className: className, w: w, h: h, fill: fill, alpha: alpha, x: x, y: y, rounding: rounding })
	}
	square({ idx, className = '', sz = 50, fill = 'yellow', alpha = 1, x = 0, y = 0, border, thickness = 0, rounding } = {}) {
		return this.rect({
			idx: idx,
			className: className,
			w: sz,
			h: sz,
			fill: fill,
			alpha: alpha,
			x: x,
			y: y,
			border: border,
			thickness: thickness,
			rounding: rounding
		});
	}
	//#endregion

	//#region css classes
	addClass(el, clName) {
		if (nundef(el)) el = this.overlay ? this.overlay : this.ground;
		if (!el) return;

		el.classList.add(clName);
	}
	getClass() {
		if (this.overlay) {
			return getClass(this.overlay);
		} else if (this.ground) {
			return this.getClass(this.ground);
		}
		return null;
	}
	removeClass(el, clName) {
		if (nundef(el)) el = this.overlay ? this.overlay : this.ground;

		//let el = this.overlay;
		if (!el) return;
		el.classList.remove(clName);
	}
	//#endregion

	//#region tooltips
	calcCenterPos(ev) {
		//console.log('size', this.w, this.h)
		let x, y;

		if (isdef(this.w)) {

			let rect = ev.target.getBoundingClientRect();
			let dx = ev.clientX - rect.left; //x position within the element.
			let dy = ev.clientY - rect.top;
			x = ev.clientX - dx + this.w / 2;
			y = ev.clientY - dy + this.h / 2;
		} else {
			x = ev.pageX;
			y = ev.pageY;
		}
		return { x: x, y: y };
	}
	showTT(ev) {
		let d = document.getElementById('tooltip');
		clearElement(d);
		//console.log(this.o)
		let oid = getOidForMainId(this.id);
		let oUpdated = oid in G.table ? G.table[oid] : G.playersAugmented[oid];
		let titleDomel = document.createElement('div');
		titleDomel.style.width = '100%';
		titleDomel.style.textAlign = 'center';
		titleDomel.innerHTML = ('obj_type' in oUpdated ? oUpdated.obj_type : 'player') + ('name' in oUpdated ? ':' + oUpdated.name : 'id' in oUpdated ? ':' + oUpdated.id : ' ' + oid);
		d.appendChild(titleDomel);
		let t = tableElemX(oUpdated);
		d.appendChild(t.table);
		let pos = this.calcCenterPos(ev);
		$('div#tooltip').css({
			display: 'inline-block',
			left: pos.x,//ev.pageX, //clientX-dx+ms.w, //e.pageX, //clientX,
			top: pos.y,//ev.pageY, //clientY-dy+ms.h,//e.pageY, //clientY,
			//width: '300px',
			//height: '300px'
		});

	}
	ttHandling(ev, eventName) {
		if (!this.o) return;
		let oid = getOidForMainId(this.id);
		if (!oid) return;
		if (eventName == 'mouseenter') {
			//console.log('tt', this.id);
			this.TTTT = setTimeout(() => this.showTT(ev), 500);
		}
		else if (eventName == 'mouseleave') {
			clearTimeout(this.TTTT); hideTooltip();
		}

	}
	//#endregion

	//#region events
	_handler(ev) {
		//if (this.isa.deck) console.log('event!',ev,this.handlers);
		//console.log('event!',ev,this.id,this.handlers)
		ev.stopPropagation();
		let eventName = ev.handleObj.origType;

		if (S.settings.tooltips) this.ttHandling(ev, eventName);

		if (!this.isEnabled) return;
		let part = $(ev.currentTarget);

		let partName;
		if (this.isa.deck && this.parts.topmost) partName = 'topmost';
		else if (part.id == this.elem.id) partName = 'elem';
		else { let props = $(part).attrs(); let name = props.name; if (nundef(name)) name = 'elem'; partName = name; }


		let handler = this.handlers[eventName][partName];
		//console.log('eventName',eventName,'partName',partName, 'handler',handler)
		if (isdef(handler)) { handler(ev, this, partName); }// counters[eventName] += 1; counters.events += 1;  }
	}
	addHandler(evName, partName = 'elem', handler = null, autoEnable = true) {
		//console.log('addHandler for',evName,partName,this.id)
		let part = this._getPart(partName); //this.parts[partName];
		//if (this.isa.deck) console.log('added',evName,'handler to',part);
		if (nundef(part) || part == this.elem) { part = this.elem; partName = 'elem'; }
		else if (this.isa.deck) partName = 'topmost';


		if (isdef(handler)) { 
			//console.log('adding handler',evName,partName)
			this.handlers[evName][partName] = handler; 
		}

		$(part).off(evName).on(evName, this._handler.bind(this)); //only this handler is on for that event!!!

		if (autoEnable) this.enable();
	}
	addClickHandler(partName = 'elem', handler = null, autoEnable = true) { this.addHandler('click', partName, handler, autoEnable); }
	addMouseEnterHandler(partName = 'elem', handler = null, autoEnable = true) { this.addHandler('mouseenter', partName, handler, autoEnable); }
	addMouseLeaveHandler(partName = 'elem', handler = null, autoEnable = true) { this.addHandler('mouseleave', partName, handler, autoEnable); }
	removeClickHandler() { for (const partName in this.parts) { $(this.parts[partName]).off('click'); } this.handlers.click = {} }
	removeHoverHandlers() { for (const partName in this.parts) { $(this.parts[partName]).off('mouseenter mouseleave'); } this.handlers.mouseenter = {}; this.handlers.mouseleave = {} }
	removeHandlers() { this.removeEvents(); }
	removeEvents() {
		for (const partName in this.parts) { $(this.parts[partName]).off(); }// { let el = this.parts[partName]; $(el).off('mouseenter');$(el).off('mouseleave');$(el).off('click');} //$(this.parts[partName]).off('mouseenter mouseleave click'); }
		this.handlers = { click: {}, mouseenter: {}, mouseleave: {} };
	}
	enable() { this.isEnabled = true; }
	disable() { this.isEnabled = false; }
	//#endregion

	//#region high
	getTopCardElemOfDeck() {
		return this.topmost;
	}
	_getPart(partName, elemIfMissing = true) {
		let part = this.parts[partName];
		if (this.isa.deck) {
			let tm = this.getTopCardElemOfDeck();
			//console.log('____________________',tm)
			return this.getTopCardElemOfDeck();
		} else {
			return isdef(part) ? part : elemIfMissing ? this.elem : null;
		}
		//return isdef(part) ? part : elemIfMissing ? this.elem : null;
	}
	highC(c, pname = 'elem', elIfMiss = true) {
		//console.log('highC', this.id)
		let part = this._getPart(pname, elIfMiss);
		if (!part) return;
		if (this.cat == 'g') {
			if (this.isPicto) {
				//console.log('high', this.id, this.picto);
				this.setTextFill(this.picto, '#ccff00', 1);//.elem.addClass('high',this.ground); 
			} else {
				this.ground.setAttribute('fill', c);
				this.ground.setAttribute('stroke', c);
			}
		} else { part.style.backgroundColor = c; part.style.color = colorIdealText(c); }
	}
	unhighC(pname = 'elem', elIfMiss = true) {
		let part = this._getPart(pname, elIfMiss);
		if (!part) return;
		if (this.cat == 'g') {
			if (nundef(this.ground)) return;
			this.ground.setAttribute('fill', this.bgs.ground);
			if (this.fgs.ground) this.ground.setAttribute('stroke', this.fgs.ground);
		}
		else { let bg = part.bg; if (nundef(bg)) bg = null; part.style.backgroundColor = bg; if (isdef(bg)) part.style.color = colorIdealText(bg); }
	}
	high(pname = 'elem', elIfMiss = true) {
		let part = this._getPart(pname, elIfMiss);
		if (!part) return; //{//console.log('no part',pname); return;}
		if (this.cat == 'g') {
			if (this.isPicto) {
				this.setTextFill(this.picto, '#ccff00', 1);//.elem.addClass('high',this.ground); 
				//console.log('high', this.id, this.ground);
			} else addClass(this.overlay, 'high');
		} else part.style.backgroundColor = '#ccff00';

		// if (this.isLine) {
		// 	console.log('high', this.id, this.overlay);
		// }


	}
	unhigh(pname = 'elem', elIfMiss = true) {
		let part = this._getPart(pname, elIfMiss);
		if (!part) return;
		if (this.cat == 'g') {
			if (this.isPicto) {
				//this.removeClass('high',this.ground); 
				this.setTextFill(this.picto, this.orig.fg, 1);//.elem.addClass('high',this.ground); 
			} else {
				//console.log('overlay',this.overlay)
				//if (isdef(this.overlay)) console.log(this.overlay.classList)
				removeClass(this.overlay, 'high');
			}

			//removeClass('high', this.overlay);
		} else { let bg = part.bg; if (nundef(bg)) bg = null; part.style.backgroundColor = bg; }
	}
	highFrame(pname = 'elem', elIfMiss = true) {
		let part = this._getPart(pname, elIfMiss);
		if (!part) return;
		if (this.isLine) this.addClass(this.overlay, 'lineHighFrame');
		else if (this.isPicto) {
			this.addClass(this.ground, 'high');
			//this.setTextFill(this.picto, '#ccff00', 1);
		} else if (this.isa.field) {
			this.addClass(this.overlay, 'fieldHighFrame');
		}
		else addClass(this.cat == 'g' ? this.overlay : this.parts['title'], 'highFrame')
	}
	unhighFrame(pname = 'elem', elIfMiss = true) {
		let part = this._getPart(pname, elIfMiss);
		if (!part) return;
		if (this.isLine) this.removeClass(this.overlay, 'lineHighFrame');
		else if (this.isPicto) {
			this.removeClass(this.ground, 'high');
			//this.setTextFill(this.picto, this.orig.fg, 1);//.elem.addClass('high',this.ground); 
		} else if (this.isa.field) {
			this.removeClass(this.overlay, 'fieldHighFrame');
		} else removeClass(this.cat == 'g' ? this.overlay : this.parts['title'], 'highFrame')
		// removeClass('highFrame',this.cat=='g'?this.overlay:this.parts['title'])
		// if (this.cat == 'g') removeClass('highFrame',this.overlay);
		// else { let bg = part.bg; if (nundef(bg)) bg = null; part.style.backgroundColor = bg; }
	}
	unhighAll() { for (const k in this.parts) { this.unhigh(k); this.unhighFrame(k); this.unhighC(k); } }
	sel() { }
	unsel() { }
	frame() { }
	unframe() { }
	hide(pname = 'elem', elIfMiss = false) { let part = this._getPart(pname, elIfMiss); if (part) hide(part); }
	show(pname = 'elem', elIfMiss = false) { let part = this._getPart(pname, elIfMiss); if (part) show(part); }
	minimize() {
		//if this elem has a title, hide all other parts
		if ('title' in this.parts) {
			for (const k in this.parts) {
				if (k == 'elem' || k == 'title') continue;
				this.hide(k)
			}
			this.isMinimized = true;
		}
	}
	maximize() {
		if (this.isMinimized) {
			for (const k in this.parts) {
				if (k == 'elem' || k == 'title') continue;
				this.show(k)
			}
		}
		//show all parts
	}
	//#endregion

	//#region basic properties x,y,w,h,bg,fg
	resetBg() {
		if (this.orig.bg) {
			this.setBg(this.orig.bg);
		}
	}
	resetShape() {
		this.setShape(this.orig.shape);
	}
	resetSize() {
		this.setSize(this.originalSize.w, this.originalSize.h);
	}
	setBg(c, { updateFg = false, partName = 'elem' } = {}) {

		if (this.isLine) {
			this.bg = c;
			//console.log(this.parts);
			let el = this.elem;
			el.setAttribute('fill', c)
			el.setAttribute('stroke', c)
			//el.setAttribute('stroke-width', 20)
			el.style.stroke = c;
			//el.style.strokeWidth = "20px";
			//el.style.class=null;
			//el.setAttribute('class',null)
			for (const e of el.children) {
				//e.style.class=null;
				//e.setAttribute('class',null)
				e.setAttribute('stroke', c)
				//e.setAttribute('stroke-width', 20)
				e.setAttribute('fill', c);
				e.style.stroke = c;
				//e.style.strokeWidth = "20px";
				//console.log(e.style.class,e.getAttribute('stroke'),e.getAttribute('fill'))
				return this;
			}
		}

		let part = this.parts[partName];
		if (partName == 'elem') { this.bg = c; }
		part.bg = c;
		if (this.cat == 'g') {
			if (this.type == 'text') {
				if (!this.textBackground) {
					//get w,h
					//make rect under ground child
				}
				// give it color
			} else {
				this.elem.setAttribute('fill', c);
				// if (this.isLine) {
				// 	//console.log('line:',this.o.obj_type)
				// 	//this.setFg(c)
				// 	this.ground.setAttribute('stroke', c)
				// 	this.ground.setAttribute('fill', c)
				// }
			}
		} else {
			part.style.backgroundColor = c;
		}
		if (updateFg) {
			this.setFg(colorIdealText(c), { partName: partName });
		}
		return this;
	}
	setFg(c, { updateBg = false, partName = 'elem' } = {}) {
		let part = this.parts[partName];
		if (partName == 'elem') { this.fg = c; }
		part.fg = c;
		if (this.cat == 'g') {
			if (this.type == 'text') {
				this.elem.setAttribute('fill', c);
			} else {
				this.elem.setAttribute('stroke', c);
			}
		} else {
			part.style.color = c;
		}
		return this;
	}
	setFullSize() {
		//sets size to fill parent completely
		let parent = UIS[this.idParent]; if (nundef(parent)) return;
		this.setSize(parent.w, parent.h);
		this.setPos(0, 0);
	}
	setBounds(x, y, w, h, unit = '%') {
		//console.log('setBounds',x,y,w,h,unit)
		let el = this.elem;
		//console.log(el,this.idParent)
		// el.style.position = 'absolute';
		// el.style.left='100px';
		// el.style.top='100px';
		// el.style.width='100px';
		// el.style.height='100px';
		//TODO: compute size if unit is %
		this.setSize(w, h);
		this.setPos(x, y);
	}
	setColor(c) {
		//console.log('setColor',c)
		// this.elem.backgroundColor = 'red';//
		this.setBg(c);
	}
	setHeight(h) {
		this.elem.style.height = h + 'px'; this.h = h;
	}
	setSize(w, h) {
		//console.log('setSize',this.id,w,h)
		this.w = w; this.h = h;
		if (this.cat == 'g') {
			if (this.ground) {
				this.ground.setAttribute('width', w);
				this.ground.setAttribute('height', h);
			} else {
				this.elem.setAttribute('width', w);
				this.elem.setAttribute('height', h);
			}
			if (this.overlay) {
				this.overlay.setAttribute('width', w);
				this.overlay.setAttribute('height', h);
			}
		} else {
			this.elem.style.width = w + 'px';
			this.elem.style.height = h + 'px';
		}
		return this;
	}
	centerInDiv() {
		this.parent = UIS[this.idParent];

		if (isdef(this.parent)) {
			let d = this.elem;
			let divParent = this.parent.elem;
			let wParent = divParent.offsetWidth;

			//TODO this.cards has to be replaced by something else!!!!!!!!!!!!!!
			let cards = this.deck.cards;
			let wElem = cards.length > 0 ? cards[0].elem.offsetWidth : 78; //this.elem.offsetWidth;
			let hParent = divParent.offsetHeight;
			let hElem = cards.length > 0 ? cards[0].elem.offsetHeight : 110; //this.elem.offsetHeight;
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
		this.x = x; //centered for cat g, LT for html elements!
		this.y = y;
		if (this.cat == 'g') {
			this.elem.setAttribute('transform', `translate(${x},${y})`);
		} else {
			if (isdef(this.centerX)) {
				this.elem.style.left = '' + (this.centerX + x) + 'px';
				this.elem.style.top = '' + (this.centerY + y) + 'px';
			// } else if (this.isa.card) {
			// 	console.log('card pos set to',x,y)
			// 	//this.elem.style.transform = `translate(${x},${y})`;
			// 	this.elem.style.position = 'absolute';
			// 	this.elem.style.left = x + 'px';
			// 	this.elem.style.top = y + 'px';
			}else {
				this.elem.style.position = 'absolute';
				this.elem.style.left = x + 'px';
				this.elem.style.top = y + 'px';
			}
		}
		return this;
	}
	_modTransformBy(el, { x, y, scaleX, scaleY, rotDeg } = {}) {
		let info = getTransformInfo(el);
		console.log(info)
		let xNew, yNew, scaleXNew, scaleYNew, rotNew;
		if (isdef(x)) xNew = info.translateX + x; else xNew = info.translateX;
		if (isdef(y)) yNew = info.translateY + y; else yNew = info.translateY;
		if (isdef(scaleX)) scaleXNew = info.scaleX + scaleX; else scaleXNew = info.scaleX;
		if (isdef(scaleY)) scaleYNew = info.scaleY + scaleY; else scaleYNew = info.scaleY;
		if (isdef(rotDeg)) rotNew = info.rotation + rotDeg; else rotNew = info.rotation;
		let sTrans = ''; let sScale = ''; let sRot = '';
		if (xNew != 0 || yNew != 0) sTrans = `translate(${xNew},${yNew})`;
		if (scaleXNew != 1 || scaleYNew != 1) sScale = `scale(${scaleXNew},${scaleYNew})`;
		if (rotNew != 0) sRot = `rotation(${rotNew}deg)`;
		let s = (sTrans + ' ' + sScale + ' ' + sRot).trim();
		el.setAttribute("transform", s);

		//also set x y in case that has been mod!
	}
	_setTransform(el, { x, y, scaleX, scaleY, rotDeg } = {}) {
		//console.log('old transform:',el.getAttribute('transform'));
		let info = getTransformInfo(el);
		//console.log(info)
		let xNew, yNew, scaleXNew, scaleYNew, rotNew;
		if (isdef(x)) xNew = x; else xNew = info.translateX;
		if (isdef(y)) yNew = y; else yNew = info.translateY;
		if (isdef(scaleX)) scaleXNew = scaleX; else scaleXNew = info.scaleX;
		if (isdef(scaleY)) scaleYNew = scaleY; else scaleYNew = info.scaleY;
		if (isdef(rotDeg)) rotNew = rotDeg; else rotNew = info.rotation;
		let sTrans = ''; let sScale = ''; let sRot = '';
		if (xNew != 0 || yNew != 0) sTrans = `translate(${xNew} ${yNew})`;
		if (scaleXNew != 1 || scaleYNew != 1) sScale = `scale(${scaleXNew} ${scaleYNew})`;
		if (rotNew != 0) sRot = `rotate(${rotNew})`;
		let s = (sTrans + ' ' + sScale + ' ' + sRot).trim();
		//s+=' skewX(60)'
		//console.log('new transform:',s)
		el.setAttribute("transform", s);


	}
	setScale(scale, partName = 'elem') {
		let el = this.parts[partName];
		if (!el) return;
		//console.log(el);
		if (this.cat == 'd') el.style.transform = `scale(${scale})`;
		else this._setTransform(el, { x: this.x, y: this.y, scaleX: scale, scaleY: scale });
	}
	setShape(shape) {
		//replaces ground and overlay!
		if (nundef(this.ground)) {
			console.log('cannot replace shape because no this.ground');
			return;
		}
		let curShape = getTypeOf(this.ground);
		//console.log('setShape: current shape:',curShape);
		if (shape == 'circle') shape = 'ellipse';
		if (shape == 'square') shape = 'rect';
		if (curShape != shape) {
			//remove ground and overlay, replace them by new shape of same size!
			//console.log(this.ground);
			//console.log(this.overlay);

			let childNodes = [...this.elem.children];
			//console.log(typeof (childNodes), childNodes)
			let iGround = childNodes.indexOf(this.ground);
			//console.log('iGround', iGround);
			let iOverlay = childNodes.indexOf(this.overlay);
			//console.log('iOverlay', iOverlay);

			let fill = this.ground.getAttribute('fill');
			this.overlay = null;
			this.ground = null;
			this[shape]({ className: 'ground', w: this.w, h: this.h, fill: fill });

			let newGround = this.elem.children[this.len() - 1];
			this[shape]({ className: 'overlay', w: this.w, h: this.h });
			let newOverlay = this.elem.children[this.len() - 1];

			this.replaceChild(this.elem.childNodes[iGround], newGround);
			//			this.replaceChild(this.overlay,newOverlay);
			this.ground = newGround;
			this.replaceChild(this.elem.childNodes[iOverlay], newOverlay);
			//			this.overlay = newOverlay;
			//this.elem.removeChild(this.ground)
			//this.elem.removeChild(this.overlay)



		}
	}
	//#endregion

	//#region parts
	body(key='body',color){
		if (this.parts[key]) return;
		let t = document.createElement('div');
		t.style.padding = '4px 8px';
		let bg = color;
		this.elem.appendChild(t);
		this.parts[key] = t;
		//add these props to part:
		$(t).attrs({ name: key });
		if (isdef(bg)) this.setBg(bg, { updateFg: (color != 'dimgray'), partName: key });
		return this;

	}
	title(s, key = 'title', color = 'dimgray') {
		if (this.parts[key]) {
			//console.log('HALLLLLLLOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO', this.parts[key], this.elem); 
			this.parts[key].style.backgroundColor = randomColor();
			return;
		}
		let t = document.createElement('div');
		t.style.borderRadius = '6px';
		t.style.padding = '4px 8px';
		let bg = color;
		//t.style.backgroundColor = bg;
		t.classList.add('tttitle');
		t.innerHTML = s;
		this.elem.appendChild(t);
		this.parts[key] = t;
		//add these props to part:
		$(t).attrs({ name: key });//, bg: bg });
		this.setBg(bg, { updateFg: (color != 'dimgray'), partName: key });
		// t.name = key;
		// t.bg = t.style.backgroundColor;
		return this;
	}
	table(o, keys, key = 'table') {
		if (this.parts[key]) {
			let oldTable = this.parts[key];
			let t = tableElem(o, keys);
			let t2 = t.innerHTML;
			oldTable.innerHTML = t2;
		} else {
			let t = tableElem(o, keys);
			this.elem.appendChild(t);
			this.attach();
			this.parts[key] = t;
			t.name = key;
		}

		return this;
	}
	tableX(o, keys, key = 'table') {
		let replace = isdef(this.parts[key]);

		let res = tableElemX(o, keys);
		//console.log(res)
		let tNew = res.table;
		let rNew = res.refs.map(x => x.id);
		tNew.name = key;

		if (replace) {
			let oldTable = this.parts[key];
			let oldRefs = this.refs[key];
			//console.log(oldRefs);
			if (isdef(oldRefs)) {
				oldRefs.map(x => {
					//console.log('tableX',this.id,'deleting ref', x);
					deleteRSG(x);
				});
				delete this.refs[key];
			}
			oldTable.innerHTML = tNew.innerHTML;
		} else {
			this.elem.appendChild(tNew);
			this.attach();
			this.parts[key] = tNew;
		}

		if (!isEmpty(res)) {
			makeRefs(this.id, res.refs);
			this.refs[key] = rNew; //keep list of refs for key
			//console.log(this.id,key,this.refs[key])
		}
		return this;
	}
	tableY(o, keys, key = 'table') {
		let replace = isdef(this.parts[key]);

		let res = tableElemY(o, keys);
		//console.log(res)
		let tNew = res.table;
		let rNew = res.refs.map(x => x.id);
		tNew.name = key;

		if (replace) {
			let oldTable = this.parts[key];
			let oldRefs = this.refs[key];
			//console.log(oldRefs);
			if (isdef(oldRefs)) { oldRefs.map(x => deleteRSG(x)); delete this.refs[key]; }
			oldTable.innerHTML = tNew.innerHTML;
		} else {
			this.elem.appendChild(tNew);
			this.attach();
			this.parts[key] = tNew;
		}

		if (!isEmpty(res)) {
			makeRefs(this.id, res.refs);
			this.refs[key] = rNew; //keep list of refs for key
		}
		return this;
	}
	//#endregion

	//#region admin/general

	//attach/detach does NOT remove or add to MS parent, just its domel! (for former, use: switchParent NOT_IMPL)
	attach(partName) { 
		if (!this.isAttached) { 
			this.isAttached = true; 
			let parentMS = UIS[this.idParent];
			let parentElem = isdef(partName) && isdef(parentMS.parts[partName])?parentMS.parts[partName]:parentMS.elem;
			parentElem.appendChild(this.elem); 
		} 
		return this; 
	} //need to attach() elems that didnt exist OR are NOT g on div!!! in order fr them to appear on screen!
	detach(partName) { 
		if (this.isAttached) { 
			this.isAttached = false; 
			let parentMS = UIS[this.idParent];
			let parentElem = isdef(partName) && isdef(parentMS.parts[partName])?parentMS.parts[partName]:parentMS.elem;
			parentElem.removeChild(this.elem); 
			// UIS[this.idParent].elem.removeChild(this.elem); 
		} 
		return this; 
	}
	clear(startProps = {}) {
		//all children are destroyed: only destroys UI and removes from parent.children,
		//does destroy RSG objects of children or remove them from any lists/dictionaries such as UIS,IdOwner,id2uids....
		let ids = this.children.map(x => x);
		for (const id of ids) {
			//console.log('delete',id)
			deleteRSG(id);
		}
		clearElement(this.elem);
		for (const k in startProps) {
			this.elem[k] = startProps[k];
		}
		this.children = [];
		//console.log('children after clear', this.children);
	}
	destroy() {
		this.clear(); //first properly delete all children!
		$(this.elem).remove(); // removes element and all its handlers from UI
		this.elem = null;
		this.isAttached = false;
		let parent = UIS[this.idParent];
		removeInPlace(parent.children, this.id);
	}
	len() { return this.elem.children.length; }
	replaceChild(oldChild, newChild) {
		this.elem.insertBefore(newChild, oldChild);
		this.elem.removeChild(oldChild);
		//console.log(this.elem);
	}

	toString() { return 'id: ' + this.id + ', ' + this.domType + ', ' + this.x + ', ' + this.y + ', ' + this.w + ', ' + this.h + ', ' + this.bg + ', ' + this.fg + ', ' + this.children; }
	//#endregion
}

