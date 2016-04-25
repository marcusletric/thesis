angular.module('fps_game.game').directive('gameStats', function (networkGameDriver,webSocket,$timeout,$cookies) {
    return {
        restrict: 'A',
        templateUrl: 'src/game/templates/stats.html',
        scope: {userPlayer : "="},
        link: function(scope){

            webSocket.addListener('getAllPlayers',refresh);
            webSocket.addListener('getQueue',updateQueue);

            function refresh(){
                $cookies.putObject('Player',networkGameDriver.currentPlayer.getNetworkPlayer());
                //scope.players = networkGameDriver.networkPlayers;
                scope.game = networkGameDriver.networkGame;
                scope.queue = networkGameDriver.networkPlayers;
                networkGameDriver.currentPlayer.refreshPing();
                scope.$digest();
            }

            function updateQueue (queue){
                scope.queue = queue;
                scope.$digest();
            }

        }
    }
});
