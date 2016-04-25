angular.module('fps_game.game').directive('gameStats', function (networkGameDriver,webSocket,$timeout,$cookies) {
    return {
        restrict: 'A',
        templateUrl: 'src/game/templates/stats.html',
        scope: {userPlayer : "="},
        link: function(scope){

            webSocket.addListener('getAllPlayers',function(){$timeout(refresh);});
            webSocket.addListener('playerTakeDmg',function(){$timeout(refresh);});
            webSocket.addListener('playerScore',function(){$timeout(refresh);});
            webSocket.addListener('gameUpdate',function(){$timeout(refresh);});

            function refresh(event){
                $cookies.putObject('Player',networkGameDriver.currentPlayer.getNetworkPlayer());
                //scope.players = networkGameDriver.networkPlayers;
                scope.game = networkGameDriver.networkGame;
                scope.activePlayers = [];

                if(networkGameDriver.networkGame && networkGameDriver.networkGame.activePlayers) {
                    networkGameDriver.networkGame.activePlayers.forEach(function(activePlayer){
                        !!networkGameDriver.networkPlayers[activePlayer.id] && scope.activePlayers.push(networkGameDriver.networkPlayers[activePlayer.id]);
                    });
                    if(networkGameDriver.currentPlayer){

                    }
                }

                scope.queue = [];

                if(!networkGameDriver.networkGame){
                    scope.queue = networkGameDriver.networkPlayers;
                } else {
                    networkGameDriver.networkGame.activePlayers.forEach(function(activePlayer){
                        !networkGameDriver.networkPlayers[activePlayer] && scope.queue.push(networkGameDriver.networkPlayers[activePlayer]);
                    });
                }

                networkGameDriver.currentPlayer.refreshPing();
                event && scope.$digest();
            }

            refresh();



        }
    }
});
