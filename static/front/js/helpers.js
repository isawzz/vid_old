class TimeIt {
	constructor(msg) {
		this.init(msg);
		this.showOutput = true;
	}
	tacit() { this.showOutput = false; }
	timeStamp(name) {
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.namedTimestamps.start.getTime();// this.t.getTime();
		if (this.showOutput) console.log('___', tDiff, 'msecs * to', name);
		this.t = tNew;
		this.namedTimestamps[name] = tNew;
	}
	reset() { this.init('timing start') }
	init(msg) {
		this.t = new Date(); //new Date().getTime();
		//this.showOutput = true;
		if (this.showOutput) console.log('___', msg);
		this.namedTimestamps = { start: this.t };
	}
	showSince(name, msg = 'now') {
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tNamed = this.namedTimestamps[name];
		if (this.showOutput) if (!tNamed) { console.log(name, 'is not a timestamp!'); return; } //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - tNamed.getTime();
		if (this.showOutput) console.log('___', tDiff, 'msecs', name, 'to', msg);
		this.t = tNew;
	}
	format(t) { return '___' + t.getSeconds() + ':' + t.getMilliseconds(); }
	showTime(msg) {
		//shows ticks diff to last call of show
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.t.getTime();
		let tDiffStart = tNew.getTime() - this.namedTimestamps.start.getTime();
		if (this.showOutput) console.log(this.format(tNew), ':', tDiff, 'msecs to', msg, '(' + tDiffStart, 'total)');
		this.t = tNew;
	}
	start_of_cycle(msg) {
		this.init(msg);
	}
	end_of_cycle(msg) {
		//shows ticks diff to last call of show
		let tNew = new Date(); //new Date().getTime() - this.t;
		let tDiff = tNew.getTime() - this.t.getTime();
		let tDiffStart = tNew.getTime() - this.namedTimestamps.start.getTime();
		if (this.showOutput) console.log('___ ' + tDiff + ' msecs', msg, 'to EOC (total: ' + tDiffStart + ')');
	}
}
//#region colors
var colorDict = null; //for color names, initialized when calling anyColorToStandardStyle first time
function anyColorToStandardString(cAny, a, allowHsl = false) {
	//if allowHsl is false: only return rgb,rgba,or hex7,hex9 string! >pBSC algo!!!
	//if a is undefined, leaves a as it is in cAny, otherwise modifies to a
	if (Array.isArray(cAny)) {
		// cAny is rgb array
		if (cAny.length < 3) {
			return randomHexColor();
		} else if (cAny.length == 3) {
			//assume this is a rgb
			let r = cAny[0];
			let g = cAny[1];
			let b = cAny[2];
			return a == undefined || a == 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
		}
	} else if (isString(cAny)) {
		if (cAny[0] == '#') {
			if (a == undefined) return cAny;
			cAny = cAny.substring(0, 7);
			return cAny + (a == 1 ? '' : alphaToHex(a));
		} else if (cAny[0] == 'r' && cAny[1] == 'g') {
			if (a == undefined) return cAny;
			//this is rbg or rgba string
			if (cAny[3] == 'a') {
				//rgba string!
				//console.log('its an rgba string!!!!!');
				if (a < 1) {
					return stringBeforeLast(cAny, ',') + ',' + a + ')';
				} else {
					let parts = cAny.split(',');
					let r = firstNumber(parts[0]);
					return 'rgb(' + r + ',' + parts[1] + ',' + parts[2] + ')';
				}
			} else {
				// simple rgb string
				if (a < 1) {
					//console.log(cAny.length)
					return 'rgba' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				} else {
					return cAny;
				}
			}
		} else if (cAny[0] == 'h' && cAny[1] == 's') {
			//hsl or hsla string
			//if hsla and hsla allowed do same as for rgba
			if (allowHsl) {
				if (a == undefined) return cAny;
				if (cAny[3] == 'a') {
					if (a < 1) {
						return stringBeforeLast(cAny, ',') + ',' + a + ')';
					} else {
						let parts = cAny.split(',');
						let r = firstNumber(parts[0]);
						return 'hsl(' + r + ',' + parts[1] + ',' + parts[2] + ')';
					}
				} else {
					//simple hsl string
					return a == 1 ? cAny : 'hsla' + cAny.substring(3, cAny.length - 1) + ',' + a + ')'; //cAny.substring(0,cAny.length-1) + ',' + a + ')';
				}
			} else {
				//convert hsl(a) into rgb(a)
				if (cAny[3] == 'a') {
					cAny = HSLAToRGBA(cAny);
				} else {
					cAny = HSLToRGB(cAny);
				}
				return anyColorToStandardString(cAny, a, allowHsl);
			}
		} else {
			//cAny is color name
			let newcAny = colorNameToHex(cAny);
			//console.log(cAny,newcAny);
			return anyColorToStandardString(newcAny, a, allowHsl);
		}
	} else if (typeof cAny == 'object') {
		//console.log('anyColorToStandardString: cAny is object!!!', cAny);
		//koennte {h: ,s: , l:} oder {r: ,g: ,b:} sein
		if ('h' in cAny) {
			//hsl object
			let hslString = '';
			if (a == undefined || a == 1) {
				hslString = `hsl(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%)`;
			} else {
				hslString = `hsla(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%,${a})`;
			}
			if (allowHsl) {
				return hslString;
			} else {
				return anyColorToStandardString(hslString, a, allowHsl);
			}
		} else if ('r' in cAny) {
			//rgb object
			if (a !== undefined && a < 1) {
				return `rgba(${cAny.r},${cAny.g},${cAny.b},${a})`;
			} else {
				return `rgb(${cAny.r},${cAny.g},${cAny.b})`;
			}
		}
	}
} //ok
function alphaToHex(zero1) {
	zero1 = Math.round(zero1 * 100) / 100;
	var alpha = Math.round(zero1 * 255);
	var hex = (alpha + 0x10000)
		.toString(16)
		.substr(-2)
		.toUpperCase();
	var perc = Math.round(zero1 * 100);
	//console.log('alpha from', zero1, 'to', hex);
	return hex;
} //ok
function colorBlend(zero1, c0, c1, log = true) {
	c0 = anyColorToStandardString(c0);
	c1 = anyColorToStandardString(c1);
	return pSBC(zero1, c0, c1, log);
} //ok
function colorShade(plusMinus1, color, log = true) {
	let c = anyColorToStandardString(color);
	return pSBC(plusMinus1, c, undefined, !log);
} //ok
function colorTrans(cAny, alpha = 0.5) {
	return anyColorToStandardString(cAny, alpha);
}
function colorIdealText(bg, grayPreferred = false) {
	let rgb = colorRGB(bg, true);
	//jetzt ist bg rgb object
	const nThreshold = 105; //40; //105;
	let r = rgb.r;
	let g = rgb.g;
	let b = rgb.b;
	var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
	var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
	if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
	return foreColor;
	// return 'white';
}
function colorFromHue(h, s = 100, l = 50, asObject = false) {
	if (asObject) return { h: h, s: s, l: l }; else return `hsl(${h},${s},${l})`;
}
function colorLighter(c, zero1 = .2, log = true) {
	c = anyColorToStandardString(c);
	return pSBC(zero1, c, undefined, !log);
} //ok
function colorDarker(c, zero1 = .8, log = true) {
	//1 is darkest,0 is orig color
	c = anyColorToStandardString(c);
	return pSBC(-zero1, c, undefined, !log);
} //ok
function colorHex(cAny) {
	//returns hex string w/ alpha channel or without
	let c = anyColorToStandardString(cAny);
	if (c[0] == '#') {
		return c;
	} else {
		//it is now an rgba string and has alpha
		let res = pSBC(0, c, 'c');
		//console.log('in colorHex!!!!', c, res);
		return res;
	}
} //ok
function colorHSL(cAny, asObject = false) {
	//returns { h:[0,360], s:[0,1], l:[0,1]}
	let res = anyColorToStandardString(cAny, undefined, true);
	//console.log(res)
	let shsl = res;
	if (res[0] == '#') {
		//res is a hex string
		if (res.length == 9) {
			shsl = hexAToHSLA(res);
		} else if (res.length == 7) {
			shsl = hexToHSL(res);
		}
	} else if (res[0] == 'r') {
		if (res[3] == 'a') {
			shsl = RGBAToHSLA(res);
		} else {
			shsl = RGBToHSL(res);
		}
	}
	//console.log(shsl);
	let n = allNumbers(shsl);
	//console.log(n);
	if (asObject) {
		return { h: n[0], s: n[1] / 100, l: n[2] / 100, a: n.length > 3 ? n[3] : 1 };
	} else {
		return shsl;
	}
} //ok
function colorHue(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.h;
} //ok
function colorLum(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.l;
} //ok
function colorSat(cAny) {
	let hsl = colorHSL(cAny, true);
	return hsl.s;
} //ok
function colorA(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.a;
} //ok
function colorR(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.r;
} //ok
function colorG(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.g;
} //ok
function colorB(cAny) {
	let rgb = colorRGB(cAny, true);
	return rgb.b;
} //ok
function colorRGB(cAny, asObject = false) {
	//returns { r:[0,255], g:[0,255], b:[0,255]}
	let res = anyColorToStandardString(cAny);
	let srgb = res;
	if (res[0] == '#') {
		srgb = pSBC(0, res, 'c');
	}
	//console.log(shsl);
	let n = allNumbers(srgb);
	//console.log(n);
	if (asObject) {
		return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
	} else {
		return srgb;
	}
} //ok
function colorNameToHex(cName) {
	let key = cName.toLowerCase();
	if (!colorDict) {
		colorDict = {};
		let names = getColorNames();
		let hexes = getColorHexes();
		for (let i = 0; i < names.length; i++) {
			colorDict[names[i].toLowerCase()] = '#' + hexes[i];
		}
	}
	return key in colorDict ? colorDict[key] : randomHexColor();
} //ok
function colorPalShade(color) {
	//assumes pSBC compatible color format (hex,rgb strings)
	let res = [];
	for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
		//darkest -0.8 -0.6 -0.4 -0.2 0=color 0.2 0.4 0.6 0.8 lightest
		let c = pSBC(frac, color, undefined, true); //colorShade(frac,color);
		res.push(c);
	}
	return res;
}
function getColorNames() {
	return [
		'AliceBlue',
		'AntiqueWhite',
		'Aqua',
		'Aquamarine',
		'Azure',
		'Beige',
		'Bisque',
		'Black',
		'BlanchedAlmond',
		'Blue',
		'BlueViolet',
		'Brown',
		'BurlyWood',
		'CadetBlue',
		'Chartreuse',
		'Chocolate',
		'Coral',
		'CornflowerBlue',
		'Cornsilk',
		'Crimson',
		'Cyan',
		'DarkBlue',
		'DarkCyan',
		'DarkGoldenRod',
		'DarkGray',
		'DarkGrey',
		'DarkGreen',
		'DarkKhaki',
		'DarkMagenta',
		'DarkOliveGreen',
		'DarkOrange',
		'DarkOrchid',
		'DarkRed',
		'DarkSalmon',
		'DarkSeaGreen',
		'DarkSlateBlue',
		'DarkSlateGray',
		'DarkSlateGrey',
		'DarkTurquoise',
		'DarkViolet',
		'DeepPink',
		'DeepSkyBlue',
		'DimGray',
		'DimGrey',
		'DodgerBlue',
		'FireBrick',
		'FloralWhite',
		'ForestGreen',
		'Fuchsia',
		'Gainsboro',
		'GhostWhite',
		'Gold',
		'GoldenRod',
		'Gray',
		'Grey',
		'Green',
		'GreenYellow',
		'HoneyDew',
		'HotPink',
		'IndianRed',
		'Indigo',
		'Ivory',
		'Khaki',
		'Lavender',
		'LavenderBlush',
		'LawnGreen',
		'LemonChiffon',
		'LightBlue',
		'LightCoral',
		'LightCyan',
		'LightGoldenRodYellow',
		'LightGray',
		'LightGrey',
		'LightGreen',
		'LightPink',
		'LightSalmon',
		'LightSeaGreen',
		'LightSkyBlue',
		'LightSlateGray',
		'LightSlateGrey',
		'LightSteelBlue',
		'LightYellow',
		'Lime',
		'LimeGreen',
		'Linen',
		'Magenta',
		'Maroon',
		'MediumAquaMarine',
		'MediumBlue',
		'MediumOrchid',
		'MediumPurple',
		'MediumSeaGreen',
		'MediumSlateBlue',
		'MediumSpringGreen',
		'MediumTurquoise',
		'MediumVioletRed',
		'MidnightBlue',
		'MintCream',
		'MistyRose',
		'Moccasin',
		'NavajoWhite',
		'Navy',
		'OldLace',
		'Olive',
		'OliveDrab',
		'Orange',
		'OrangeRed',
		'Orchid',
		'PaleGoldenRod',
		'PaleGreen',
		'PaleTurquoise',
		'PaleVioletRed',
		'PapayaWhip',
		'PeachPuff',
		'Peru',
		'Pink',
		'Plum',
		'PowderBlue',
		'Purple',
		'RebeccaPurple',
		'Red',
		'RosyBrown',
		'RoyalBlue',
		'SaddleBrown',
		'Salmon',
		'SandyBrown',
		'SeaGreen',
		'SeaShell',
		'Sienna',
		'Silver',
		'SkyBlue',
		'SlateBlue',
		'SlateGray',
		'SlateGrey',
		'Snow',
		'SpringGreen',
		'SteelBlue',
		'Tan',
		'Teal',
		'Thistle',
		'Tomato',
		'Turquoise',
		'Violet',
		'Wheat',
		'White',
		'WhiteSmoke',
		'Yellow',
		'YellowGreen'
	];
} //ok
function getColorHexes(x) {
	return [
		'f0f8ff',
		'faebd7',
		'00ffff',
		'7fffd4',
		'f0ffff',
		'f5f5dc',
		'ffe4c4',
		'000000',
		'ffebcd',
		'0000ff',
		'8a2be2',
		'a52a2a',
		'deb887',
		'5f9ea0',
		'7fff00',
		'd2691e',
		'ff7f50',
		'6495ed',
		'fff8dc',
		'dc143c',
		'00ffff',
		'00008b',
		'008b8b',
		'b8860b',
		'a9a9a9',
		'a9a9a9',
		'006400',
		'bdb76b',
		'8b008b',
		'556b2f',
		'ff8c00',
		'9932cc',
		'8b0000',
		'e9967a',
		'8fbc8f',
		'483d8b',
		'2f4f4f',
		'2f4f4f',
		'00ced1',
		'9400d3',
		'ff1493',
		'00bfff',
		'696969',
		'696969',
		'1e90ff',
		'b22222',
		'fffaf0',
		'228b22',
		'ff00ff',
		'dcdcdc',
		'f8f8ff',
		'ffd700',
		'daa520',
		'808080',
		'808080',
		'008000',
		'adff2f',
		'f0fff0',
		'ff69b4',
		'cd5c5c',
		'4b0082',
		'fffff0',
		'f0e68c',
		'e6e6fa',
		'fff0f5',
		'7cfc00',
		'fffacd',
		'add8e6',
		'f08080',
		'e0ffff',
		'fafad2',
		'd3d3d3',
		'd3d3d3',
		'90ee90',
		'ffb6c1',
		'ffa07a',
		'20b2aa',
		'87cefa',
		'778899',
		'778899',
		'b0c4de',
		'ffffe0',
		'00ff00',
		'32cd32',
		'faf0e6',
		'ff00ff',
		'800000',
		'66cdaa',
		'0000cd',
		'ba55d3',
		'9370db',
		'3cb371',
		'7b68ee',
		'00fa9a',
		'48d1cc',
		'c71585',
		'191970',
		'f5fffa',
		'ffe4e1',
		'ffe4b5',
		'ffdead',
		'000080',
		'fdf5e6',
		'808000',
		'6b8e23',
		'ffa500',
		'ff4500',
		'da70d6',
		'eee8aa',
		'98fb98',
		'afeeee',
		'db7093',
		'ffefd5',
		'ffdab9',
		'cd853f',
		'ffc0cb',
		'dda0dd',
		'b0e0e6',
		'800080',
		'663399',
		'ff0000',
		'bc8f8f',
		'4169e1',
		'8b4513',
		'fa8072',
		'f4a460',
		'2e8b57',
		'fff5ee',
		'a0522d',
		'c0c0c0',
		'87ceeb',
		'6a5acd',
		'708090',
		'708090',
		'fffafa',
		'00ff7f',
		'4682b4',
		'd2b48c',
		'008080',
		'd8bfd8',
		'ff6347',
		'40e0d0',
		'ee82ee',
		'f5deb3',
		'ffffff',
		'f5f5f5',
		'ffff00',
		'9acd32'
	];
} //ok
function getPalette(color, type = 'shade') {
	color = anyColorToStandardString(color);
	return colorPalShade(color);
}
function HSLAToRGBA(hsla, isPct) {
	//if isPct == true, will output 'rgb(xx%,xx%,xx%)' umgerechnet in % von 255
	let ex = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(hsla)) {
		let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
		hsla = hsla
			.substr(5)
			.split(')')[0]
			.split(sep);

		// strip the slash if using space-separated syntax
		if (hsla.indexOf('/') > -1) hsla.splice(3, 1);

		isPct = isPct === true;

		// must be fractions of 1
		let h = hsla[0],
			s = hsla[1].substr(0, hsla[1].length - 1) / 100,
			l = hsla[2].substr(0, hsla[2].length - 1) / 100,
			a = hsla[3];

		// strip label and convert to degrees (if necessary)
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;

		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;

		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}

		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);

		let pctFound = a.indexOf('%') > -1;

		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
			if (!pctFound) {
				a *= 100;
			} else {
				a = a.substr(0, a.length - 1);
			}
		} else if (pctFound) {
			a = a.substr(0, a.length - 1) / 100;
		}

		return 'rgba(' + (isPct ? r + '%,' + g + '%,' + b + '%,' + a + '%' : +r + ',' + +g + ',' + +b + ',' + +a) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function hslToHslaString(h, s, l, a = 1) {
	// hsl is object
	return 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
}
function pSBC(p, c0, c1, l) {
	//usage:
	// (blacken) -1.0 <= p <= 1.0 (whiten), or (c0) 0 <= p <= 1.0 (c1) when blending (ie., c1 given)
	// c0: #F3D or #F3DC or #FF33DD or #FF33DDCC or rgb(23,4,55) or rgba(23,4,55,0.52) ... from color
	// c1: #F3D or #F3DC or #FF33DD or #FF33DDCC or rgb(23,4,55) or rgba(23,4,55,0.52) ... to color (blending)
	// 		or 'c' for conversion between hex string and rgb string
	// l true:log blending, [false:linear blending]=default!
	let r,
		g,
		b,
		P,
		f,
		t,
		h,
		i = parseInt,
		m = Math.round,
		a = typeof c1 == 'string';
	if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
	if (!this.pSBCr)
		this.pSBCr = d => {
			let n = d.length,
				x = {};
			if (n > 9) {
				([r, g, b, a] = d = d.split(',')), (n = d.length);
				if (n < 3 || n > 4) return null;
				(x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = i(g)), (x.b = i(b)), (x.a = a ? parseFloat(a) : -1);
			} else {
				if (n == 8 || n == 6 || n < 4) return null;
				if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
				d = i(d.slice(1), 16);
				if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
				else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
			}
			return x;
		};
	(h = c0.length > 9),
		(h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
		(f = pSBCr(c0)),
		(P = p < 0),
		(t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }),
		(p = P ? p * -1 : p),
		(P = 1 - p);
	if (!f || !t) return null;
	if (l) (r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b));
	else (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)), (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)), (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
	(a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
	if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
	else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
} //ok SUPER COOL!!!!
//#endregion

//#region CSS helpers
function addClass(el, clName) { if (!el) return; el.classList.add(clName); }
function getClass(el) { return el.classList.value; }//getAttribute('class'); }
function removeClass(el, clName) { if (!el) return; el.classList.remove(clName); }
function setCSSVariable(varName, val) {
	let root = document.documentElement;
	root.style.setProperty(varName, val);
}
//#endregion

//#region DOM: creating divs: 2020

function addDivU({ id, dParent, w, h, unit, fg, bg, position, x, y, html, className, styleStr, border, rounding, gap, margin, padding, float, textAlign, fz }) {
	let d1 = document.createElement('div');
	if (isdef(dParent)) dParent.appendChild(d1); else dParent = null;
	if (isdef(id)) d1.id = id;
	if (isdef(fg)) d1.style.setProperty('color', fg);
	if (isdef(bg)) d1.style.setProperty('background-color', bg);
	if (isdef(html)) d1.innerHTML = html;

	//size and position
	//positioning with gap: x,y,w,h MUST be numbers for this to work!
	if (gap > 0 && (unit == '%' || dParent && isdef(dParent.offsetWidth) && isdef(dParent.offsetHeight))) {
		//check if this div touches right border of parent
		let wCont = unit == '%' ? 100 : dParent.offsetWidth;
		let isRight = x + w >= wCont;
		let hCont = unit == '%' ? 100 : dParent.offsetHeight;
		let isBottom = y + h >= hCont;
		//console.log(wCont, 'isRight', isRight);
		//console.log(hCont, 'isBottom', isBottom);
		x += gap;
		y += gap;
		w -= (isRight ? 2 : 1) * gap;
		h -= (isBottom ? 2 : 1) * gap;
	}

	if (nundef(unit)) unit = '%';
	if (isdef(w)) d1.style.setProperty('width', makeUnitString(w, unit));
	if (isdef(h)) d1.style.setProperty('height', makeUnitString(h, unit));
	if (isdef(x) || isdef(y)) { posXY(d1, dParent, x, y, unit, position); }
	if (isdef(className)) d1.classList.add(className);
	if (isdef(styleStr)) d1.style.cssText += styleStr;
	if (isdef(border)) {
		d1.style.border = border;
		if (isdef(rounding)) d1.style.borderRadius = rounding;
	}
	if (isdef(margin)) d1.style.setProperty('margin', makeUnitString(margin, 'px'));
	if (isdef(padding)) d1.style.setProperty('padding', makeUnitString(padding, 'px'));
	if (float) d1.style.float = float;
	if (textAlign) d1.style.textAlign = textAlign;
	if (isdef(fz)) d1.style.setProperty('fontSize', makeUnitString(fz, 'px'));

	return d1;
}
//code 2020
function addDivToBody(w = 100, h = 100, unit = '%', bg = 'blue') { return addDivU({ dParent: document.body, w: w, h: h, unit: unit, bg: bg }); }
function addDivTo(dParent, w = 100, h = 100, unit = '%', bg = 'blue') { return addDivU({ dParent: dParent, w: w, h: h, unit: unit, bg: bg }); }
function addDivPosTo(dParent, x = 0, y = 0, w = 100, h = 100, unit = '%', bg = 'blue', position = 'absolute') {
	return addDivU({ dParent: dParent, x: x, y: y, w: w, h: h, unit: unit, position: position, bg: bg });
}
//code 2019
function addDiv(dParent, { html, w = '100%', h = '100%', bg, fg, border, rounding, margin, padding, float, position, x, y, textAlign, fontSize }) {
	return addDivU({ dParent: dParent, html: html, w: w, h: h, bg: bg, fg: fg, border: border, rounding: rounding, margin: margin, padding: padding, float: float, position: position, x: x, y: y, textAlign: textAlign, fz: fontSize });
}
function addDivPosGap(dParent, x, y, w, h, { gap, bg, fg, border, rounding, textAlign, fontSize, position = 'absolute' } = {}) {
	return addDivU({ dParent: dParent, x: x, y: y, w: w, h: h, gap: gap, bg: bg, fg: fg, border: border, textAlign: textAlign, fz: fontSize, position: position });
}
function addStyledDiv(dParent, id, html, styleString) { return addDivU({ dParent: dParent, id: id, html: html, styleStr: styleString }); }
function addDivClass(dParent, id, className) { return addDivU({ dParent: dParent, id: id, className: className }); }
function addDivFill(id, dParent) { return addDivU({ dParent: dParent, id: id, w: '100%', h: '100%' }); }
function addDivFullClass(dParent, id, className) { return addDivU({ dParent: dParent, id: id, w: '100%', h: '100%', className: className }); }
//flex-grid class must exist!
function addFlexGridDiv(dParent) { return addDivU({ dParent: dParent, className: 'flex-grid' }); }

//#endregion

//#region DOM: creating g elements
function addGFill(id, divParent) { return addSvgg(divParent, id, { originInCenter: true }); }

function addSvgg(dParent, gid, { w = '100%', h = '100%', bg, fg, originInCenter = false } = {}) {
	//div dParent gets an svg and inside a g, returns g
	let svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg1.setAttribute('width', w);
	svg1.setAttribute('height', h);
	let style = 'margin:0;padding:0;position:absolute;top:0px;left:0px;';
	if (bg) style += 'background-color:' + bg;
	svg1.setAttribute('style', style);
	dParent.appendChild(svg1);

	let g1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	g1.id = gid;
	svg1.appendChild(g1);
	// if (originInCenter) { g1.style='transform:translate(50%, 50%)'; } //works!
	// if (originInCenter) { g1.setAttribute('class', 'gCentered'); } //works! but: relies on class gCentered
	if (originInCenter) { g1.style.transform = "translate(50%, 50%)"; } //works!

	return g1;
}

//#endregion

//#region DOM: coordinate and bounds helpers
function myFunction(){
	console.log('onresize!!!');
	//for(const id of [])
}
function actualWidth(elem){ return Math.round(getBounds(elem).width);}
function actualHeight(elem){ return Math.round(getBounds(elem).height);}
function actualLeft(elem,relToParent=false,elRelTo){ return Math.round(getBounds(elem,relToParent,elRelTo).left);}
function actualTop(elem,relToParent=false,elRelTo){ return Math.round(getBounds(elem,relToParent,elRelTo).top);}
function actualCenter(elem,relToParent=false,elRelTo){ 
	let b = getBounds(elem,relToParent,elRelTo);
	return {x:Math.round(b.left+b.width/2),y:Math.round(b.top+b.height/2)};
}
function getRelBounds(elem, elRel) {
	let b1 = elem.getBoundingClientRect();
	if (!elRel) return b1;
	let b2 = elRel.getBoundingClientRect();
	return {
		x: b1.x - b2.x,
		y: b1.y - b2.y,
		left: b1.left - b2.left,
		top: b1.top - b2.top,
		right: b1.right - b2.right,
		bottom: b1.bottom - b2.bottom,
		width: b1.width,
		height: b1.height
	};
}
function getBounds(elem, relToParent = false, relativeToElem) {
	if (relToParent) return getRelBounds(elem, getParent(elem));
	else if (isdef(relativeToElem)) return getRelBounds(elem, relativeToElem);
	else return elem.getBoundingClientRect();
}
function getRelCoords(ev, elem) {
	let x = ev.pageX - elem.offset().left;
	let y = ev.pageY - elem.offset().top;
	//console.log('coords rel to',elm,':',x,y);
	return { x: x, y: y };
}
function getTextWidth(text, font) {
	// re-use canvas object for better performance
	var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
	var context = canvas.getContext('2d');
	context.font = font;
	var metrics = context.measureText(text);
	return metrics.width;
}

//#endregion

//#region DOM: drag drop

//dd helpers
function findDragTarget(ev) {
	let targetElem = ev.target;
	while (!targetElem.ondragover) targetElem = targetElem.parentNode;
	return targetElem;
}
function setDropPosition(ev, elem, targetElem, dropPos) {
	if (dropPos == 'mouse') {
		var elm = $(targetElem);
		x = ev.pageX - elm.offset().left - dragStartOffset.x;
		y = ev.pageY - elm.offset().top - dragStartOffset.y;
		posXY(elem, targetElem, x, y);
	} else if (dropPos == 'none') {
		//position same as in previous container
		return;
	} else if (dropPos == 'center') {
		// do I need to remove all pos info from element??? YES!!!
		elem.style.position = elem.style.left = elem.style.top = '';
		elem.classList.add('centered');
	} else if (dropPos == 'centerCentered') {
		elem.style.position = elem.style.left = elem.style.top = '';
		elem.classList.add('centerCentered');
	} else {
		dropPos(ev, elem, targetElem); // dropPos can be a function!!!
	}

}

//dd core
var dragStartOffset;
var draggedElement;

//can be overruled by draggedElem.dropPosition
var dropPosition = 'none'; // none | mouse | center | centerCentered | function(ev,elem,target)

//simple drag drop (makeDraggable, makeDroppable)
function allowDrop(ev) { ev.preventDefault(); }
function drag(ev) {
	let elem = ev.target;
	dragStartOffset = getRelCoords(ev, $(elem));
	draggedElement = elem;
}
function drop(ev) {
	ev.preventDefault();
	let targetElem = findDragTarget(ev); //drop on target, not a child of it!!!
	targetElem.appendChild(draggedElement);
	setDropPosition(ev, draggedElement, targetElem, isdef(draggedElement.dropPosition) ? draggedElement.dropPosition : dropPosition);
}
function makeDraggable(elem, dropPos) {
	elem.draggable = true;
	elem.ondragstart = drag;
	if (isdef(dropPos)) elem.dropPosition = dropPos;
}
function makeDroppable(target) {
	target.ondragover = allowDrop;
	target.ondrop = drop;
}

//#endregion

//#region DOM: hierarchy, parent, children...
function clearElement(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (window.jQuery == undefined) { elem.innerHTML = ''; return elem; }
	while (elem.firstChild) {
		$(elem.firstChild).remove();
	}
	return elem;
}
function clearInit(elem, startProps = {}) {
	clearElement(elem);
	for (const k in startProps) { elem[k] = startProps[k]; }
}

function clearElementFromChildIndex(elem, idx = 0) {
	let charr = arrChildren(elem).slice(idx);
	for (const ch of charr) {
		elem.removeChild(ch);
	}
}
function getParent(elem) { return elem.parentElement; }
function getChildren(elem) { return [...elem.children]; }
function closestParent(elem, selector) {
	for (; elem && elem !== document; elem = elem.parentNode) {
		if (elem.matches(selector)) return elem;
	}
	return null;
}
function findDOMAncestorOfType(elem, t = 'div') {
	let anc = elem.parentNode;
	while (MSCATS[getTypeOf(anc)] != t) { anc = anc.parentNode; }
	this.ancestor = anc;
}
function findDescendantWithId(id, parent) {
	if (parent.id == id) return parent;
	let children = arrChildren(parent);
	if (isEmpty(children)) return null;
	for (const ch of children) {
		let res = findDescendantWithId(id, ch);
		if (res) return res;
	}
	return null;
}
function findChildWithId(id, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (ch.id == id) return ch;
	}
	return null;
}
function findChildWithClass(className, parentElem) {
	testHelpers(parentElem);
	let children = arrChildren(parentElem);
	for (const ch of children) {
		//console.log('....findChildWithClass', ch, ch.classList, className)
		if (ch.classList.includes(className)) return ch;
	}
	return null;
}
function findChildOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	for (const ch of children) {
		if (getTypeOf(ch) == type) return ch;
	}
	return null;
}
function findChildrenOfType(type, parentElem) {
	let children = arrChildren(parentElem);
	let res = [];
	for (const ch of children) {
		if (getTypeOf(ch) == type) res.push(ch);
	}
	return res;
}
function findParentWithId(elem) {
	//testHelpers(elem);
	while (elem && !elem.id) {
		elem = elem.parentNode;
	}
	//testHelpers("parent with id: ", elem);
	return elem;
}
//#endregion

