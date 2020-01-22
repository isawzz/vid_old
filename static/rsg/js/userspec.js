function specAndDOM(callbacks = []) {
	initSETTINGS();
	initPageHeader();
	initTABLES();
	initDom();

	//if user spec and/or code is present, load them into corresponding tabs!!!
	presentSpecAndCode();

	let hasStructure = false;
	if (S.settings.userStructures) hasStructure = initSTRUCTURES();
	if (!hasStructure && S.settings.boardDetection) {
		detectBoard(G.table, 'a_d_game');
	}
	openTabTesting(S.settings.openTab);

	if (!isEmpty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
}
function initSTRUCTURES() {
	let data = S.user.spec.STRUCTURES;
	if (nundef(data)) return;

	BINDINGS = {};
	let hasStructure = false;
	for (const areaName in data) {
		reqs = data[areaName];
		let ms = makeArea(areaName, reqs.location);
		let areaId = ms.id;

		for (const prop in reqs) {
			let val = reqs[prop];
			if (prop == 'location') continue;
			if (prop == 'structure') {
				hasStructure = true; // this is to prevent default board detection!!!!
				let info = reqs.structure;

				let func = info.type; // rsg will build a structure of desired type if known! eg., hexGrid, quadGrid,...

				let odict = parseDictionaryName(info.object_pool);
				if (!odict) odict = G.table; //default object pool to get board and board member objects from
				let boardInfo = info.cond; //object in object_pool representing board, its id will be board main id!

				let structObject = window[func](odict, areaId, boardInfo);

				// unused im moment
			} else if (prop == 'binding') {
				BINDINGS[areaId] = val;

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
	let d = document.getElementById('a_d_spec_content');
	if (S.user.spec && S.settings.userSettings) {
		d.innerHTML = S.user.specText;
	} else { d.innerHTML = ''; }

	d = document.getElementById('a_d_code_content');
	if (S.user.script && S.settings.userBehaviors) {
		d.innerHTML = S.user.script;
	} else { d.innerHTML = ''; }

	$('pre').html(function () {
		return this.innerHTML.replace(/\t/g, '&nbsp;&nbsp;');
	});

	if (!isEmpty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
}

function redrawScreen() {
	checkCleanup_II();

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

	//console.log(jsCopy(S), jsCopy(G));

	initDom();
	processData(xdata)
	specAndDOM([gameStep]);
}

function onClickUseNoBoardDetection() {
	S.settings.userBehaviors = false;
	S.settings.userStructures = false;
	S.settings.userSettings = false;
	S.settings.boardDetection = S_boardDetection = false;
	S.settings.openTab = 'London';
	redrawScreen();
}
function onClickUseNoSpec() {
	S.settings.userBehaviors = false;
	S.settings.userStructures = false;
	S.settings.userSettings = false;
	S.settings.boardDetection = S_boardDetection = true;
	S.settings.openTab = 'London';
	redrawScreen();
}
function onClickUseSettings() {
	S.settings.userBehaviors = false;
	S.settings.userStructures = false;
	S.settings.userSettings = true;
	S.settings.boardDetection = S_boardDetection = true;
	S.settings.openTab = 'Seattle';
	redrawScreen();
}
function onClickUseStructures() {
	S.settings.userBehaviors = false;
	S.settings.userStructures = true;
	S.settings.userSettings = true;
	S.settings.boardDetection = S_boardDetection = true;
	S.settings.openTab = 'Paris';
	redrawScreen();
}
function onClickUseBehaviors() {
	S.settings.userBehaviors = true;
	S.settings.userStructures = true;
	S.settings.userSettings = true;
	S.settings.boardDetection = S_boardDetection = true;
	S.settings.openTab = 'Oslo';
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
			if (!isEmpty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
		});
	});
}
function loadUserCode(callbacks = []) {
	//timit.showTime(getFunctionCallerName());
	let fname = S.user.spec.CODE;
	//console.log('...loading code from', fname + '.js')
	if (nundef(fname)) {
		S.user.script = 'no code';
		if (!isEmpty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
	} else {
		//console.log('code filename is:', fname)
		//S.path.script = '/examples_front/' + S.settings.game + '/' + fname + '.js';
		S.path.script = '/games/' + S.settings.game + '/_rsg/' + fname + '.js';
		//S.path.script = '/games/' + allGames[S.settings.game].name + '/' + fname + '.js';
		loadScript(S.path.script, dScript => {
			loadText(S.path.script, code => {
				S.user.script = code;
				if (!isEmpty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
			});
		});
	}
}


//________________________________________test code unused!
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



