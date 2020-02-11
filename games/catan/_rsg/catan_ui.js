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
// TABLE_CREATE = {
// 	robber:(oid, o, phase) => {
// 		if (o.obj_type == 'robber') { return { f: 'create_robber', vis: [oid] }; }
// 	}
// }
TABLE_UPDATE = {
	resources_numbers: (oid, o, phase) => {
		if (o.obj_type == 'hex') { return { f: 'setup_field', vis: [oid] }; }
	},
	ports: (oid, o, phase) => {
		if (o.obj_type == 'Corner') { return { f: 'setup_port', vis: [oid] }; }
	},
	update_city: (oid, o)=>{
		if (o.obj_type == 'city') {return {f: 'update_city', vis: [oid]}}
	}
};
PLAYER_UPDATE = {
	player_update_devcards: (id, pl, phase) => {
		if (pl.obj_type == 'GamePlayer') { return { f: 'player_update_devcards' }; }
	},
	player_update_stats: (id, pl, phase) => {
		return { f: 'player_update_stats' }; 
	},
};

FUNCS = {
	setup_field: (oid, o, field) => {
		if (nundef(o.res)) { field.setBg(V.colors.desert); }
		else {
			let color = V.colors[o.res];
			field.setBg(color);
			let num = Number(o.num);
			//console.log('setup_field!',o,o.num)
			field.text({ txt: o.num, fill: num == 6 || num == 8 ? 'red' : 'white' });
		}
		return true;
	},
	setup_port: (oid, o, corner) => {
		if (nundef(o.port)) { return false; }
		else {
			//console.log('port update:',oid,o.port)
			let color = o.port == "3to1" ? 'black' : V.colors[o.port];
			corner.circle({ idx: 0, sz: 52, fill: color, alpha: .5 });
			let label = o.port == "3to1" ? '3/1' : o.port;
			let textColor = colorIdealText(color);
			corner.text({ txt: label, fz: 8, x: 0, y: -22, fill: textColor });
			return true;
		}
	},
	player_update_devcards: (idPlayer, o) => {
		//showPlayerHandNew(idPlayer, 'devcards', 'DevCards');
		//showPlayerHand(idPlayer,'devcards',FUNCS.catan_card,'DevCards');
	},
	catan_card(oCard){
		console.log('catan_card!!!!',oCard);
	},
	player_update_stats: (idPlayer) => {
		// showPlayerStats(idPlayer,['res','vps','num_res'],'Stats')
		showPlayerStats(idPlayer,'num_res','Stats')
	},
	update_city: (oid, o, city) => {
		city.setScale(2);
	},

	//*** creation => should go to default main object creation! */
	create_robber: (oid, o) => {
		makeMainBoardElementVisual(oid, o);
	},
};