//#region DOM: positioning divs w/  inline-block
function posCenterInCenter(d) { d.classList.add('centerCentered'); }
function posTopLeftInCenter(d) { d.classList.add('centered'); }
function posXY(d1, dParent, x, y, unit = 'px', position = 'absolute') {
	if (nundef(position)) position = 'absolute';
	if (dParent && !dParent.style.position) dParent.style.setProperty('position', 'relative');
	d1.style.setProperty('position', position);
	if (isdef(x)) d1.style.setProperty('left', makeUnitString(x, unit));
	if (isdef(y)) d1.style.setProperty('top', makeUnitString(y, unit));
}
function posCenterInCenter(d) { d.classList.add('centerCentered'); }
function posCenterInCenter(d) { d.classList.add('centerCentered'); }
function posOverlap(d1, dParent, dx, dy, propName) {
	//depending on how many children ch with ch[propName]==d1[propName] dParent has, 
	// set position of d1 to next position shifted by dx,dy
	let chType = d1[propName];
	//console.log(dParent.children, typeof dParent.children)
	let numChildrenOfTarget = [...dParent.children].filter(x => x.type == chType).length - 1;
	//console.log(dParent, 'has', numChildrenOfTarget, 'children of type', chType);
	posXY(d1, dParent, numChildrenOfTarget * dx, numChildrenOfTarget * dy, unit = 'px', position = 'absolute');

}
//#endregion

