angular.module('fps_game.game').service('networkGameDriver', function ($rootScope, webSocket, Player) {
    var self = this;

    self.addCurrentPlayer = function(player){
        self.currentPlayer = player;
        webSocket.addPlayer(player.getNetworkPlayer());
    };

    /**
     * Jatekos parametereinek frissitese
     *
     * @param player
     */
    self.updatePlayer = function(data){
        var networkPlayer = self.networkPlayers[data.id];
        if(networkPlayer){
            networkPlayer.model.position.set(data.position.x,data.position.y,data.position.z);
            networkPlayer.model.rotation.set(data.rotation._x,data.rotation._y,data.rotation._z,data.rotation._order);
            networkPlayer.name = data.name;
            networkPlayer.health = data.health;
            networkPlayer.score = data.score;
            networkPlayer.active = data.active;
            networkPlayer.ready = data.ready;
            networkPlayer.setGameID(data.gameID);

            if( data.shooting ){
                networkPlayer.shooting = data.shooting;
            }
            if(networkPlayer.animation && data.walking != networkPlayer.animation.isPlaying){
                data.walking ? networkPlayer.animation.play(0) : networkPlayer.animation.stop();
            }

            if(data.inGame){
                networkPlayer.model.visible = true;
            }
        }

    };

    self.updateUserPlayer = function(data){
        if(self.currentPlayer.getID() == data.id){
            !angular.isUndefined(data.active) ? self.currentPlayer.active = data.active : '';
            !angular.isUndefined(data.ready) ? self.currentPlayer.ready = data.ready : '';
            !angular.isUndefined(data.name) ? self.currentPlayer.name = data.name : '';
            data.gameID && self.currentPlayer.setGameID(data.gameID);
        }
    };

    self.connect = function(){
        self.currentPlayer = null;
        self.networkPlayers = {};
        self.clientID = null;

        var promise = webSocket.connect();

        promise.then(function(networkPlayer){
            webSocket.addListener('getAllPlayers',addNetworkPlayers);
            webSocket.addListener('playerConnect',addNetworkPlayer);
            webSocket.addListener('playerDisconnect',removeNetworkPlayer);
            webSocket.addListener('playerUpdate',self.updatePlayer);
            webSocket.addListener('updateUserPlayer',self.updateUserPlayer);
            webSocket.addListener('playerTakeDmg',playerTakeDmg);
            webSocket.addListener('playerScore',playerScore);
            webSocket.getAllPlayers();
            self.clientID = networkPlayer.id;
        });

        return promise;
    };

    /**
     * A jatekszerverhez csatlakozott jatekosok hozzaadasa
     *
     * @param networkPlayers
     */
    function addNetworkPlayers(networkPlayers){
        for(var id in networkPlayers){
            addNetworkPlayer(networkPlayers[id]);
        }
    }

    /**
     * Egy szerveren tartozkodo jatekos hozzaadasa a szcenahoz
     *
     * @param player
     */
    function addNetworkPlayer(player){
        if(player.id != self.clientID) {
            if(!self.networkPlayers[player.id]){
                var newPlayer = new Player(app.renderModel);
                newPlayer.networkPlayer = true;
                newPlayer.setID(player.id);
                newPlayer.modelLoad.then(function(){
                    app.renderModel.addObject(newPlayer.model);
                    app.renderModel.addFrameUpdatedObject(newPlayer);
                });
                self.networkPlayers[player.id] = newPlayer;

                console.log('Player ' + player.id + ' connected');
            } else {
                self.networkPlayers[player.id].model.position.set(player.position.x,player.position.y,player.position.z);
                self.networkPlayers[player.id].model.rotation.set(player.rotation._x,player.rotation._y,player.rotation._z,player.rotation._order);
            }

        }
    }

    /**
     * Lecsatlakozott jatekos eltavolitasa
     *
     * @param player
     */
    function removeNetworkPlayer(player){
        if(self.networkPlayers[player.id]){
            app.renderModel.removeObject(self.networkPlayers[player.id].model);
            self.networkPlayers[player.id].active = false;
        }
    }


    function playerTakeDmg(data){
        if(data.id == self.currentPlayer.getID()){
            self.currentPlayer.takeDamage(data.dmg,data.fromPlayer);
        }
    }

    function playerScore(data){
        if(self.currentPlayer.getID() == data.player.id){
            self.currentPlayer.score++;
            if(data.dmg == 100){
                self.currentPlayer.headShotKill();
            }
            $rootScope.$digest();
        }
    }

});
