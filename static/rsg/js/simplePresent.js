//presents default objects in objects tab
//presents default players in players tab
//in game_area does NOT present ANYTHING except what spec&behavior dictates!!!
//defaults are only created for objects NOT created in game area!

function presentTableSimple() {
	_tableRemoveSimple();
	_tableCreateNewSimple();
	_tableUpdateSimple();

}
function _tableRemoveSimple() {
	for (const oid of G.tableRemoved) {
		//console.log('deleting all related to', oid)
		deleteOid(oid);
	}
}
function _tableCreateNewSimple() {
	for (const oid of G.tableCreated) {

		let o = G.table[oid];
		if (S.settings.table.ignoreTypes.includes(o.obj_type)) continue;

		console.assert(!defaultVisualExists(oid), 'DEFAULT VISUAL EXISTS FOR ' + oid, o);
		//console.assert(!mainVisualExists(oid), 'MAIN VISUAL EXISTS FOR ' + oid, o);

		let updatedVisuals = runBehaviors(oid, G.table, TABLE_CREATE);

		if (!updatedVisuals.includes(oid) && !mainVisualExists(oid)) {
			makeDefaultObject(oid, G.table[oid], S.settings.table.defaultArea);
		} else {
			console.log(updatedVisuals.includes(oid) ? 'created ' + oid : 'exists:' + oid);
		}
	}
}
function _tableUpdateSimple() {
	//console.log('___________________TABLE UPDATE')
	for (const oid in G.tableUpdated) {
		let o = G.table[oid];
		if (nundef(o)) continue;

		let ms = getVisual(oid);

		let updatedVisuals = runBehaviors(oid, G.table, TABLE_UPDATE);

		presentDefault(oid, G.table[oid]);
	}
}



function presentPlayersSimple() {

}









