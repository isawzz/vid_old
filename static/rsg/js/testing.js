function 	testPageHeader(){
	pageHeaderClearAll();
	pageHeaderSetGame();
	pageHeaderAddPlayer('username', 'playerId', 'green', true);

}


//testing
function _testTable() {
	prelims();
	initDom();
	let gplayers = {
		White: {
			altName: "White",
			buildings: {
				city: { _set: [] },
				road: { _set: [{ _obj: "149" }] },
				settlement: { _set: [{ _obj: "148" }, { _obj: "158" }] },
			},
			color: "white",
			devcards: { _set: [] },
			id: { _player: "White" },
			opps: [{ _player: "Red" }, { _player: "Blue" }],
			opps2: { _set: ["White", "Red", "Blue"] },
			opps3: { _set: [{ _player: "Red" }, { _player: "Blue" }] },
			index: 0,
			name: "White",
			num_res: 3,
			obj_type: "GamePlayer",
			past_devcards: { _set: [] },
			reserve: { road: 14, settlement: 3, city: 4 },
			resources: { wood: 1, brick: 0, sheep: 1, ore: 0, wheat: 1 },
			username: "felix",

		},
		Red: {
			altName: "Red",
			buildings: {
				city: { _set: [] },
				road: { _set: [{ _obj: "149" }] },
				settlement: { _set: [{ _obj: "148" }, { _obj: "158" }] },
			},
			color: "Red",
			devcards: { _set: [] },
			id: "Red",
			index: 0,
			name: "Red",
			num_res: 3,
			past_devcards: { _set: [] },
			reserve: { road: 14, settlement: 3, city: 4 },
			resources: { wood: 1, brick: 0, sheep: 1, ore: 0, wheat: 1 },
			username: "maus",

		}
	};
	let gtable = {
		2: {
			col: 6,
			corners: [{ _obj: "101" }, { _obj: "102" }, { _obj: "103" }, { _obj: "104" }, { _obj: "99" }, { _obj: "98" }],
			edges: [{ _obj: "27" }, { _obj: "26" }, { _obj: "25" }, { _obj: "24" }, { _obj: "23" }, { _obj: "22" }],
			neighbors: [null, null, { _obj: "78" }, { _obj: "79" }, { _obj: "70" }, null],
			num: 11,
			obj_type: "hex",
			res: "ore",
			row: 0,
			visible: { _set: ["White", "Red", "Blue"] }
		},
		148: {
			loc: { _obj: "131" },
			obj_type: "settlement",
			player: {
				_player: "White"
			},
			opps: { opp1: { _player: "Red" }, opp2: { _player: "Blue" } },
			visible: {
				_set: [{ _player: "Red" }, { _player: "Blue" }]
			},
		},
		149: {
			loc: { _obj: "138" },
			obj_type: "settlement",
			player: {
				_player: "White"
			},
			visible: {
				_set: ["White", "Red", "Blue"]
			},
		},
		158: {
			loc: { _obj: "134" },
			obj_type: "road",
			player: {
				_player: "Red"
			},
			visible: { _set: ["White", "Red", "Blue"] },
		},
		145: {
			cols: 9,
			corners: { _set: [{ _obj: "101" }, { _obj: "102" }, { _obj: "103" },] },
			edges: { _set: [{ _obj: "101" }, { _obj: "102" }, { _obj: "103" },] },
			fields: { _set: [{ _obj: "101" }, { _obj: "102" }, { _obj: "103" },] },
			map: {
				_ndarray: [
					[null, { _obj: "3" }, null, { _obj: "4" }],
					[{ _obj: "5" }, null, { _obj: "6" }, null, { _obj: "7" }],
					[null, { _obj: "8" }, null],
				]
			},
			obj_type: "board",
			rows: 5,
			visible: { _set: ["White", "Red", "Blue"] }
		}
	};
	console.log('gplayers', gplayers);
	console.log('gtable', gtable);
	addTableToArea(gtable[145], 'a_d_game');
	addTableToArea(gtable[148], 'a_d_game');

	addTableToArea(gplayers.White, 'a_d_objects');
}
function addTableToArea(o, areaName) {
	let d = UIS[areaName].elem;
	let t = tableElemX(o);
	console.log('d', d)
	console.log('t', t.table)
	d.appendChild(t.table)
	d.appendChild(document.createElement('hr'));
}
function _test() {
	//test tuples
	let o1 = {
		"_set": [
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "91", "val": "Corner[91]", "type": "obj" },
							{ "ID": "92", "val": "Corner[92]", "type": "obj" },
							{ "ID": "93", "val": "Corner[93]", "type": "obj" },
						]
					}
				]
			}
		]
	};
	let o3 = {
		"_set": [
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "1", "val": "Corner[1]", "type": "obj" },
							{ "ID": "2", "val": "Corner[2]", "type": "obj" },
						]
					},
					{
						"_set": [
							{ "ID": "3", "val": "Corner[3]", "type": "obj" },
						]
					},
				]
			}
		]
	};
	let o4 = {
		"_tuple": [
			{
				"_set": [
					{ "ID": "1", "val": "Corner[1]", "type": "obj" },
					{ "ID": "2", "val": "Corner[2]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "3", "val": "Corner[3]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "4", "val": "Corner[3]", "type": "obj" },
					{ "ID": "5", "val": "Corner[3]", "type": "obj" },
				]
			},
		]
	};
	let o2 = {
		"_set": [
			{ "ID": "1", "val": "Corner[1]", "type": "obj" },
			{ "ID": "2", "val": "Corner[2]", "type": "obj" },
			{ "ID": "3", "val": "Corner[2]", "type": "obj" },
		]
	};
	let o5 = {
		"_set": [
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "1", "val": "Corner[1]", "type": "obj" },
							{ "ID": "2", "val": "Corner[2]", "type": "obj" },
						]
					},
					{
						"_set": [
							{ "ID": "3", "val": "Corner[3]", "type": "obj" },
						]
					},
				]
			},
			{
				"_tuple": [
					{
						"_set": [
							{ "ID": "4", "val": "Corner[1]", "type": "obj" },
							{ "ID": "5", "val": "Corner[2]", "type": "obj" },
						]
					},
					{
						"_set": [
							{ "ID": "6", "val": "Corner[3]", "type": "obj" },
						]
					},
				]
			}
		]
	};
	let o6 = {
		"_tuple": [
			{
				"_set": [
					{ "ID": "4", "val": "Corner[1]", "type": "obj" },
					{ "ID": "5", "val": "Corner[2]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "6", "val": "Corner[3]", "type": "obj" },
				]
			},
		]
	};
	let o7 = {
		"_tuple": [
			{
				"_set": [
					{ "ID": "1", "val": "Corner[1]", "type": "obj" },
					{ "ID": "2", "val": "Corner[2]", "type": "obj" },
				]
			},
			{
				"_set": [
					{ "ID": "3", "val": "Corner[3]", "type": "obj" },
				]
			},
		]
	};
	let o = o5;
	console.log('output', exp(o) ? tsRec(exp(o)) : 'undefined');
}
















