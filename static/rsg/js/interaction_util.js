function hideTooltip(){
	//console.log('cleaning tooltip')
	$('div#tooltip').css({ display: 'none' });
}

function highAux(oid){mapSafe('high',getAuxVisuals,oid);}
function highMain(oid){mapSafe('high',getVisual,oid);}
function highAll(oid){mapSafe('high',getVisuals,oid);}
function unhighAux(oid){mapSafe('unhigh',getAuxVisuals,oid);}
function unhighMain(oid){mapSafe('unhigh',getVisual,oid);}
function unhighAll(oid){mapSafe('unhigh',getVisuals,oid);}

//TODO: goes to helpers!
function mapSafe(func,listFunc,oid){
	let uis=listFunc(oid);
	if (!isdef(uis))return;
	if (!isList(uis)) uis=[uis];
	uis.map(x=>x[func]());
}


