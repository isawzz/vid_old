TABLE_UPDATE = {
	present_field: (oid, o) => {
		if (o.obj_type == 'Tick') { return { f: field_update, vis: [oid, 'P'] }; }
	},
}

function field_update(oid, o, field, panel) {
	if (nundef(o.player)) { panel.text(); field.text(); }
	else {
		let pl = getPlayer(o.player._player);
		field.text({ txt: o.symbol, fill: pl.color, fz: field.h / 2, family: 'AlgerianRegular' });
		panel.text({ txt: pl.id + ' placed in ' + o.row + ',' + o.col, fill: 'white' });
	}
	return true;
}

