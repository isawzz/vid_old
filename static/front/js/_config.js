var USERNAME = 'dwight';
var GAME = 'ttt'; // catan | ttt
var PLAYMODE = 'hotseat'; // multiplayer | hotseat | solo | passplay
var SEED = 1;
//var AI_TYPE = 'random';
const PLAYER_CONFIG_FOR_MULTIPLAYER = ['me', 'human', 'human'];

const USE_SOCKETIO = false;
const USE_BACKEND_AI = true;
const IS_MIRROR = false;
const FLASK = true;
const PORT = '5000';
const NGROK = null;// 'http://ee91c9fa.ngrok.io/'; // null;//'http://f3629de0.ngrok.io/'; //null; //'http://b29082d5.ngrok.io/' //null; //'http://2d97cdbd.ngrok.io/';// MUSS / am ende!!! 
const SERVER_URL = IS_MIRROR ? 'http://localhost:5555/' : FLASK ? (NGROK ? NGROK : 'http://localhost:' + PORT + '/') : 'http://localhost:5005/';

//general settings: 
var S_tooltips = 'OFF';
var S_openTab = 'Seattle';

var S_userSettings = true;
var S_userStructures = true;
var S_userBehaviors = true;

var S_autoplay = false;
var S_showEvents = false; //unused
var S_AIThinkingTime = 30;
var S_autoplayFunction = (_g) => false;//_g.phase == 'setup';// false; //counters.msg < 25; //counters.msg < 13; // false; //G.player!='White' && G.player != 'Player1';

//rsg settings
var S_boardDetection = true; //if no spec per default use board detection
var S_useColorHintForProperties = true; //color hint used as foreground when writing prop vals on object
var S_useColorHintForObjects = true;//color hint used as background when creating new objects (eg., road)
var S_defaultObjectArea = 'a_d_objects';
var S_defaultPlayerArea = 'a_d_players';

//other stuff
const names = ['felix', 'amanda', 'sabine', 'tom', 'taka', 'microbe', 'dwight', 'jim', 'michael', 'pam', 'kevin', 'darryl', 'lauren', 'anuj', 'david', 'holly'];
var view = null;
var isPlaying = false; //initially
var isReallyMultiplayer = false;

var gcs = {
	ttt: {
		numPlayers: 2,
		players: [
			{ id: 'Player1', playerType: 'me', agentType: null, username: USERNAME },
			{ id: 'Player2', playerType: 'me', agentType: null, username: USERNAME + '1' },
		]
	},
	aristocracy: {
		numPlayers: 2,
		players: [
			{ id: 'Player1', playerType: 'me', agentType: null, username: USERNAME },
			{ id: 'Player2', playerType: 'me', agentType: null, username: USERNAME + '1' },
		]
	},
	catan: {
		numPlayers: 3,
		players: [
			{ id: 'White', playerType: 'me', agentType: null, username: USERNAME },
			{ id: 'Red', playerType: 'me', agentType: null, username: USERNAME + '1' },
			{ id: 'Blue', playerType: 'me', agentType: null, username: USERNAME + '2' },
			// { id: 'Red', playerType: 'AI', agentType: 'regular', username: 'bot0' },
			// { id: 'Blue', playerType: 'AI', agentType: 'random', username: 'bot1' },
		]
	}
}

