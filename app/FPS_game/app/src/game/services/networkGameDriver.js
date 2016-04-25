angular.module('fps_game.game').service('networkGameDriver', function ($rootScope, webSocket, Player) {
    var self = this;

    self.networkGame = null;

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
            self.updatePlayerAttrs(networkPlayer,data);
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
            webSocket.addListener('playerUpdate',self.updatePlayer);
            webSocket.addListener('updateUserPlayer',self.updateUserPlayer);
            webSocket.addListener('playerTakeDmg',playerTakeDmg);
            webSocket.addListener('playerScore',playerScore);
            webSocket.addListener('startGame',updateGame);
            webSocket.addListener('updateGame',updateGame);
            webSocket.addListener('endGame',updateGame);
            webSocket.getAllPlayers();
            self.clientID = networkPlayer.id;
        });

        return promise;
    };

    self.updatePlayerAttrs = function(player,data){
        player.model.position.set(data.position.x,data.position.y,data.position.z);
        player.model.rotation.set(data.rotation._x,data.rotation._y,data.rotation._z,data.rotation._order);
        player.name = data.name;
        player.dead = data.dead;
        player.health = data.health;
        player.score = data.score;
        player.active = data.active;
        player.ready = data.ready;
        player.setGameID(data.gameID);

        if( data.shooting ){
            player.shooting = data.shooting;
        }
        if(player.animation && data.walking != player.animation.isPlaying){
            data.walking ? player.animation.play(0) : player.animation.stop();
        }

        if(data.inGame){
            player.model.visible = true;
        }
    };


    /**
     * A jatekszerverhez csatlakozott jatekosok hozzaadasa
     *
     * @param networkPlayers
     */
    function addNetworkPlayers(networkPlayers){
        var activePlayers = [];
        for(var id in networkPlayers){
            addNetworkPlayer(networkPlayers[id]);
            activePlayers.push(id);

        }

        for(var id in self.networkPlayers){
            if(activePlayers.indexOf(id) < 0 ){
                delete self.networkPlayers[id];
            }
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
                self.updatePlayer(player);
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

    function updateGame (game){
        self.networkGame = game;
    }

});
