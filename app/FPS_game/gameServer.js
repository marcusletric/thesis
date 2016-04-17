var ws = require("nodejs-websocket");
const WSPORT=9001;
const WSHOST="localhost";

var players = {};
var currID = 10;

var self = this;
var connections = {};

var gameServer = ws.createServer(function (conn) {
    console.log('Player connected');

    conn.clientID = currID;

    connections[conn.clientID] = conn;

    conn.on("text", function (str) {
        var jsonData = JSON.parse(str);
        callFunction(jsonData['command'],jsonData['arguments'],conn);
    });

    conn.on("close", function (code, reason) {
        console.log('Player ' + conn.clientID + ' disconnected');
        if(players[conn.clientID]) {
            removePlayer(players[conn.clientID]);
        }
    });

    conn.on("error", function (code, reason) {
        if(players[conn.clientID]) {
            removePlayer(players[conn.clientID]);
        }
    });

    currID++;
}).listen(WSPORT,WSHOST);

console.log("Gameserver started on port " + WSPORT);


this.addPlayer = function(player) {
    console.log('Player ' + player.id + ' added to pool');
    players[player.id] = player;
    broadcast({
        'listener': 'playerConnect',
        'data': player
    });
};

function removePlayer(player){
    delete(players[player.id]);
    broadcast({
        'listener': 'playerDisconnect',
        'data': player
    });
}

this.getPlayers = function(listener){
    return {
        'listener': listener,
        'data': players
    };
};

this.playerUpdate = function(player,connection){
    players[player.id] = player;
    player.sender = connection.clientID;
    broadcast({
        'listener': 'playerUpdate',
        'data': player
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

function callFunction(command,arguments,connection){
    if(['getNewId', 'playerUpdate'].indexOf(command) > -1 ){
        arguments = arguments.concat(connection);
    }

    var res = self[command].apply(this,arguments);
    if(res){
        sendResponse(connection,res);
    }
}

function sendResponse(conn,response){
    conn.sendText(JSON.stringify(response));
}

function broadcast(data){
    gameServer.connections.forEach(function (conn) {
        conn.sendText(JSON.stringify(data));
    });
}