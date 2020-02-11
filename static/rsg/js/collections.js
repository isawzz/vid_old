var collections = {};

//#region updating collections: process
function updateCollections() {
	//TODO: put this in user spec!
	S.settings.collectionTypes={playerProps:['hand','devcards'],objectProps:['neutral']};
	_updateCollections(G.playersUpdated,G.playersAugmented,S.settings.collectionTypes.playerProps);
	_updateCollections(G.tableUpdated,G.table,S.settings.collectionTypes.objectProps);
	console.log('up-to-date collections:',collections);
}

//#region update collections helpers
function _findCollections(key, o) {

	//console.log('_findCollections','key',key,'o',o)
	let sets = [];

	_recFindCollections(key, o, sets);
	return sets;
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
function _updateCollections(propChanges,pool,propNames){
	//console.log('changed properties',propChanges)
	//console.log('propNames',propNames)
	for (const oid in propChanges) {
		let o = pool[oid];

		//if this object is NOT visible to current main player, then the collections in this object must be set to invisible
		//console.log(oid,o,propChanges[oid].summary)

		if (!o || isBoardElementObject(o) || isBoardObject(o) || isDeckObject(o)) continue; //removed oid
		for (const propName of propChanges[oid].summary) {
			if (!propNames.includes(propName)) continue; // (propName == 'visible' || propName == 'obj_type') continue;
			//console.log(oid,propName)
			
			let o = pool[oid][propName];
			//console.log(o)
			if (isSimple(o) || (isDict(o) && isdef(o.generic_type))) continue;
			//console.log('calling _findCollections for',oid,propName,o);


			let cLast = getCollections(oid, propName); //cLast is a dictionary!
			let cCurrent = _findCollections(oid + '.' + propName, o);
			if (isEmpty(cCurrent) && isEmpty(cLast)) continue;

			//console.log('cLast:',cLast);
			//console.log('cCurrent:',cCurrent);
			//console.log('______', oid + '.' + propName, o);
			//console.log('found hands!!!!!! ' + propName, cCurrent);
			//console.log(propName, 'collections!!!:', cCurrent);

			//console.log('in collections:', cLast)

			let currentKeys = cCurrent.map(x => x.name);
			//console.log('currentKeys:', currentKeys)
			for (const c of cCurrent) {
				if (cLast && c.name in cLast) {
					//this collections exists and has already existed, so just its elements have changed
					//console.log(c.name, 'collection has CHANGED!');
					//just replace ploCollections[pid][propName][c.name] by c and mark TBU
					if (nundef(collections[oid])) collections[oid] = {};
					if (nundef(collections[oid][propName])) collections[oid][propName] = {};
					collections[oid][propName][c.name] = c;
					c.tbd = 'update';
					//console.log('update for',c.name);

				} else {
					//this collection has been added new!
					//console.log(c.name, 'collection has been ADDED!');
					// addCollection(pid,propName,c)
					if (nundef(collections[oid])) collections[oid] = {};
					if (nundef(collections[oid][propName])) collections[oid][propName] = {};
					collections[oid][propName][c.name] = c;
					c.tbd = 'add';
					//console.log('add for',c.name);
				}
			}
			//check for collections that have been removed!
			if (!cLast) continue;
			for (const k in cLast) {
				if (!(currentKeys.includes(k))) {
					//this collection has been removed so it should also be removed from ploCollections!
					//console.log('remove for',k);
					// //console.log(k, 'collection needs to be REMOVED!')
					//removeCollection(pid,propName,k)
					collections[oid][propName][k].tbd = 'remove'; //this collection can only be removed after its ui has been removed!!!
				}
			}
		}
	}
}

//**************************************** */
//#region presenting collections: present
function getCollections(oid,propName){return isdef(propName)? lookup(collections, [oid, propName]):collections[oid];}
function getCollectionArea(key, msParentArea) {
	let a = UIS[getIdArea(key)];
	if (nundef(a)) {

		a = makeCollectionArea(key, msParentArea.id);

	}
	let idHand = a.id;

	return idHand;
}
function makeCollectionArea(key, parentAreaId) {
	let parentArea = UIS[parentAreaId];
	let handAreaName = key;
	if (isdef(parentArea)) {
		//let h = 300;
		//let w=parentArea.w;
		let ms = makeArea(handAreaName, parentAreaId);
		ms.setBg(randomColor());
		//ms.setHeight(h);
		ms.title(stringAfter(key,'.'));
		let bTitle = getBounds(ms.parts.title);
		//console.log('---------title bounds:',bTitle); //getBounds(ms.parts.title));
		//ms.cardOffsetXY = { x: 0, y: 35 };
		ms.parts['title'].fontSize = '12px';
		ms.elem.style.minWidth = bTitle.width + 'px'; //'90px';
		ms.elem.style.minHeight = '146px';
		ms.body('hand');//,'red');
		let div = ms.parts['hand'];
		div.style.position = 'relative';
		div.style.left = '10px';
		div.style.top = '10px';
		div.style.width = 'auto';
		div.style.height = 'auto';
		ms.collectionKey = key;
		ms.adjustSize = true;
		let divCollection = ms.elem;
		divCollection.style.position = null;

		return ms;

	}

}






















