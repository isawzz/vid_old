var TABLE_UPDATE = {};
var FUNCS = {};
var PLAYER_UPDATE = {};
var TABLE_CREATE = {};
var PLAYER_CREATE = {};
var V = {};

//UI generation simple
function runBEHAVIOR_new(oid, pool, behaviors) {
	//console.log('runBEHAVIOR_new',oid,pool,behaviors)
	let res = [];
	for (const name in behaviors) {
		let o = pool[oid];
		let todo = behaviors[name](oid, o, G.serverData.phase);
		//console.log(todo);
		if (isdef(todo)) {
			let visualsToBeUpdated = isdef(todo.vis) ? todo.vis.map(x => getVisual(x)) : [];

			//console.log('behaviors: visualsToBeUpdated',visualsToBeUpdated)
			//console.log(name,o,oid,params)

			//clear elements to be updated
			//for (const vis of visualsToBeUpdated) clearElement(vis.elem);
			//console.log('behavior result:',todo.f.name,oid,params);

			//call update function
			// console.log('__________________')
			// console.log('todo.f',todo.f)
			// console.log('behaviors[todo.f]',behaviors[todo.f])
			// console.log('oid',oid)
			// console.log('o',o)
			// console.log('visualsToBeUpdated',visualsToBeUpdated)
			// console.log('...visualsToBeUpdated',...visualsToBeUpdated)
			// console.log('visualsToBeUpdated[0]',visualsToBeUpdated[0])

			let updated = FUNCS[todo.f](oid, o, ...visualsToBeUpdated);
			if (updated) res.push(oid);
			//console.log('visualization result:',res);
		}
	}
	return res;
}

