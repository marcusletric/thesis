angular.module('fps_game.network').service('webSocket', function($q,gameConfigModel){
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
        gameServer =  new WebSocket(gameConfigModel.serverAddr);

        gameServer.onopen = function (event) {
            var arguments = [
                "setClientID"
            ];
            console.log('Connecting to game server on: ' + gameConfigModel.serverAddr );
            sendCommand('getNewId',arguments);
        };

        gameServer.onmessage = function (event) {
            var data = angular.fromJson(event.data);
            listeners[data.listener] && listeners[data.listener](data.data);
        };

        return initDeferred.promise;
    };

    this.close = function(){
        listeners = {};
        gameServer && gameServer.close();
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

    this.playerScore = function(dmg,player){
        var arguments = [
            dmg,
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

        gameServer && gameServer.send(JSON.stringify(msg));

    }

    function rand() {
        return Math.random().toString(36).substr(2);
    }

    function token(){
        return rand() + rand();
    }
});
