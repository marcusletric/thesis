angular.module('fps_game.player')
    .service("networkPlayerControlService", function(webSocket, networkGameDriver,$rootScope){
        webSocket.addListener('playerUpdate',updatePlayer);
        webSocket.addListener('playerTakeDmg',playerTakeDmg);

        /**
         * Jatekos parametereinek frissitese
         *
         * @param player
         */
        function updatePlayer(data){
            var networkPlayer = networkGameDriver.networkPlayers[data.id];
            if(networkPlayer){
                networkPlayer.model.position.set(data.position.x,data.position.y,data.position.z);
                networkPlayer.model.rotation.set(data.rotation._x,data.rotation._y,data.rotation._z,data.rotation._order);
                if(networkPlayer.animation && data.walking != networkPlayer.animation.isPlaying){
                    data.walking ? networkPlayer.animation.play(0) : networkPlayer.animation.stop();
                }
            }
        }

        function playerTakeDmg(data){
            if(data.id == networkGameDriver.currentPlayer.getID()){
                networkGameDriver.currentPlayer.takeDamage(data.dmg);
            }
        }
    });
