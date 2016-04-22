angular.module('fps_game.game').directive('gameConfig', function ($state,$window,gameConfigModel,webSocket) {
    return {
        restrict: 'A',
        link: function(scope){
            if(gameConfigModel.setup){
                webSocket.close();
                $window.location.reload();
            }

            gameConfigModel.setup = true;

             scope.shadows   =    gameConfigModel.shadows;
             scope.name      =    gameConfigModel.playerName;
             scope.resolution =   gameConfigModel.resolution;
             scope.serverAddr =   gameConfigModel.serverAddr;

            scope.startGame = function(){
                $state.go('game');
            };

            scope.$watch("shadows",function(){
                gameConfigModel.shadows = scope.shadows;
            });
            scope.$watch("name",function(){
                gameConfigModel.playerName = scope.name;
            });
            scope.$watch("resolution",function(){
                gameConfigModel.resolution = scope.resolution;
            });
            scope.$watch("serverAddr",function(){
                gameConfigModel.serverAddr = scope.serverAddr;
            });
        }
    }
});