//#region DOM: styles, visibility
function disableStyle(id) {
	if (isString(id)) id = document.getElementById(id);
	id.style.pointerEvents = 'none';
	id.style.opacity = .5;
	id.style.cursor = 'none';
}
function enableStyle(id) {
	if (isString(id)) id = document.getElementById(id);
	id.style.pointerEvents = null;
	id.style.opacity = 1;
	id.style.cursor = 'pointer';
}
function hide(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:hidden;display:none');
	} else {
		elem.style.display = 'none';
	}
}
function isVisible(elem) { // Where el is the DOM element you'd like to test for visibility
	return (elem.offsetParent !== null)
}
function show(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:visible');
	} else {
		elem.style.display = null;
	}
}

//#endregion

//#region file IO
function loadScript(path, callback) {
	var script = document.createElement('script');
	script.onload = function () {
		if (callback) callback(path);
	};
	script.src = path;
	document.head.appendChild(script);
}
function loadStyle(href, callback) {
	let style = document.createElement('link');
	style.rel = href == 'favicon' ? 'shortcut icon' : 'stylesheet';
	style.onload = function () {
		if (callback) callback(href);
	};
	style.href = href;
	document.head.appendChild(style);
}
function loadText(path, callback) {
	$.ajax({
		url: path,
		type: 'GET',
		success: response => {
			//console.log(response);
			if (callback) {
				callback(response);
			}
		},
		error: err => {
			error(err);
		}
	});
	return 'ok';
}
function loadYML(path, callback) {
	res = undefined;
	$.get(path) // eg. '/common/resources/LessonContentsLv01Ln01.yml'
		.done(function (data) {
			var yml = jsyaml.load(data);
			var jsonString = JSON.stringify(data);
			var json = $.parseJSON(jsonString);
			callback(yml);
		});
}
function saveFile(name, type, data) {
	// Function to download data to a file
	//usage:
	// json_str = JSON.stringify(G);
	// saveFile("yourfilename.json", "data:application/json", new Blob([json_str], {type: ""}));

	if (data != null && navigator.msSaveBlob) return navigator.msSaveBlob(new Blob([data], { type: type }), name);

	var a = $("<a style='display: none;'/>");
	var url = window.URL.createObjectURL(new Blob([data], { type: type }));
	a.attr('href', url);
	a.attr('download', name);
	$('body').append(a);
	a[0].click();
	setTimeout(function () {
		// fixes firefox html removal bug
		window.URL.revokeObjectURL(url);
		a.remove();
	}, 500);
}
//#endregion

