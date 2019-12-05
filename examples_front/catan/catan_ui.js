V = {
	colors: {
		ore: 'dimgray',
		wheat: colorTrans('goldenrod', .75),
		sheep: colorTrans('lime'),
		brick: colorTrans('tomato'),
		wood: colorTrans('sienna'),
		desert: colorTrans('beige', .6)
	}
};

TABLE_UPDATE = {
	resources_numbers: (id, o, phase) => {
		if (o.obj_type == 'hex') { return { f: 'setup_field', vis: [id] }; }
	},
};
PLAYER_UPDATE = {
	player_update_devcards: (id, pl, phase) => {
		if (pl.obj_type == 'GamePlayer') { return { f: 'player_update_devcards', vis: [id, 'DevCards'] }; }
	},
};

FUNCS = {
	setup_field: (oid, o, field) => {
		if (nundef(o.res)) { field.setBg(V.colors.desert); }
		else {
			let color = V.colors[o.res];
			field.setBg(color);
			let num = Number(o.num);
			field.text({ txt: '' + o.num, fill: num == 6 || num == 8 ? 'red' : 'white' });
		}
		return true;
	},
	player_update_devcards: (oid, o, pl, cardArea) => {
		//console.log(getFunctionCallerName())
		//console.log('__________exec player_update_devcards:');//, oid, o, pl, cardArea)
		//let current = cardArea.cards;
		let areaName = 'DevCards';
		let idPlayer = oid;
		let idArea= getMainId(areaName);// 'm_A_DevCards';//todo getId of mainArea
		if (o.obj_type == 'GamePlayer' && isdef(o.devcards)) {
			//console.log('player devcards:',o.devcards)
			let ids = o.devcards._set.map(x => x._obj);
			//console.log('areaName:',areaName,'idArea',idArea)
			//console.log('player devcards:',ids)
			//console.log('area devcards:',idArea,UIS[idArea])
			showPlayerHand(idPlayer,'devcards','DevCards');//ids,areaName);
		} else {alert('SHOULD NEVER HAPPEN!~');  }
	},
}