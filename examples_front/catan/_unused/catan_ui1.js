V = {
	colors: {
		ore: 'green',
		wheat: colorTrans('goldenrod', .75),
		sheep: colorTrans('lime'),
		brick: colorTrans('tomato'),
		wood: colorTrans('sienna'),
		desert: colorTrans('beige', .6)
	}
};

TABLE_UPDATE = {
	resources_numbers: (id, o, phase) => {
		if (phase == 'setup' && o.obj_type == 'hex') { return { f: 'setup_field1', vis: [id] }; }
	},
};

FUNCS = {
	setup_field1: (oid, o, hallo1) => {
		console.log('..........in setup_field1')
	},
}