//#region functions
function getFunctionCallerName() {
	// gets the text between whitespace for second part of stacktrace
	return new Error().stack.match(/at (\S+)/g)[1].slice(3);
}
function getFunctionsNameThatCalledThisFunction() {
	return getFunctionsNameThatCalledThisFunction.caller.caller.name;
}
//#endregion

//#region geo helpers
function toRadian(deg) { return deg * 2 * Math.PI / 360; }
function correctPolys(polys, approx = 10) {
	//console.log('citySize', citySize, 'approx', approx);
	let clusters = [];
	for (const p of polys) {
		//console.log(p.map(pt => '(' + pt.x + ',' + pt.y + ') ').toString());
		for (const pt of p) {
			let found = false;
			for (const cl of clusters) {
				for (const v of cl) {
					let dx = Math.abs(v.x - pt.x);
					let dy = Math.abs(v.y - pt.y);
					//console.log('diff', dx, dy);
					if (dx < approx && dy < approx) {
						//console.log('FOUND X!!!', dx,dy);
						cl.push(pt);
						found = true;
						break;
					}
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				clusters.push([pt]);
			}
		}
	}

	//now all points of all polys are in clusters
	//go through clusters, computer mean for all points in a clusters
	let vertices = [];
	for (const cl of clusters) {
		let sumx = 0;
		let sumy = 0;
		let len = cl.length;
		for (const pt of cl) {
			sumx += pt.x;
			sumy += pt.y;
		}
		vertices.push({ x: Math.round(sumx / len), y: Math.round(sumy / len) });
	}

	for (const p of polys) {
		for (const pt of p) {
			let found = false;
			for (const v of vertices) {
				let dx = Math.abs(v.x - pt.x);
				let dy = Math.abs(v.y - pt.y);
				if (dx < approx && dy < approx) {
					if (dx != 0 || dy != 0) {
						pt.x = v.x;
						pt.y = v.y;
					}
					found = true;
				}
				if (found) break;
			}
			if (!found) {
				//make new cluster with this point
				error('point not found in vertices!!! ' + pt.x + ' ' + pt.y);
			}
		}
	}
	return vertices;
}
function dSquare(pos1, pos2) {
	let dx = pos1.x - pos2.x;
	dx *= dx;
	let dy = pos1.y - pos2.y;
	dy *= dy;
	return dx + dy;
}
function distance(x1, y1, x2, y2) { return Math.sqrt(dSquare({ x: x1, y: y1 }, { x: x2, y: y2 })); }
function size2hex(w = 100, h = 0, x = 0, y = 0) {
	//returns sPoints for polygon svg
	//from center of poly and w (possibly h), calculate hex poly points and return as string!
	//TODO: add options to return as point list!
	//if h is omitted, a regular hex of width w is produced
	//starting from N:
	let hexPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 0.25 }, { X: 1, Y: 0.75 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0.75 }, { X: 0, Y: 0.25 }];

	if (h == 0) {
		h = (2 * w) / 1.73;
	}
	return polyPointsFrom(w, h, x, y, hexPoints);
}
function size2triup(w = 100, h = 0, x = 0, y = 0) {
	//returns sPoints for polygon svg starting from N:
	let triPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 1 }, { X: 0, Y: 1 }];
	if (h == 0) { h = w; }
	return polyPointsFrom(w, h, x, y, triPoints);

}
function size2tridown(w = 100, h = 0, x = 0, y = 0) {
	//returns sPoints for polygon svg starting from N:
	let triPoints = [{ X: 1, Y: 0 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0 }];
	if (h == 0) { h = w; }
	return polyPointsFrom(w, h, x, y, triPoints);

}
function getCirclePoints(rad, n, disp = 0) {
	let pts = [];
	let i = 0;
	let da = 360 / n;
	let angle = disp;
	while (i < n) {
		let px = rad * Math.cos(toRadian(angle));
		let py = rad * Math.sin(toRadian(angle));
		pts.push({ X: px, Y: py });
		angle += da;
		i++;
	}
	return pts;
}

