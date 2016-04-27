var ws = require("nodejs-websocket");
var Game = require('./gameInstance.js');

const WSPORT=9001;
const WSHOST="10.1.14.107";

var queueTimer;
var queueTime=120000;

var gameTimer;
var gameTime=600000;

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

this.addPlayer = function(player) {
    if(!player || !player.id || typeof(player.id) != "number"){
        return false;
    }
    console.log('Player ' + player.id + ' added to pool');
    player.active = true;
    player.gameID = gameIncrementID;
    players[player.id] = player;

    broadcast(self.getPlayers());
};

function removePlayer(player){
    players[player.id].active = false;
    activeGame.unQueue(player);

    broadcast(self.getPlayers());
}

this.playerReadyStateChange = function(player){
    players[player.id].ready = player.ready;
    if(players[player.id].ready != !!activeGame.inQueue(player)){
        player.ready ? activeGame.queue(player) : activeGame.unQueue(player);
    }

    broadcast(self.getPlayers());
};

function startQueue(){
    activeGame = new Game(gameIncrementID,players);
    activeGame.startQueueing((new Date()).getTime(),queueTime);
    for(var id in players){
        if(players[id].active && players[id].ready && !activeGame.inQueue(players[id])){
            activeGame.queue(players[id]);
        }
    }

    console.log('Queueing players');

    broadcast(self.getPlayers());

    broadcast({
        'listener': 'updateGame',
        'data': activeGame
    });

    queueTimer = setTimeout(startGame,queueTime);
}

function startGame(){
    console.log('Starting a new game...');
    activeGame.startGame((new Date()).getTime(),gameTime);
    gameTimer = setTimeout(endGame,gameTime);

    broadcast(self.getPlayers());

    broadcast({
        'listener': 'startGame',
        'data': activeGame
    });

    gameIncrementID++;
}

function endGame(){
    console.log('Game ended');
    activeGame.endGame();
    setTimeout(startQueue,10000);

    broadcast(self.getPlayers());

    broadcast({
        'listener': 'endGame',
        'data': activeGame
    });
}

this.getPlayers = function(){
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
        'listener': 'getPlayers',
        'data': activePlayers
    };
};

this.playerUpdate = function(player){
    if(!players[player.id]){
        return false;
    }
    players[player.id] = player;

    broadcast({
        'listener': 'playerUpdate',
        'data': player
    });
};

this.updateGame = function(){
    broadcast({
        'listener': 'updateGame',
        'data': activeGame
    });
};

this.playerTakeDmg = function(player){
    broadcast({
        'listener': 'playerTakeDmg',
        'data': player
    });
};

this.ping = function(player){
    return {
        'listener': 'pong',
        'data': player
    };
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

    if(activeGame && player.gameID == activeGame.id && players[player.id] && !connections[player.id]){
        console.log('restoring connection');
        delete(connections[conn.clientID]);
        delete(players[conn.clientID]);
        conn.clientID = player.id;
        connections[player.id] = conn;
        players[player.id].active = true;
        players[player.id].inGame = true;
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