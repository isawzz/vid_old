var USERNAME='dwight';
var GAME='catan'; // catan | ttt
var PLAYMODE = 'solo'; // multiplayer | hotseat | solo

const USE_SOCKETIO = false;
const IS_MIRROR = false;
const FLASK = true;
const PORT = '5000';
const NGROK = null;//'http://f3629de0.ngrok.io/'; //null; //'http://b29082d5.ngrok.io/' //null; //'http://2d97cdbd.ngrok.io/';// MUSS / am ende!!! 
const SERVER_URL = IS_MIRROR ? 'http://localhost:5555/' : FLASK ? (NGROK ? NGROK : 'http://localhost:'+PORT+'/') : 'http://localhost:5005/';

//initial settings: 
var S_tooltips = 'OFF';
var S_openTab = 'a_d_London';
var S_useSpec = false;
var S_useBehaviors = true;
var S_boardDetection = true; //false 
var S_defaultObjectArea = 'a_d_objects';
var S_defaultPlayerArea = 'a_d_players';
var S_autoplay = false;
var S_showEvents = false; //unused
var S_AIThinkingTime = 30;
var S_autoplayFunction = (_g) => false; //counters.msg < 25; //counters.msg < 13; // false; //G.player!='White' && G.player != 'Player1';

