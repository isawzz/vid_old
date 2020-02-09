//var mainPlayerCollections = {};
//var otherPlayerCollections = {};
var playerCollections = {};
var tableCollections = {};

function getCollections(pool,oid,propName){return lookup(pool, [oid, propName]);}
function getPlayerCollections(pid, propName) { return lookup(playerCollections, [pid, propName]); }
// function getMainPlayerCollections(pid, propName) { return lookup(mainPlayerCollections, [pid, propName]); }
// function getOtherPlayerCollections(pid, propName) { return lookup(otherPlayerCollections, [pid, propName]); }
function getTableCollections(oid, propName) { return lookup(tableCollections, [oid, propName]); }
function updateCollections() {

	//makeFakeCards(G.playersAugmented[G.player]);


	for (const pid in G.playersUpdated) {
		//let collections = pid == G.player ? mainPlayerCollections : otherPlayerCollections;
		for (const propName of G.playersUpdated[pid].summary) {
			//here got properties of player that have changed
			//check if this property contains collections
			let o = G.playersAugmented[pid][propName];
			let cCurrent = _findCollections(pid + '.' + propName, o);
			if (isEmpty(cCurrent)) continue;
			//console.log('______', pid + '.' + propName, o);
			//console.log('found hands!!!!!! ' + propName, cCurrent);
			//console.log(propName, 'collections!!!:', cCurrent);

			let cLast = _getCollections(pid, propName, playerCollections); //cLast is a dictionary!
			//console.log('in collections:', cLast)

			let currentKeys = cCurrent.map(x => x.name);
			//console.log('currentKeys:', currentKeys)
			for (const c of cCurrent) {
				if (cLast && c.name in cLast) {
					//this collections exists and has already existed, so just its elements have changed
					//console.log(c.name, 'collection has CHANGED!');
					//just replace ploCollections[pid][propName][c.name] by c and mark TBU
					if (nundef(playerCollections[pid])) playerCollections[pid] = {};
					if (nundef(playerCollections[pid][propName])) playerCollections[pid][propName] = {};
					playerCollections[pid][propName][c.name] = c;
					c.tbd = 'update';
					//need to update ploCollections

				} else {
					//this collection has been added new!
					//console.log(c.name, 'collection has been ADDED!');
					// addCollection(pid,propName,c)
					if (nundef(playerCollections[pid])) playerCollections[pid] = {};
					if (nundef(playerCollections[pid][propName])) playerCollections[pid][propName] = {};
					playerCollections[pid][propName][c.name] = c;
					c.tbd = 'add';
				}
			}
			//check for collections that have been removed!
			if (!cLast) continue;
			for (const k in cLast) {
				if (!(currentKeys.includes(k))) {
					//this collection has been removed so it should also be removed from ploCollections!
					//console.log(k, 'collection has been REMOVED!')
					//removeCollection(pid,propName,k)
					playerCollections[pid][propName][c.name].tbd = 'remove'; //this collection can only be removed after its ui has been removed!!!
				}
			}
		}
	}
	//console.log('playerCollections', playerCollections);
	//console.log('otherPlayerCollections', otherPlayerCollections);

	for (const oid in G.tableUpdated) {
		if (!G.table[oid]) continue; //removed oid
		for (const propName of G.tableUpdated[oid].summary) {
			if (propName == 'visible' || propName == 'obj_type') continue;
			//console.log(oid,propName)
			
			let o = G.table[oid][propName];
			if (isSimple(o) || (isDict(o) && isdef(o.generic_type))) continue;
			//console.log('checking',oid,propName,o);
			let cCurrent = _findCollections(oid + '.' + propName, o);
			if (isEmpty(cCurrent)) continue;
			//console.log('______', oid + '.' + propName, o);
			//console.log('found hands!!!!!! ' + propName, cCurrent);
			//console.log(propName, 'collections!!!:', cCurrent);

			let cLast = _getCollections(oid, propName, tableCollections); //cLast is a dictionary!
			//console.log('in tableCollections:', cLast)

			let currentKeys = cCurrent.map(x => x.name);
			//console.log('currentKeys:', currentKeys)
			for (const c of cCurrent) {
				if (cLast && c.name in cLast) {
					//this collections exists and has already existed, so just its elements have changed
					//console.log(c.name, 'collection has CHANGED!');
					//just replace ploCollections[pid][propName][c.name] by c and mark TBU
					if (nundef(tableCollections[oid])) tableCollections[oid] = {};
					if (nundef(tableCollections[oid][propName])) tableCollections[oid][propName] = {};
					tableCollections[oid][propName][c.name] = c;
					c.tbd = 'update';

				} else {
					//this collection has been added new!
					//console.log(c.name, 'collection has been ADDED!');
					// addCollection(pid,propName,c)
					if (nundef(tableCollections[oid])) tableCollections[oid] = {};
					if (nundef(tableCollections[oid][propName])) tableCollections[oid][propName] = {};
					tableCollections[oid][propName][c.name] = c;
					c.tbd = 'add';
				}
			}
			//check for collections that have been removed!
			if (!cLast) continue;
			for (const k in cLast) {
				if (!(currentKeys.includes(k))) {
					//this collection has been removed so it should also be removed from ploCollections!
					//console.log(k, 'collection has been REMOVED!')
					//removeCollection(pid,propName,k)
					tableCollections[oid][propName][c.name].tbd = 'remove'; //this collection can only be removed after its ui has been removed!!!
				}
			}
		}
	}
	//console.log('tableCollections', tableCollections);
}