function polyPointsFrom(w, h, x, y, pointArr) {

	x -= w / 2;
	y -= h / 2;

	let pts = pointArr.map(p => [p.X * w + x, p.Y * h + y]);
	let newpts = [];
	for (const p of pts) {
		newp = { X: p[0], Y: Math.round(p[1]) };
		newpts.push(newp);
	}
	pts = newpts;
	let sPoints = pts.map(p => '' + p.X + ',' + p.Y).join(' '); //'0,0 100,0 50,80',
	//testHexgrid(x, y, pts, sPoints);
	return sPoints;
}
function getPoly(offsets, x, y, w, h) {
	//, modulo) {
	let poly = [];
	for (let p of offsets) {
		let px = Math.round(x + p[0] * w); //  %modulo;
		//px -= px%modulo;
		//if (px % modulo != 0) px =px % modulo; //-= 1;
		let py = Math.round(y + p[1] * h); //%modulo;
		//py -= py%modulo;
		//if (py % modulo != 0) py -= 1;
		poly.push({ x: px, y: py });
	}
	return poly;
}
function getHexPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let hex = [[0, -0.5], [0.5, -0.25], [0.5, 0.25], [0, 0.5], [-0.5, 0.25], [-0.5, -0.25]];
	return getPoly(hex, x, y, w, h);
}
function getQuadPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	q = [[0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]];
	return getPoly(q, x, y, w, h);
}
function getTriangleUpPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let triup = [[0, -0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(triup, x, y, w, h);
}
function getTriangleDownPoly(x, y, w, h) {
	// returns hex poly points around center x,y
	let tridown = [[-0.5, 0.5], [0.5, 0.5], [-0.5, 0.5]];
	return getPoly(tridown, x, y, w, h);
}
//#endregion

//#region id helpers
var UIDCounter = 0;
function getUID(pref = '') {
	UIDCounter += 1;
	return pref + '_' + UIDCounter;
}
//#endregion

//#region io
function error(msg) {
	let fname = getFunctionsNameThatCalledThisFunction();
	console.log(fname, 'ERROR!!!!! ', msg);
}
//#endregion

//#region objects, dictionaries, lists, arrays
//#region deepmerge helpers
const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray
function isMergeableObject(val) {
	var nonNullObject = val && typeof val === 'object'

	return nonNullObject
		&& Object.prototype.toString.call(val) !== '[object RegExp]'
		&& Object.prototype.toString.call(val) !== '[object Date]'
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneIfNecessary(value, optionsArgument) {
	var clone = optionsArgument && optionsArgument.clone === true
	return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}

function defaultArrayMerge(target, source, optionsArgument) {
	var destination = target.slice()
	source.forEach(function (e, i) {
		if (typeof destination[i] === 'undefined') {
			destination[i] = cloneIfNecessary(e, optionsArgument)
		} else if (isMergeableObject(e)) {
			destination[i] = deepmerge(target[i], e, optionsArgument)
		} else if (target.indexOf(e) === -1) {
			destination.push(cloneIfNecessary(e, optionsArgument))
		}
	})
	return destination
}

function mergeObject(target, source, optionsArgument) {
	var destination = {}
	if (isMergeableObject(target)) {
		Object.keys(target).forEach(function (key) {
			destination[key] = cloneIfNecessary(target[key], optionsArgument)
		})
	}
	Object.keys(source).forEach(function (key) {
		if (!isMergeableObject(source[key]) || !target[key]) {
			destination[key] = cloneIfNecessary(source[key], optionsArgument)
		} else {
			destination[key] = deepmerge(target[key], source[key], optionsArgument)
		}
	})
	return destination
}


deepmerge.all = function deepmergeAll(array, optionsArgument) {
	if (!Array.isArray(array) || array.length < 2) {
		throw new Error('first argument should be an array with at least two elements')
	}

	// we are sure there are at least 2 values, so it is safe to have no initial value
	return array.reduce(function (prev, next) {
		return deepmerge(prev, next, optionsArgument)
	})
}
//#endregion
function addIf(arr, el) {
	if (!arr.includes(el)) arr.push(el);
}
function addIfDict(key, val, dict) {
	if (!(key in dict)) {
		dict[key] = [val];
	} else {
		addIf_dep(val, dict[key]);
	}
}
function any(arr, cond) {
	return !isEmpty(arr.filter(cond));
}
function anyStartsWith(arr, prefix) {
	return any(arr, el => startsWith(el, prefix));
}
function arrFromIndex(arr, i) { return arr.slice(i); }
function arrMinus(a, b) {
	let res = a.filter(x => !b.includes(x));
	return res;
}
function arrMax(arr) {
	return arr.reduce((m, n) => Math.max(m, n));
}
function arrMin(arr) {
	return arr.reduce((m, n) => Math.min(m, n));
}
//much faster:
function arrMinMax(arr) {
	let min = arr[0].y, max = arr[0].y;

	for (let i = 1, len = arr.length; i < len; i++) {
		let v = arr[i].y;
		min = (v < min) ? v : min;
		max = (v > max) ? v : max;
	}

	return [min, max];
}
function arrReplace(arr, oldval, newval) {
	let i = arr.indexOf(oldval);
	if (i >= 0) arr[i] = newval;
	return oldval;
}
function contains(arr, el) {
	return arr.includes(el);
}
function containsAny(arr, lst) {
	//console.log('containsAny',arr,lst)
	for (const x of lst) {
		if (arr.includes(x)) {
			//console.log('containsAny YES!',x,arr);
			return true;
		}
	}
	return false;
}
function containsAll(arr, lst) {
	for (const el of lst) {
		if (!arr.includes(el)) return false;
	}
	return true;
}
function deepmerge(target, source, optionsArgument) {
	var array = Array.isArray(source);
	var options = optionsArgument || { arrayMerge: defaultArrayMerge }
	var arrayMerge = options.arrayMerge || defaultArrayMerge

	if (array) {
		return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
	} else {
		return mergeObject(target, source, optionsArgument)
	}
}
function dict2list(d, keyName = 'key') {
	//d assumed to be dictionary with values are objects!!!!
	let res = [];
	for (const key in d) {
		let o = jsCopy(d[key]);
		o[keyName] = key;
		res.push(o);
	}
	return res;
}
function dropLast(s) { return s.substring(0, s.length - 1); }
const fieldSorter = fields => (a, b) =>
	fields
		.map(o => {
			let dir = 1;
			if (o[0] === '-') {
				dir = -1;
				o = o.substring(1);
			}
			return a[o] > b[o] ? dir : a[o] < b[o] ? -dir : 0;
		})
		.reduce((p, n) => (p ? p : n), 0);

//usage of field sorter:
// const homes = [{"h_id":"3", "city":"Dallas", "state":"TX","zip":"75201","price":162500}, {"h_id":"4","city":"Bevery Hills", "state":"CA", "zip":"90210", "price":319250},{"h_id":"6", "city":"Dallas", "state":"TX", "zip":"75000", "price":556699},{"h_id":"5", "city":"New York", "state":"NY", "zip":"00010", "price":962500}];
// const sortedHomes = homes.sort(fieldSorter(['state', '-price']));
// document.write('<pre>' + JSON.stringify(sortedHomes, null, '\t') + '</pre>')
function first(arr) {
	return arr.length > 0 ? arr[0] : null;
}
function firstCond(arr, func) {
	//return first elem that fulfills condition
	if (nundef(arr)) return null;
	for (const a of arr) {
		if (func(a)) return a;
	}
	return null;
}
function firstCondDict(dict, func) {
	//return first elem that fulfills condition
	for (const k in dict) { if (func(dict[k])) return k; }
	return null;
}
function getItemWithMaxValue(d) {
	let k = Object.keys(d).reduce((a, b) => (d[a] >= d[b] ? a : b));
	return [k, d[k]];
}
function getItemWithMax(d, propName) {
	testHelpers('getItemWithMax dict:', d, 'propName:', propName);
	let max = 0;
	let kmax = null;
	for (const key in d) {
		let val = d[key][propName];
		if (val > max) {
			max = val;
			kmax = key;
		}
	}
	return [kmax, d[kmax], max];
}
function getKeys(dict) { return Object.keys(dict); }
function intersection(arr1, arr2) {
	//each el in result will be unique
	let res = [];
	for (const a of arr1) {
		if (arr2.includes(a)) {
			addIf(res, a);
		}
	}
	return res;
}
function isEmpty(arr) {
	return arr === undefined || !arr || (isString(arr) && (arr == 'undefined' || arr == '')) || (Array.isArray(arr) && arr.length == 0) || Object.entries(arr).length === 0;
}
function jsCopy(o) {
	return JSON.parse(JSON.stringify(o)); //macht deep copy
}
function last(arr) {
	return arr.length > 0 ? arr[arr.length - 1] : null;
}
function lastCond(arr, func) {
	//return first elem that fulfills condition
	for (let i = arr.length - 1; i >= 0; i--) {
		if (func(arr[i])) return arr[i];
	}

	return null;
}
function lastCondDictPlusKey(dict, func) {
	//return first elem that fulfills condition
	let keys = Object.keys(dict);
	for (let i = keys.length - 1; i >= 0; i--) {
		let key = keys[i];
		if (func(dict[key])) return [key, dict[key]];
	}

	return null;
}
function listKey(d, lastKey, val, uniqueValues = true) {
	if (nundef(d[lastKey])) d[lastKey] = [];
	if (uniqueValues) addIf(d[lastKey], val); else d[lastKey].push(val);
	return d[lastKey];
}
function lookup(dict, keys) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (k === undefined) break;
		let e = d[k];
		if (e === undefined) return null;
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function parseDictionaryName(s) {
	if (nundef(s)) return null;
	let o_keys = s.split('.');
	if (isEmpty(o_keys)) return null;
	odict = window[o_keys[0]];
	if (!odict || typeof odict != 'object') return null;
	if (o_keys.length > 1) odict = lookup(odict, o_keys.slice(1));
	return odict;
}
function propDiffSimple(o_old, o_new, props = null) {
	//berechne diff in props
	//if props omitted will compare all properties! builds union so slightly less efficient that way!
	//if o_new or o_old are null, also returns correct result!
	let onlyOld = [];
	let onlyNew = [];
	let propChange = [];
	let summary = [];
	let hasChanged = false;

	if (!o_old) {
		return { onlyOld: [], onlyNew: Object.keys(o_new), propChange: [], summary: Object.keys(o_new), hasChanged: true };
	} else if (!o_new) {
		return { onlyOld: Object.keys(o_old), onlyNew: [], propChange: [], summary: Object.keys(o_old), hasChanged: true };
	}

	if (nundef(props)) props = union(Object.keys(o_old), Object.keys(o_new));
	for (const prop of props) {
		let nval = o_new[prop];
		let oval = o_old[prop];
		if (isdef(nval) && isdef(oval)) {
			if (nval == oval) continue;
			else if (typeof nval == 'object' && sameStringify(nval, oval)) {
				continue;
			} else if (isList(nval) && sameList(nval, oval)) {
				continue;
			}
			addIf(propChange, { prop: prop, old: oval, new: nval });
			addIf(summary, prop);
			hasChanged = true;
		} else if (nundef(oval)) {
			addIf(onlyNew, prop);
			addIf(summary, prop);
			hasChanged = true;
		} else if (nundef(nval)) {
			addIf(onlyOld, prop);
			addIf(summary, prop);
			hasChanged = true;
		}
	}
	return { onlyOld: onlyOld, onlyNew: onlyNew, propChange: propChange, summary: summary, hasChanged: hasChanged };
}
function removeIf(arr, el) { removeInPlace(arr, el); }
function removeInPlace(arr, el) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] === el) {
			arr.splice(i, 1);
			i--;
			return;
		}
	}
}
function removeInPlaceKeys(dict, keys) {
	for (const k of keys) {
		delete dict[k];
	}
}
function sameList(l1, l2) {
	// compares 2 lists of strings if have same strings in it
	if (l1.length != l2.length) return false;
	for (const s of l1) {
		if (!l2.includes(s)) return false;
	}
	return true;
}
function sameStringify(o1, o2) {
	return JSON.stringify(o1) == JSON.stringify(o2);
}
function sortBy(arr, key) {
	//console.log(jsCopy(arr))
	arr.sort((a, b) => (a[key] < b[key] ? -1 : 1));
}
function sortByDescending(arr, key) {
	//console.log(jsCopy(arr))
	arr.sort((a, b) => (a[key] > b[key] ? -1 : 1));
}
function sortByFunc(arr, func) {
	arr.sort((a, b) => (func(a) < func(b) ? -1 : 1));
}
function sortByFuncDescending(arr, func) {
	arr.sort((a, b) => (func(a) > func(b) ? -1 : 1));
}
function _setToList(oval) { if (typeof oval == 'object' && '_set' in oval) return oval._set; else return oval; }
function simpleRep(val) {
	if (nundef(val) || val === '') {
		return '_';
	} else if (isSimple(val)) return val;
	else if (isList(val)) {
		return '[' + val.map(x => simpleRep(x)).join(', ') + ']';
	} else if (typeof val == 'object') {
		let s = [];
		for (const k in val) {
			if (isEmpty(val[k])) continue;
			let s1 = simpleRep(val[k]);
			if (k == '_set') s1 = '{' + s1.substring(1, s1.length - 1) + '}';
			s.push(s1);
		}
		return s.join(', ');
	}
}
function union(lst1, lst2) {
	return [...new Set([...lst1, ...lst2])];
}



