function sendAction(boat, callbacks = []) {
	timit.timeStamp('send');
	let pl = G.playersAugmented[G.player];

	let route = '/action/' + pl.username + '/' + G.serverData.key + '/' + boat.desc + '/';
	let t = boat.tuple;
	//console.log('tuple is:',t);

	_sendRoute(route + t.map(x => pickStringForAction(x)).join('+'), data => {
		//console.log(data)
		data = JSON.parse(data)
		processData(data);
		if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
	});
}
function _createAgents(agentNames,agentType='regular', callback) {
	data = { 'agent_type': agentType };//, 'timeout':timeout}
	let route = '/add/client/agent/'+agentNames.join('+');
	if (nundef(counters)) counters = { msg: 0 };
	counters.msg += 1;
	let prefix = last(SERVER_URL) == '/' ? dropLast(SERVER_URL) : SERVER_URL;
	if (route[0] != '/') route = '/' + route;
	let url = prefix + route;
	console.log(counters.msg + ': request sent: ' + url);
	$.ajax({
		type: 'POST',
		url: url,
		data: JSON.stringify(data),
		success: response => callback(response),
		error: function (e) {
			console.log(e);
			callback(e.responseText)
		},
		dataType: "json",
		contentType: "application/json"
	});
}
function _postRoute(route, callback) {
	data = { 'agent_type': 'regular' };//, 'timeout':timeout}
	if (nundef(counters)) counters = { msg: 0 };
	counters.msg += 1;
	let prefix = last(SERVER_URL) == '/' ? dropLast(SERVER_URL) : SERVER_URL;
	if (route[0] != '/') route = '/' + route;
	let url = prefix + route;
	console.log(counters.msg + ': request sent: ' + url);
	$.ajax({
		type: 'POST',
		url: url,//"http://localhost:8080/project/server/rest/subjects",
		data: JSON.stringify(data),
		// data: JSON.stringify({
		// 	"subject:title": "Test Name",
		// 	"subject:description": "Creating test subject to check POST method API",
		// 	"sub:tags": ["facebook:work", "facebook:likes"],
		// 	"sampleSize": 10,
		// 	"values": ["science", "machine-learning"]
		// }),
		success: response => callback(response),
		error: function (e) {
			console.log(e);
			callback(e.responseText)
		},
		dataType: "json",
		contentType: "application/json"
	});
}
function _sendRoute(route, callback) {
	if (nundef(counters)) counters = { msg: 0 };
	counters.msg += 1;
	let prefix = last(SERVER_URL) == '/' ? dropLast(SERVER_URL) : SERVER_URL;
	if (route[0] != '/') route = '/' + route;
	let url = prefix + route;
	console.log(counters.msg + ': request sent: ' + url);

	$.ajax({
		url: url,
		type: 'GET',
		success: response => {
			try {
				let js = JSON.parse(response);
				if (js.error) {
					//alert('GSM ERROR MESSAGE: '+js.error.msg);
					console.log(js.error.msg)
				}
			} catch{
				//console.log('NOT JSON: ',response);
			}
			if (callback) callback(response);
		},
		error: err => { error(err); alert(err); },
	});
}
function _sendRouteJS(route, callback) {
	//console.log('---------------------------------')
	counters.msg += 1;
	let prefix = last(SERVER_URL) == '/' ? dropLast(SERVER_URL) : SERVER_URL;
	if (route[0] != '/') route = '/' + route;
	let url = prefix + route;
	console.log(counters.msg + ': request sent: ' + url);
	let jsCode;
	$.ajax({
		url: url,
		type: 'GET',
		success: response => {
			//console.log('***_sendRouteJS*** success, response type:', typeof response);
			cntParses = 0;
			let data;
			try {
				while (typeof response == 'string') {
					response = JSON.parse(response);
					cntParses += 1;
				}
				//console.log('result of', cntParses, 'json parse:', typeof response, response);
				data = { response: response };
			} catch{
				//if cannot make json object!
				//take response as string and turn into object manually
				//console.log('***_sendRouteJS*** PARSE ERROR!!!! cannot parse to JSON!', response);
				//alert('***_sendRouteJS*** PARSE ERROR!!!!');
				data = { error: 'PARSE ERROR', response: response, type: 'parse', responseType: (typeof response) };
			}
			callback(data);
		},
		error: err => {
			//console.log('***_sendRouteJS*** AJAX ERROR!!!!', response);
			alert('***_sendRouteJS*** AJAX ERROR!!!!');
			callback({ error: 'PARSE ERROR', response: err, type: 'ajax', responseType: (typeof err) });
		},
	});
}
function loadUserSpec(callbacks = []) {
	timit.showTime(getFunctionCallerName());
	S.path.spec = '/examples_front/' + S.settings.game + '/' + S.settings.game + '_ui.yaml';
	loadYML(S.path.spec, dSpec => {
		S.user.spec = dSpec;
		if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
	});
}
function loadUserCode(callbacks = []) {
	timit.showTime(getFunctionCallerName());
	S.path.script = '/examples_front/' + S.settings.game + '/' + S.settings.game + '_ui.js';
	loadScript(S.path.script, dScript => {
		loadText(S.path.script, code => {
			S.user.script = code;
			//console.log(code);
			if (!empty(callbacks)) callbacks[0](arrFromIndex(callbacks, 1));
		});
	});
}

//#region helpers
function chainSend(msgChain, callback) {
	let akku = [];
	this.chainSendRec(akku, msgChain, callback);
}
function chainSendRec(akku, msgChain, callback) {
	if (msgChain.length > 0) {
		//console.log('sending:', msgChain[0]);
		_sendRoute(msgChain[0], d => {
			//console.log('received:', d)
			akku.push(d);
			this.chainSendRec(akku, msgChain.slice(1), callback)
		});
	} else {
		//console.log(akku);
		callback(akku);
	}
}
function pickStringForAction(x) {
	//x is a tuple element, eg., {type:'fixed', val:'pass'} or {ID: "0", val: "hex[0]", type: "obj"}
	//console.log('pickStringForAction',x)
	if (x.type == 'fixed') return x.val;
	if (x.type == 'obj') return x.ID;
	if (x.type == 'player') return x.val;
}
