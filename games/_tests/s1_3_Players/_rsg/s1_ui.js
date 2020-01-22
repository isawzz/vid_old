TABLE_UPDATE = {
	present_field: (oid, o) => {
		if (o.obj_type == 'Tick') { return { f: 'field_update', vis: [oid] }; }
	},
}

FUNCS = {
	field_update: (oid, o, field) => {
		if (nundef(o.player)) { field.text(); }
		else {
			let pl = getPlayer(o.player._player);
			field.text({ txt: o.symbol, fill: pl.color, fz: field.h / 2, family: 'AlgerianRegular' });
		}
		return true;
	}
}