//#endregion

//#region random
function chooseRandom(arr, condFunc = null) {
	let len = arr.length;
	if (condFunc) {
		let best = arr.filter(condFunc);
		if (!isEmpty(best)) return chooseRandom(best);
	}
	let idx = Math.floor(Math.random() * len);
	return arr[idx];
}
function choose(arr, n) {
	//console.log(arr, n);
	var result = new Array(n);
	var len = arr.length;
	var taken = new Array(len);
	//console.log('len', len);
	if (n > len) n = len - 1; // throw new RangeError('getRandom: more elements taken than available');
	while (n--) {
		var x = Math.floor(Math.random() * len);
		result[n] = arr[x in taken ? taken[x] : x];
		taken[x] = --len in taken ? taken[len] : len;
	}
	return result;
}
function getNColors(n) {
	return choose(getColorNames(), n);
} //ok
function getRandomKey(dict) {
	let keys = Object.keys(dict);
	return chooseRandom(keys);
}
function randomColor(s = 100, l = 70, a = 1) {
	//s,l in percent, a in [0,1], returns hsla string
	var hue = Math.random() * 360;
	return hslToHslaString(hue, s, l, a);
}
function randomNumber(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min + 1)) + min; //min and max inclusive!
}

//#endregion

//#region string functions
function allIntegers(s) {
	//returns array of all numbers within string s
	return s.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => {
		return +v;
	});
}
function allNumbers(s) {
	//returns array of all numbers within string s
	return s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => Number(v));
	// {console.log(v,typeof v,v[0],v[0]=='-',v[0]=='-'?-(+v):+v,Number(v));return Number(v);});
}
function capitalize(s) {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function eraseSpaces(s) {
	let i = 0;
	while (s.includes('  ')) {
		//testHelpers(i++ + ": ", s);
		s = s.replace('  ', ' ');
		s = s.replace(' {', '{');
		s = s.replace(' (', '(');
		s = s.replace('\n ', ' ');
		s = s.replace('\n{', '{');
		s = s.replace('\n}', '}');
	}
	return s;
}
function endsWith(s, sSub) {
	let i = s.indexOf(sSub);
	return i == s.length - sSub.length;
}
function getLines(s) {
	// returns array of lines in s
	var str = s;
	var res = str.split('\n');
	return res;
}

function firstNumber(s) {
	// returns first number in string s
	if (s) {
		let m = s.match(/-?\d+/);
		if (m) {
			let sh = m.shift();
			if (sh) { return Number(sh); }
		}
	}
	return null;
}

function firstPositiveNumber(s) {
	// returns first number in string s
	return s ? Number(s.match(/\d+/).shift()) : -1;
}
function makeString(obj, prop, maxlen = 50, isStart = true) {
	let s = prop + ':';
	if (prop in obj) {
		let s1 = JSON.stringify(obj[prop]);
		if (maxlen > 0) {
			s += isStart ? s1.substring(0, maxlen) : s1.substring(s.length - maxlen);
		} else {
			s += s1;
		}
	} else {
		s += ' not present';
	}
	return s;
}
function makeStrings(obj, props, maxlen = 50, isStart = true) {
	strs = props.map(x => makeString(obj, x)).join('\n');
	return strs;
}
function padSep(sep, n, args) {
	//sep..separator string, n..length of result, args are arbitrary numbers
	//each number in args is padded with 0's to length n, numbers are then separated by sep
	// eg. padSep(':',2,12,1,0) => '12:01:00'
	s = '';
	for (var i = 2; i < arguments.length; i++) {
		s += arguments[i].toString().padStart(n, '0') + sep;
	}
	return s.substring(0, s.length - 1);
}
function replaceAll(str, sSub, sBy) {
	let regex = new RegExp(sSub, 'g');
	return str.replace(regex, sBy);
}
function sameCaseIndep(s1, s2) {
	return s1.toLowerCase() == s2.toLowerCase();
}
function startsWith(s, sSub) {
	//testHelpers('startWith: s='+s+', sSub='+sSub,typeof(s),typeof(sSub));
	return s.substring(0, sSub.length) == sSub;
}
function startsWithCaseIndep(s, ssub) {
	return startsWith(s.toLowerCase(), ssub.toLowerCase());
}
function stringAfter(sFull, sSub) {
	//testHelpers('s='+sFull,'sub='+sSub)
	let idx = sFull.indexOf(sSub);
	//testHelpers('idx='+idx)
	if (idx < 0) return '';
	return sFull.substring(idx + sSub.length);
}
function stringAfterLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return last(parts);
}
function stringBefore(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return sFull;
	return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return sFull.substring(0, sFull.length - last(parts).length - 1);
}
function trim(str) {
	return str.replace(/^\s+|\s+$/gm, '');
}
//#endregion

