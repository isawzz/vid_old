function specAndDOM(callbacks = []) {
	timit.showTime(getFunctionCallerName());

	// console.log(S.settings.boardDetection)
	// console.log(S.settings.userSettings)
	// if (!S.settings.boardDetection && !S.settings.userSettings) {
	// 	console.log('layout2!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
	// 	document.getElementById('R_d_root').classList.remove('layout1');
	// 	document.getElementById('R_d_root').classList.add('layout2');
	// } else {
	// 	document.getElementById('R_d_root').classList.add('layout1');
	// 	document.getElementById('R_d_root').classList.remove('layout2');
	// }

	//after getting init data: G is up to date, ready to be presented
	initSETTINGS();

	//init DOM: prepare UI for game, structure and table setup
	initPageHeader();
	initTABLES();
	initDom();
	//for now just 1 board detected


	//if user spec and/or code is present, load them into corresponding tabs!!!
	presentSpecAndCode();

	let hasStructure = false;
	if (S.settings.userStructures) hasStructure = initSTRUCTURES();
	//console.log('hasStructure:', hasStructure, 'boardDetection', S.settings.boardDetection)
	if (!hasStructure && S.settings.boardDetection) {

		detectBoard(G.table, 'a_d_game');
	}//	{	openTabTesting('London');	detectBoard(G.table,'a_d_game'); }

	// openTabTesting('London');//
	openTabTesting(S.settings.openTab);
	if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
}
function initSTRUCTURES() {
	//return false;
	// timit.showTime(getFunctionCallerName());
	let data = S.user.spec.STRUCTURES;
	//console.log('initSTRUCTURES',data)
	if (nundef(data)) return;

	let hasStructure = false;
	for (const areaName in data) {
		reqs = data[areaName];
		//console.log(areaName,reqs.location)
		let ms = makeArea(areaName, reqs.location);
		let areaId = ms.id;
		//console.log(ms);

		for (const prop in reqs) {
			let val = reqs[prop];
			//console.log('property',prop,val);

			if (prop == 'location') continue;
			if (prop == 'structure') {
				hasStructure = true; // this is to prevent default board detection!!!!
				let info = reqs.structure;

				let func = info.type; // rsg will build a structure of desired type if known! eg., hexGrid, quadGrid,...

				let odict = parseDictionaryName(info.object_pool);
				if (!odict) odict = G.table; //default object pool to get board and board member objects from

				let boardInfo = info.cond; //object in object_pool representing board, its id will be board main id!

				//console.log('*** calling',func+'(odict,'+areaId+',_)');
				//console.log(odict)

				let structObject = window[func](odict, areaId, boardInfo);
				//console.log(structObject,func,areaName)
			} else if (isDict(val) && 'binding' in val) {
				let info = val.binding;
				//hier muss ich jetzt registry einsetzen!!!
				/**
				 * wenn ich playerUpdate mache, muss ich 
				 * 
				 */
				let filterFunc = 0;//d
				let statement = `getVisual(${areaId}).set${prop.toUpperCase}(${info.object_pool}.)`
				let odict = parseDictionaryName(info.object_pool);

			} else {
				// rsg tries to set this prop for areaName object! eg., visual props bg, fg, bounds
				let lst = jsCopy(val);

				let func = 'set' + capitalize(prop);
				let params = lst;
				//console.log('*** calling',func+'('+params+')');
				if (!Array.isArray(params)) params = params.split(',');
				if (ms[func] !== null) ms[func](...params);
			}
		}
	}
	return hasStructure;
}
function presentSpecAndCode(callbacks = []) {
	//console.log('presenting!!!\n', S.user.specText)
	if (S.user.spec) {
		let d = document.getElementById('a_d_spec_content');
		d.innerHTML = S.user.specText;
	}
	if (S.user.script) {
		let d = document.getElementById('a_d_code_content');
		d.innerHTML = S.user.script;
	}
	$('pre').html(function () {
		return this.innerHTML.replace(/\t/g, '&nbsp;&nbsp;');
	});
	if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
}