//#region older code?!?!?
function onClickGetUIS(ms, part) {
	let id = ms.id;
	//console.log('',counters.click,' ______ visuals for', id, id2uids[id])
}
function onClickAddInteraction() { for (const id in UIS) { addTestInteraction(UIS[id]); } }
function onClickRemoveInteraction() {
	timit.showTime('start ' + getFunctionCallerName());
	for (const id in UIS) UIS[id].removeEvents();
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickRemoveActions() {
	timit.showTime('start ' + getFunctionCallerName());
	deleteActions();
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickAddActions() {
	if (M.boats) { 
		//console.log('actions already presented!'); 
		return; 
	}
	timit.showTime('start ' + getFunctionCallerName());
	presentActions();
	activateActions();
	timit.showTime('...end ' + getFunctionCallerName());

}
function onClickRemoveDefaultObjects() {
	timit.showTime('start ' + getFunctionCallerName());
	deleteDefaultObjects();
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickAddDefaultObjects() {
	timit.showTime('start ' + getFunctionCallerName());

	for(const oid in G.table){
		let ms = makeDefaultObject(oid, G.table[oid], S.settings.present.object.defaultArea);
		presentDefault(oid, G.table[oid]);
		//addTestInteraction(ms);
	}
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickRemoveDefaultPlayers() {
	timit.showTime('start ' + getFunctionCallerName());
	deleteDefaultPlayers();
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickAddDefaultPlayers() {
	timit.showTime('start ' + getFunctionCallerName());

	for(const oid in G.players){
		let ms = makeDefaultPlayer(oid, G.playersAugmented[oid], S.settings.present.player.defaultArea);
		presentDefault(oid, G.playersAugmented[oid],false);
		//addTestInteraction(ms);
	}
	timit.showTime('...end ' + getFunctionCallerName());
}
function onClickToggle(b, key) {
	let content = b.textContent;
	//console.log(content);
	let isOn = (content[0] == '-');
	if (isOn) {
		window['S_' + key] = false;
		b.textContent = '+' + content.substring(1);
	} else {
		window['S_' + key] = true;
		b.textContent = '-' + content.substring(1);
	}
	//console.log('toggle is now:', S_showEvents, b.textContent)
}














//#endregion