//#region types, conversions
function evToId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function getTypeOf(param) {
	let type = typeof param;
	if (type == 'string') {
		return 'string';
	}
	if (type == 'object') {
		type = param.constructor.name;
		if (startsWith(type, 'SVG')) type = stringBefore(stringAfter(type, 'SVG'), 'Element').toLowerCase();
		else if (startsWith(type, 'HTML')) type = stringBefore(stringAfter(type, 'HTML'), 'Element').toLowerCase();
	}
	let lType = type.toLowerCase();
	if (lType.includes('event')) type = 'event';
	return type;
}
function isdef(x) { return x !== null && x !== undefined; }
function isDict(d) { return typeof (d) == 'object'; }
function isEvent(param) { return getTypeOf(param) == 'event'; }
function isLiteral(x) { return isString(x) || $.isNumeric(x); }
function isList(arr) { return Array.isArray(arr); }
function isListOfLiterals(lst) {
	if (!isList(lst)) return false;
	for (const el of lst) {
		if (isList(el)) return false;
	}
	return true;
}
function isNumber(param) { return !isNaN(Number(param)); }
function isNumeric(x) { return !isNaN(+x); }
function isSet(x) { return (isDict(x) && (x.set || x._set)); }
function isSimple(x) { return isString(x) || isNumeric(x); }
function isString(param) { return typeof param == 'string'; }
function isSvg(elem) { return startsWith(elem.constructor.name, 'SVG'); }
function nundef(x) { return x === null || x === undefined; }