//#region helpers
function _findCollections(key, o) {

	//console.log('_findCollections','key',key,'o',o)
	let sets = [];

	_recFindCollections(key, o, sets);
	return sets;
}
function _getCollections(oid, propName, pool) {
	let c = pool[oid];
	if (isdef(c)) c = c[propName];
	return c;
}
function _getCollectionType(o) {
	//only works for type=_obj or type=string
	if (nundef(o)) return false;

	//code orig:
	// if (nundef(o._set)) return false;
	// let arr = o._set;

	//code new:
	if (nundef(o._set) && !isList(o)) return false;
	let arr;
	if (isdef(o._set)) arr = o._set; else arr = o;

	//console.log(arr)

	if (!isList(arr) || isEmpty(arr)) return false;

	let type = null;
	let generic_type = null;
	for (const el of arr) {
		if (nundef(el)) return false;

		if (isdef(el._obj)) {
			if (type && type != '_obj') return false;
			type = '_obj';
			let oEl = G.table[el._obj];
			if (nundef(oEl)) return false;
			if (isdef(oEl.generic_type)) {
				if (!generic_type) generic_type = oEl.generic_type;
				if (generic_type != oEl.generic_type) return false;
			}
		} else {
			//this thing is not an _obj collection but could still be another type of collection!!!
			if (type == '_obj') return false;
			if (!type) type = generic_type = 'string';

		}

	}
	return { type: type, generic_type: generic_type };
}
function _presentCollections(oid, propName, msArea) {
	//hier wirds kompliziert!!!!!!!
	//console.log(_getCollections(oid,propName))
}
function _recFindCollections(key, o, sets) {
	//console.log('_recFindCollections, sets:',sets);
	//console.log('recursed for object',key,o);
	//if (['visible','obj_type'].includes(key)) return;
	let tt = _getCollectionType(o);
	//console.log('collection type =',tt)
	if (tt) {

		//console.log('found set:',key,o)
		sets.push({ name: key, key: key, type: tt.type, generic_type: tt.generic_type, hand: o, arr: getSimpleSetElements(o) });
	} else if (isDict(o)) {
		//console.log(o.constructor.name, 'is list:',isList(o),'is array:',Array.isArray(o), o.constructor.name == 'Array')

		//console.log('\tis dict!')
		for (const k in o) {
			let newSets = [];
			_recFindCollections(key + '.' + k, o[k], newSets);
			//console.log('...',newSets)
			for (const s of newSets) {
				//console.log('\tadding',s)
				sets.push(s);
			}
		}
	} else if (isList(o)) {
		//console.log('\tis list!')
		let i = 0;
		for (const cand of o) {
			let k = key + '_' + i;
			i += 1;
			let newSets = [];
			_recFindCollections(k, cand, newSets);
			for (const s of newSets) {
				//console.log('\t?',s)
				sets.push(s);
			}
			//_recFindCollections(k, cand, sets);
		}
	}
}

//#endregion



















