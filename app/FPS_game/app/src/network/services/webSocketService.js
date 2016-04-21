angular.module('fps_game.network').service('webSocket', function($q,config){
    var listeners = {};
    var gameServer = null;
    var clientID = token();
    var initDeferred = $q.defer();

    listeners.setClientID = function (newID){
        clientID = newID;
        initDeferred.resolve(clientID);
        console.log('Connected, clientID set to: ' + clientID);
    };

    this.connect = function(){
        gameServer =  new WebSocket(config.gameServerAddress);

        gameServer.onopen = function (event) {
            var arguments = [
                "setClientID"
            ];
            console.log('Connecting to game server on: ' + config.gameServerAddress );
            sendCommand('getNewId',arguments);
        };

        gameServer.onmessage = function (event) {
            var data = angular.fromJson(event.data);
            listeners[data.listener](data.data);
        };

        return initDeferred.promise;
    };

    this.getAllPlayers = function(){
        var arguments = [
            "getAllPlayers"
        ];
        sendCommand('getPlayers',arguments);
    };

    this.playerUpdate = function(player){
        var arguments = [
            player
        ];
        sendCommand('playerUpdate',arguments);
    };

    this.playerTakeDmg = function(data){
        var arguments = [
            data
        ];
        sendCommand('playerTakeDmg',arguments);
    };

    this.playerScore = function(player){
        var arguments = [
            player
        ];
        sendCommand('playerScore',arguments);
    };

    this.addPlayer = function(player){
        var arguments = [
            player
        ];
        sendCommand('addPlayer',arguments);
    };

    this.addListener = function(listenName,listener){
        listeners[listenName] = listener;
    };

    function sendCommand(command,arguments) {
        // Construct a msg object containing the data the server needs to process the message from the chat client.
        var msg = {
            command: command,
            arguments: arguments
        };

        gameServer.send(JSON.stringify(msg));

    }

    function rand() {
        return Math.random().toString(36).substr(2);
    }

    function token(){
        return rand() + rand();
    }
});
