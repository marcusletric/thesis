angular.module('fps_game.game').service('networkGameDriver', function ($rootScope, webSocket, Player) {
    var self = this;

    this.currentPlayer = null;
    this.networkPlayers = [];
    this.clientID = null;

    this.connect = function(){
        var promise = webSocket.connect();

        promise.then(function(clientID){
            webSocket.addListener('getAllPlayers',addNetworkPlayers);
            webSocket.addListener('playerConnect',addNetworkPlayer);
            webSocket.addListener('playerDisconnect',removeNetworkPlayer);
            webSocket.getAllPlayers();
            self.clientID = clientID;
        });

        return promise;
    };

    this.addCurrentPlayer = function(player){
        self.currentPlayer = player;
        webSocket.addPlayer(player.getNetworkPlayer());
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
            var newPlayer = new Player(app.renderer);
            newPlayer.setID(player.id);
            newPlayer.model.position.set(player.position.x,player.position.y,player.position.z);
            newPlayer.model.rotation.set(player.rotation._x,player.rotation._y,player.rotation._z,player.rotation._order);
            self.networkPlayers[player.id] = newPlayer;

            console.log('Player ' + player.id + ' connected');
        }
    }

    /**
     * Lecsatlakozott jatekos eltavolitasa
     *
     * @param player
     */
    function removeNetworkPlayer(player){
        if(self.networkPlayers[player.id]){
            app.renderer.removeObject(self.networkPlayers[player.id].model);
            delete(self.networkPlayers[player.id]);
        }
    }
});
