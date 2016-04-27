angular.module('fps_game.game').directive('gameStats', function (networkGameDriver,webSocket,$timeout,$cookies) {
    return {
        restrict: 'A',
        templateUrl: 'src/game/templates/stats.html',
        scope: {userPlayer : "="},
        link: function(scope){

            var refreshTimeout = null;
            var self = this;


            function refreshCurrentDate(){
                if(scope.game){
                    var now = (new Date()).getTime();
                    var date = new Date(null);
                    date.setSeconds((scope.game.queueing ? scope.game.queueTime - now : scope.game.running ? (scope.game.gameTime - now) : 10)/1000);
                    scope.remainingTime = date.toISOString().substr(11, 8);
                }
                refreshTimeout = $timeout(refreshCurrentDate,100);
            }

            refreshCurrentDate();

            this.refresh = function(event){
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


                networkGameDriver.currentPlayer.refreshPing();
                $cookies.putObject('Player',networkGameDriver.currentPlayer.getNetworkPlayer());
                event && scope.$digest();
            };

            self.refresh();

            scope.$on('$destroy',function(){
                $timeout.cancel(refreshTimeout);
                webSocket.removeListener('getPlayers',self.refresh);
                webSocket.removeListener('playerTakeDmg',self.refresh);
                webSocket.removeListener('playerScore',self.refresh);
                webSocket.removeListener('startGame',self.refresh);
                webSocket.removeListener('updateGame',self.refresh);
                webSocket.removeListener('endGame',self.refresh);
            });

            webSocket.addListener('getPlayers',self.refresh);
            webSocket.addListener('playerTakeDmg',self.refresh);
            webSocket.addListener('playerScore',self.refresh);
            webSocket.addListener('startGame',self.refresh);
            webSocket.addListener('updateGame',self.refresh);
            webSocket.addListener('endGame',self.refresh);



        }
    }
});
