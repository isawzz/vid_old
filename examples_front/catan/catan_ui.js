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
		if (phase == 'setup' && o.obj_type == 'hex') { return { f: setup_field, vis: [id] }; }
	},
};

function setup_field(oid, o, field) {
	if (nundef(o.res)) { field.setBg(V.colors.desert); }
	else {
		let color = V.colors[o.res];
		field.setBg(color);
		let num = Number(o.num);
		field.text({ txt: '' + o.num, fill: num == 6 || num == 8 ? 'red' : 'white' });
	}
	return true;
}

