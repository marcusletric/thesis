angular.module('fps_game.network').service('webSocket', function($q,gameConfigModel,$cookies){
    var self = this;

    var listeners = {};
    var gameServer = null;
    var clientID = 0;
    var initDeferred = $q.defer();
    var activeCookie = null;
    var alive = false;
    var reconnecting = false;

    listeners.setClientID = [function (newID){
        activeCookie = $cookies.getObject('Player');
        clientID = newID;
        if(!activeCookie){
            initDeferred.resolve({id: clientID});
            console.log('Connected, clientID set to: ' + clientID);
            $cookies.putObject('Player',{id: newID});
        } else {
            console.log('Trying to reconnect, clientID: ' + activeCookie.id);
            self.reconnect(activeCookie);
        }

    }];

    listeners.debug = [function(data){
        console.log("-- Server debug --");
        data.forEach(function(line){
           console.log(line);
        });
    }];

    listeners.reconnect = [function(oldPlayer){
        if(oldPlayer){
            initDeferred.resolve(oldPlayer);
            clientID = oldPlayer.id;
            console.log('Succesfully reconnected');
        } else {
            $cookies.remove('Player');
            $cookies.putObject('Player',{id: clientID});
            initDeferred.resolve({id: clientID});
            console.log('Cannot reconnect, new id set.');
        }
    }];

    this.connect = function(){

        gameServer =  new WebSocket(gameConfigModel.serverAddr);

        gameServer.onopen = function (event) {
            alive = true;
            var arguments = [
                "setClientID"
            ];
            console.log('Connecting to game server on: ' + gameConfigModel.serverAddr );
            sendCommand('getNewId',arguments);
            reconnecting = false;
        };

        gameServer.onmessage = function (event) {
            var data = angular.fromJson(event.data);
            listeners[data.listener] && listeners[data.listener].length > 0 && listeners[data.listener].forEach(function(listener){
                listener(data.data);
            });
        };

        gameServer.onclose = function(event){
            alive = false;
        };

        gameServer.onerror = function(event){
            reconnecting = false;
        };

        return initDeferred.promise;
    };

    this.debug = function(){
        sendCommand('debug',null);
    };

    this.close = function(){
        listeners = {};
        gameServer && gameServer.close();
    };

    this.updateGame = function(){
        sendCommand('updateGame',null);
    };

    this.ping = function(player){
        sendCommand('ping',[player]);
    };

    this.refreshPlayers = function(){
        sendCommand('getPlayers',null);
    };

    this.playerUpdate = function(player){
        var arguments = [
            player
        ];
        sendCommand('playerUpdate',arguments);
    };

    this.playerReadyStateChange = function(player){
        var arguments = [
            player
        ];
        sendCommand('playerReadyStateChange',arguments);
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

    this.reconnect = function(player){
        var arguments = [
            player
        ];
        sendCommand('reconnect',arguments);
    };

    this.addListener = function(listenName,listener){
        if(!listeners[listenName]){
            listeners[listenName] = [];
        }
        listeners[listenName].push(listener);
    };

    this.removeListener = function(listenName,listener){
        if(listeners[listenName] && listeners[listenName].indexOf(listener) > -1){
            delete(listeners[listenName][listeners[listenName].indexOf(listener)]);
        }
    };

    function sendCommand(command,arguments) {
        if(!alive){
            if(!reconnecting){
                reconnecting = true;
                self.connect().then(function(){
                    self.reconnect();
                });
            }
            return false;
        }
        // Construct a msg object containing the data the server needs to process the message from the chat client.
        var msg = {
            command: command,
            arguments: arguments
        };

        gameServer && gameServer.send(JSON.stringify(msg));

    }
});
