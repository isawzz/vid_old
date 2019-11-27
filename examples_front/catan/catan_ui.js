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
		if (phase == 'setup' && o.obj_type == 'hex') { return { f: 'setup_field', vis: [id] }; }
	},
};

FUNCS = {
	setup_field: (oid, o, hallo1) => {
		if (nundef(o.res)) { hallo1.setBg(V.colors.desert); }
		else {
			let color = V.colors[o.res];
			hallo1.setBg(color);
			let num = Number(o.num);
			hallo1.text({ txt: '' + o.num, fill: num == 6 || num == 8 ? 'red' : 'white' });
		}
		return true;
	}
}
