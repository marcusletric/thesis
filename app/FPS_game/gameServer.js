var ws = require("nodejs-websocket");
var Game = require('./gameInstance.js');

const WSPORT=9001;
const WSHOST="localhost";

var queueTimer;
var queueTime=12000;

var gameTimer;
var gameTime=300000;

var players = {};
var playerIncrementID = 10;

var gameIncrementID = 10;
var activeGame = new Game(gameIncrementID);


var self = this;
var connections = {};
var connIncrementID = 10;

var gameServer = ws.createServer(function (conn) {
    console.log('Player connected');

    conn.clientID = playerIncrementID ;
    conn.id = connIncrementID ;

    connections[conn.clientID] = conn;

    conn.on("text", function (str) {
        var jsonData = JSON.parse(str);
        callFunction(jsonData['command'],jsonData['arguments'],conn);
    });

    conn.on("close", function (code, reason) {
        console.log('Player ' + conn.clientID + ' disconnected');
        if(players[conn.clientID]) {
            removePlayer(players[conn.clientID]);
            delete(connections[conn.clientID]);
        }
    });

    conn.on("error", function (code, reason) {
        console.log('Player ' + conn.clientID + ' disconnected');
        if(players[conn.clientID]) {
            removePlayer(players[conn.clientID]);
            delete(connections[conn.clientID]);
        }
    });

    connIncrementID++;
    playerIncrementID++;
}).listen(WSPORT,WSHOST);

console.log("Gameserver started on " + WSHOST + ":" + WSPORT);

this.getGameState = function(){
    return {
        'listener': 'getGameState',
        'data': activeGame.state
    };
};

this.getQueue = function(){
    return {
        'listener': 'getQueue',
        'data': activeGame.playerQueue
    };
};

this.addPlayer = function(player) {
    if(!player || !player.id || typeof(player.id) != "number"){
        return false;
    }
    console.log('Player ' + player.id + ' added to pool');
    player.active = true;
    player.gameID = gameIncrementID;
    players[player.id] = player;

    broadcast(self.getPlayers('getAllPlayers'));
};

function removePlayer(player){
    players[player.id].active = false;
    activeGame.unQueue(player);

    broadcast(self.getPlayers('getAllPlayers'));
}

this.playerReadyStateChange = function(player){
    players[player.id].ready = player.ready;
    if(players[player.id].ready != !!activeGame.inQueue(player)){
        player.ready ? activeGame.queue(player) : activeGame.unQueue(player);
    }
    broadcast({
        'listener': 'updateUserPlayer',
        'data': player
    });

    broadcast(self.getPlayers('getAllPlayers'));
};

function startQueue(){
    activeGame = new Game(gameIncrementID);
    activeGame.startQueueing(new Date().getTime().toString(),queueTime);
    console.log('Queueing players');
    for(key in players){
        if(players[key] && players[key].ready){
            activeGame.queue(players[key]);
        }
    }
}

function startGame(){
    console.log('Starting game...');
    activeGame.startGame();
    gameTimer = setTimeout(endGame,gameTime);
    broadcast({
        'listener': 'startGame',
        'data': activeGame
    });
}

function endGame(){
    console.log('Game ended');
    activeGame.endGame();
    gameIncrementID++;
    setTimeout(startQueue,10000);
    broadcast({
        'listener': 'startGame',
        'data': activeGame
    });
}

this.getPlayers = function(listener){
    var activePlayers = {};
    for(id in players){
        if(players[id].active) {
            activePlayers[id] = {};
            for (key in players[id]) {
                activePlayers[id][key] = players[id][key];
            }
        }
    }
    return {
        'listener': listener,
        'data': activePlayers
    };
};

this.playerUpdate = function(player){
    if(!players[player.id]){
        return false;
    }
    players[player.id] = player;
    if(activeGame && activeGame.running){
        activeGame.activePlayers.forEach(function(activePlayer){
            if(activePlayer.id == player.id){

            }
        });
    }
    broadcast({
        'listener': 'playerUpdate',
        'data': player
    });
};

this.playerTakeDmg = function(player){
    broadcast({
        'listener': 'playerTakeDmg',
        'data': player
    });
};

this.ping = function(){
    return 'pong';
};

this.playerScore = function(dmg,player){
    broadcast({
        'listener': 'playerScore',
        'data': {'dmg': dmg, 'player': player}
    });
};

this.getNewId = function(listener,conn){
    var responseObj = {
        'listener': listener,
        'data': conn.clientID
    };
    console.log('New ID ' + conn.clientID + ' served');
    return responseObj;
};

this.debug = function(){
    var responseObj = {
        'listener': 'debug',
        'data': [activeGame,players]
    };
    return responseObj;
};

this.reconnect = function(player,conn) {
    console.log('Player trying to reconnect');
    var responseObj = {
        'listener': 'reconnect'
    };

    if(activeGame && player.gameID == activeGame.id && playerIncrementID > player.id && players[player.id] && !connections[player.id]){
        console.log('restoring connection');
        delete(connections[conn.clientID]);
        delete(players[conn.clientID]);
        conn.clientID = player.id;
        connections[player.id] = conn;
        players[player.id].active = true;
        console.log('restoring player');
        responseObj.data = players[player.id];
        console.log('Connection sucessfully restored.');
    } else {
        responseObj.data = false;
        console.log('Reconnect failed, ID stays the same.');
    }
    return responseObj;
};

function callFunction(command,arguments,connection){
    if(['getNewId', 'playerUpdate', 'reconnect'].indexOf(command) > -1 ){
        arguments = arguments.concat(connection);
    }

    var res = self[command].apply(this,arguments);
    if(res){
        sendResponse(connection,res);
    }
}

function sendResponse(conn,response){
    conn.sendText(
        JSON.stringify(
            response
        )
    );
}

function broadcast(data){
    gameServer.connections.forEach(function (conn) {
        conn.sendText(JSON.stringify(data));
    });
}

startQueue();

queueTimer = setTimeout(startGame,queueTime);