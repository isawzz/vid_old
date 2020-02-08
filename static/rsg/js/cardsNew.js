function showHand(oid,o,selectionFunc,cardFunc,areaName){
	//usage: showHand(idPlayer,o,x=>x.devcards,FUNCS.catan_card,'DevCards');
	let oHand = selectionFunc(o); //selection func should return hand object
	let arr = getValueArray(oHand);
	if (isEmpty(arr)) return;
	console.log('oHand',oHand);



}









