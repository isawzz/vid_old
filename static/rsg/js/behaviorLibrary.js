
function bgNum(k,v){
	//let ms=dddddddddddddddddddddddddddddddsssssssssssssssssssssssss
}

function showPlayerStats(plid, propName, areaName) {
	console.log(getFunctionCallerName())

	let oPlayer = G.playersAugmented[plid];
	let oStatsVal = oPlayer[propName];
	let msStats = UIS[getIdArea(areaName)];
	console.log(oPlayer,oStatsVal,msStats);
	// if (isSet(oCards)) oCards = oCards._set;
	// //now oCards should be a list!
	// if (!isListOfLiterals(oCards)) { alert('wrong format of cards property: ' + propName); }
	// let oids = oCards.map(x => x._obj);
	// let idHand = getIdArea(areaName);
	// //console.log('showPlayerHand: idArea for',areaName,'is',idHand)
	// if (_handChanged(oids, idHand)) {
	// 	//console.log('hand of',plid,'has changed:',ids)
	// 	_clearHand(idHand);
	// 	_showHand(oids, idHand);
	// }

}
