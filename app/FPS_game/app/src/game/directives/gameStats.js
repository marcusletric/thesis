angular.module('fps_game.game').directive('gameStats', function (networkGameDriver,webSocket,$timeout,$cookies) {
    return {
        restrict: 'A',
        templateUrl: 'src/game/templates/stats.html',
        scope: {userPlayer : "="},
        link: function(scope){

            function refreshValues(){
                scope.game = networkGameDriver.networkGame;
                scope.now = (new Date()).getTime();
                $timeout(refreshValues,1000);
            }

            refreshValues();

            webSocket.addListener('getPlayers',function(){$timeout(refresh);});
            webSocket.addListener('playerTakeDmg',function(){$timeout(refresh);});
            webSocket.addListener('playerScore',function(){$timeout(refresh);});
            webSocket.addListener('startGame',function(){$timeout(refresh);});
            webSocket.addListener('updateGame',function(){$timeout(refresh);});
            webSocket.addListener('endGame',function(){$timeout(refresh);});

            function refresh(event){
                scope.game = networkGameDriver.networkGame;
                scope.activePlayers = [];
                scope.queue = [];

                for(var id in networkGameDriver.networkPlayers){
                    if(networkGameDriver.isPlayerInActiveGame(networkGameDriver.networkPlayers[id])){
                        scope.activePlayers.push(networkGameDriver.networkPlayers[id]);
                    } else {
                        scope.queue.push(networkGameDriver.networkPlayers[id]);
                    }
                }

                if(networkGameDriver.isPlayerInActiveGame(networkGameDriver.currentPlayer)){
                    scope.activePlayers.push(networkGameDriver.currentPlayer);
                } else {
                    scope.queue.push(networkGameDriver.currentPlayer);
                }


                if(!networkGameDriver.networkGame){
                    scope.queue = networkGameDriver.networkPlayers;
                } else {
                    networkGameDriver.networkGame.activePlayers.forEach(function(activePlayer){
                        !networkGameDriver.networkPlayers[activePlayer] && scope.queue.push(networkGameDriver.networkPlayers[activePlayer]);
                    });
                }

                networkGameDriver.currentPlayer.refreshPing();
                $cookies.putObject('Player',networkGameDriver.currentPlayer.getNetworkPlayer());
                event && scope.$digest();
            }

            refresh();



        }
    }
});