function redrawScreen() {
	//gameView();

	if (isdef(UIS)) {
		stopBlinking('a_d_status');
		stopInteraction();

		clearLog();
		delete G.end;
		delete G.signals.receivedEndMessage;
		pageHeaderClearAll();
		restoreBehaviors();
		openTabTesting('London');
		UIS['a_d_status'].clear({ innerHTML: '<div id="c_d_statusText">status</div>' });
		UIS['a_d_actions'].clear({ innerHTML: '<div id="a_d_divSelect" class="sidenav1"></div>' });
		let areaPlayer = isdef(UIS['a_d_player']) ? 'a_d_player' : isdef(UIS['a_d_players']) ? 'a_d_players' : 'a_d_options';
		for (const id of ['a_d_log', 'a_d_objects', areaPlayer, 'a_d_game']) clearElement(id);
	}

	if (S.settings.userBehaviors) {
		loadScript(S.path.script, proceedRedraw);
	} else proceedRedraw();
}
function proceedRedraw() {
	let xdata = G.serverData;
	G = { table: {}, players: {}, signals: {} }; //server objects
	UIS = {}; // holds MS objects 
	IdOwner = {}; //lists of ids by owner
	id2oids = {}; // { uid : list of server object ids (called oids) }
	oid2ids = {}; // { oid : list of ms ids (called ids or uids) }
	id2uids = {}; // { uid : list of ms ids related to same oid }

	console.log(jsCopy(S), jsCopy(G));

	initDom();
	processData(xdata)
	specAndDOM([gameStep]);
}
function onClickUseNoBoardDetection() {
	S.settings.userBehaviors = false;
	S.settings.userStructures = false;
	S.settings.userSettings = false;
	S.settings.boardDetection = S_boardDetection = false;
	redrawScreen();
}
function onClickUseNoSpec() {
	S.settings.userBehaviors = false;
	S.settings.userStructures = false;
	S.settings.userSettings = false;
	S.settings.boardDetection = S_boardDetection = true;
	redrawScreen();
}
function onClickUseSettings() {
	S.settings.userBehaviors = false;
	S.settings.userStructures = false;
	S.settings.userSettings = true;
	S.settings.boardDetection = S_boardDetection = true;
	redrawScreen();
}
function onClickUseStructures() {
	S.settings.userBehaviors = false;
	S.settings.userStructures = true;
	S.settings.userSettings = true;
	S.settings.boardDetection = S_boardDetection = true;
	redrawScreen();
}
function onClickUseBehaviors() {
	S.settings.userBehaviors = true;
	S.settings.userStructures = true;
	S.settings.userSettings = true;
	S.settings.boardDetection = S_boardDetection = true;
	redrawScreen();
}
function onClickReloadSpec() {
	loadUserSpec([loadUserCode, presentSpecAndCode, redrawScreen]);
}

function loadUserSpec(callbacks = []) {
	_sendRoute('/get_UI_spec/' + GAME, d1 => {
		S.user.spec = JSON.parse(d1);
		//console.log(S.user.spec);
		_sendRoute('/spec/' + GAME, d2 => {
			//console.log(d2);
			S.user.specText = d2;
			if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
		});
	});
}
function loadUserCode(callbacks = []) {
	//timit.showTime(getFunctionCallerName());
	let fname = S.user.spec.CODE;
	console.log('...loading code from',fname+'.js')
	if (nundef(fname)) {
		S.user.script = 'no code';
		if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
	} else {
		console.log('code filename is:', fname)
		S.path.script = '/examples_front/' + S.settings.game + '/' + fname + '.js';
		loadScript(S.path.script, dScript => {
			loadText(S.path.script, code => {
				S.user.script = code;
				if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
			});
		});
	}
}

//usage:
// if (iNeedSomeMore) {
// 	Script.load("myBigCodeLibrary.js"); // includes code for myFancyMethod();
// 	myFancyMethod(); // cool, no need for callbacks!
// }
var Script = {
	_loadedScripts: [],
	include: function (script) {
		// include script only once
		if (this._loadedScripts.include(script)) {
			return false;
		}
		// request file synchronous
		var code = new Ajax.Request(script, {
			asynchronous: false,
			method: "GET",
			evalJS: false,
			evalJSON: false
		}).transport.responseText;
		// eval code on global level
		if (Prototype.Browser.IE) {
			window.execScript(code);
		} else if (Prototype.Browser.WebKit) {
			$$("head").first().insert(Object.extend(
				new Element("script", {
					type: "text/javascript"
				}), {
				text: code
			}
			));
		} else {
			window.eval(code);
		}
		// remember included script
		this._loadedScripts.push(script);
	}
};



