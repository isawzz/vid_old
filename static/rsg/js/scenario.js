
var scenarioQ = [];
var scenarioRunning = false;

function onClickPushScenario(cheatCode, actionCode) {
	//scenarioQ = [];
	scenarioQ.push(() => sendRoute('/cheat/' + cheatCode, () => onClickRunToAction(actionCode)));
	scenarioQ.push(() => onClickSelectTuple(null, strategicBoat([actionCode])));
	console.log('...scenario',scenarioQ)
	if (!scenarioRunning) { scenarioRunning = true; onClickStep(); }
}



//#region example scenario: buy 1 or more devcards
//scenarios are specified in user spec! see catan_ui.yaml
function cheatDevcard() { sendRoute('/cheat/devcard', runToDevdeckAction); }
function runToDevdeckAction() { onClickRunToAction('devdeck'); }
function selectBuyDeckcard() { onClickSelectTuple(null, strategicBoat(['devdeck'])); }
function onClickScenario() {
	scenarioQ = [];
	for (let i = 0; i < 1; i++) {
		scenarioQ.push(cheatDevcard);
		scenarioQ.push(selectBuyDeckcard);
	}
	if (!scenarioRunning) { scenarioRunning = true; onClickRunToNextPhase(); }
	console.log('...scenario',scenario)
	//onClickRunToNextPhase();
}
//#endregion









