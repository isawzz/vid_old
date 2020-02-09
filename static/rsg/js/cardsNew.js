function showHands(oid,propList,cardFunc,areaName){

}
function showPlayerHand(oid,propName,cardFunc,areaName){showCollections(playerCollections,oid,[propName],cardFunc,areaName);}
function showCollections(pool,oid,keys,cardFunc,areaName){
	let propName = keys.shift();
	let collDict=getCollections(pool,oid,propName);
	if (nundef(collDict)) return;

	let msArea = getMainArea(areaName);
	if (!msArea){
		console.log('area',areaName,'does NOT exist! CANNOT PRESENT CARDS!!!');
		return;
	}

	for (const key in collDict) {
		let ha = collDict[key];
		let idCollection = getCollectionArea(key, msArea);
		showPlayerHandNew(ha.name, ha.hand, key);
	}


	// //usage: showHand(idPlayer,'devcards',FUNCS.catan_card,'DevCards');
	// //wo wuerde ich cards finden?
	// //oid ist pid, propName ist hand property
	// //oHand ist selectionFunc(o) was ein problem ist, weil wie komm ich jetzt auf die collection?
	// //propName fehlt
	// console.log('showPlayerHand',oid,propName,cardFunc, areaName)
	// let oHand = selectionFunc(o); //selection func should return hand object
	// let arr = getValueArray(oHand);
	// if (isEmpty(arr)) return;
	// //console.log('oHand',oHand);
	// for (const idCard of arr){
		
	// }
	// cardFunc(o);



}








