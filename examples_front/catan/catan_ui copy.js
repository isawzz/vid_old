V = {
	colors: {
		ore: 'dimgray',
		wheat: colorTrans('goldenrod',.75),
		sheep: colorTrans('lime'),
		brick: colorTrans('tomato'),
		wood: colorTrans('sienna'),
		desert: colorTrans('beige',.6)
	}
};

PLAYER_UPDATE = {
	player_on_turn: (id, o) => {
		if (o.obj_type == 'GamePlayer') { return { f: game_player_update, vis: ['PMain'] }; }
	}
};

TABLE_UPDATE = {
	resources_numbers: (id, o, phase) => {
		if (phase == 'setup' && o.obj_type == 'hex') { return { f: setup_field }; }
	},
	buildings: (id, o, phase) => {
		//console.log('buildings',id,o.obj_type,phase)
		if (o.obj_type == 'Corner') { return { f: check_building }; }
	},
	streets: (id, o, phase) => {
		if (o.obj_type == 'Edge') { return { f: check_building }; }
	},
	// robber: (id, o, phase) => {
	// 	if (o.obj_type == 'robber') { return { f: place_robber }; }
	// },
	ports: (id, o, phase) => {
		if (phase == 'setup' && o.obj_type == 'board') { return { f: setup_ports }; }
	},
};

function setup_field(id, o) {
	if (nundef(o.res)) return false;
	let vis = getVisual(id);
	let color = V.colors[o.res];
	vis.setBg(color);
	if (isdef(o.num)) {
		let num = Number(o.num);
		vis.text({ txt: '' + o.num, fill: num == 6 || num == 8 ? 'red' : 'white' })
	}
	return true;
}

function setup_ports(id, o) {
	let board = getVisual(id);
	let portCorners = getCorners(board, (x) => { return isdef(x.port); });
	for (const c of portCorners) {
		let port = c.port;
		let color, label;
		switch (port) {
			case '3to1': color = 'beige'; label = '3/1'; break;
			default: color = V.colors[port]; label = port; break;
		}
		c.circle({ idx: 0, sz: 52, fill: color, alpha:.5 });
		let textColor = colorIdealText(color);
		c.text({ txt: label, fz: 8, x: 0, y: -22, fill: textColor });
	}
	return true;
}

function check_building(id, o) {
	if (nundef(o.building)) return false;
	//console.log('*** building ***')
	let vis = getVisual(id);
	let idBuilding = o.building._obj;
	let building = getObject(idBuilding);
	let pl = getPlayer(building.player._player);
	let color = pl.color;
	let buildingType = building.obj_type;
	//if it is a city will show it as rectangle!
	vis.setBg(color);
	return true;
}

// function place_robber(id, o) {
// 	let vis = getVisual(id);
// 	let loc = getVisual(o.loc._obj);
// 	console.log('ROBBER!!!!',vis,loc);
// 	if (!vis) {
// 		vis = createVisual(id, '145', { label: 'R' });
// 	}
// 	vis.setPos(loc.x, loc.y);
// }

function game_player_update(id, o) {
	let vis = getVisual('PMain');
	vis.addTitle('VP:' + o.vps, o.name, 'active player', o.color)
	vis.addColumns(o, ['resources'], ['reserve'], ['devcards']);
	vis.addBorder(o.color);
	return true;
}
