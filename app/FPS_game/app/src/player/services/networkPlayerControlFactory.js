angular.module('fps_game.player')
    .service("networkPlayerControlService", function(webSocket, networkGameDriver){
        webSocket.addListener('playerUpdate',updatePlayer);

        /**
         * Jatekos parametereinek frissitese
         *
         * @param player
         */
        function updatePlayer(player){
            var networkPlayer = networkGameDriver.networkPlayers[player.id];
            if(networkPlayer){
                networkPlayer.model.position.set(player.position.x,player.position.y,player.position.z);
                networkPlayer.model.rotation.set(player.rotation._x,player.rotation._y,player.rotation._z,player.rotation._order);
                if(player.walking != networkPlayer.animation.isPlaying){
                    player.walking ? networkPlayer.animation.play(0) : networkPlayer.animation.stop();
                }
            }
        }
    });
