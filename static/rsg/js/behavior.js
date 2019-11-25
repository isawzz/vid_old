var TABLE_UPDATE = {};
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

			//console.log('behaviors: clear',visualsToBeUpdated)
			//console.log(name,o,oid,params)

			//clear elements to be updated
			//for (const vis of visualsToBeUpdated) clearElement(vis.elem);
			//console.log('behavior result:',todo.f.name,oid,params);

			//call update function
			let updated = todo.f(oid, o, ...visualsToBeUpdated);
			if (updated) res.push(oid);
			//console.log('visualization result:',res);
		}
	}
	return res;
}