//#endregion

// #region zooming
function deltaTransformPoint(matrix, point) {
	var dx = point.x * matrix.a + point.y * matrix.c + 0;
	var dy = point.x * matrix.b + point.y * matrix.d + 0;
	return { x: dx, y: dy };
}
function decomposeMatrix(matrix) {
	// @see https://gist.github.com/2052247

	// calculate delta transform point
	var px = deltaTransformPoint(matrix, { x: 0, y: 1 });
	var py = deltaTransformPoint(matrix, { x: 1, y: 0 });

	// calculate skew
	var skewX = (180 / Math.PI) * Math.atan2(px.y, px.x) - 90;
	var skewY = (180 / Math.PI) * Math.atan2(py.y, py.x);

	return {
		translateX: matrix.e,
		translateY: matrix.f,
		scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
		scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
		scale: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
		skewX: skewX,
		skewY: skewY,
		rotation: skewX // rotation is the same as skew x
	};
}
function getTransformInfo(gElement) {
	//testHelpers(gElement);
	var matrix = gElement.getCTM();
	let info = decomposeMatrix(matrix);
	return info;
}
function getZoomFactor(gElement) {
	//var m = gElement.getAttribute("transform");
	var matrix = gElement.getCTM();
	let info = decomposeMatrix(matrix);
	return info.scale;
	// testHelpers(x.scale);
}
//#endregion zooming







