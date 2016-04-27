angular.module('fps_game.game').service('networkGameDriver', function ($rootScope, webSocket, Player, sceneLoader) {
    var self = this;
    var playerModel = null;


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

    self.connect = function(){
        playerModel = sceneLoader.getSceneModels("player")[0];
        self.currentPlayer = null;
        self.networkPlayers = {};
        self.clientID = null;

        var promise = webSocket.connect();

        promise.then(function(networkPlayer){
            webSocket.addListener('getPlayers',refreshPlayers);
            webSocket.addListener('playerConnect',addNetworkPlayer);
            webSocket.addListener('playerUpdate',self.updatePlayer);
            webSocket.addListener('updateUserPlayer',self.updateUserPlayer);
            webSocket.addListener('playerTakeDmg',playerTakeDmg);
            webSocket.addListener('playerScore',playerScore);
            webSocket.addListener('startGame',updateGame);
            webSocket.addListener('updateGame',updateGame);
            webSocket.addListener('endGame',updateGame);
            webSocket.refreshPlayers();
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
        player.inGame = data.inGame;
        player.ready = data.ready;
        player.ping = data.ping;
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

    self.updateUserPlayer = function(data){
        if(self.currentPlayer.getID() == data.id){
            !angular.isUndefined(data.active) ? self.currentPlayer.active = data.active : '';
            !angular.isUndefined(data.ready) ? self.currentPlayer.ready = data.ready : '';
            !angular.isUndefined(data.name) ? self.currentPlayer.name = data.name : '';
            !angular.isUndefined(data.dead) ? self.currentPlayer.dead = data.dead : '';
            !angular.isUndefined(data.inGame) ? self.currentPlayer.inGame = data.inGame : '';
            data.gameID && self.currentPlayer.setGameID(data.gameID);
            $rootScope.$digest();
        }
    };

    self.isPlayerInActiveGame = function (player) {
        if(self.networkGame && self.networkGame.activePlayers){
            return self.networkGame.activePlayers.find(function(activePlayer){
                    return activePlayer.id == player.getID();
                });
        } else {
            return false;
        }
    };


    /**
     * A jatekszerverhez csatlakozott jatekosok frissitese
     *
     * @param networkPlayers
     */
    function refreshPlayers(networkPlayers){
        var activePlayers = [];
        for(var id in networkPlayers){
            if(id != self.currentPlayer.getID()){
                addNetworkPlayer(networkPlayers[id]);
                activePlayers.push(id);
            } else {
                self.updateUserPlayer(networkPlayers[id]);
            }
        }

        for(var id in self.networkPlayers){
            if(activePlayers.indexOf(id) < 0 ){
                self.networkPlayers[id].removePlayerModel();
                delete (self.networkPlayers[id]);
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
                var newPlayer = new Player(app.renderModel,playerModel.clone());
                newPlayer.networkPlayer = true;
                newPlayer.setID(player.id);
                newPlayer.addPlayerModel();
                self.networkPlayers[player.id] = newPlayer;

                console.log('Player ' + player.id + ' connected');
            } else {
                self.updatePlayer(player);
            }

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
        $rootScope.$digest();
    }

});
