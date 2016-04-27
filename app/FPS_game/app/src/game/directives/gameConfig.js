angular.module('fps_game.game').directive('gameConfig', function ($state,$window,$cookies,gameConfigModel,webSocket) {
    return {
        restrict: 'A',
        link: function(scope){
            gameConfigModel.setup = true;

            var cookieData = $cookies.getObject('config') || {};

             scope.shadows   =    gameConfigModel.shadows;
             scope.playerName      =    gameConfigModel.playerName;
             scope.resolution =   gameConfigModel.resolution;
             scope.serverAddr =   gameConfigModel.serverAddr;
             scope.mouseSensitivity =   gameConfigModel.mouseSensitivity.toString();

            scope.startGame = function(){
                $state.go('game');
            };

            scope.$watch("mouseSensitivity",function(value){
                updateConfig("mouseSensitivity",value);
            });
            scope.$watch("shadows",function(value){
                updateConfig("shadows",value);
            });
            scope.$watch("playerName",function(value){
                updateConfig("playerName",value);
            });
            scope.$watch("resolution",function(value){
                updateConfig("resolution",value);
            });
            scope.$watch("serverAddr",function(value){
                updateConfig("serverAddr",value);
            });

            function updateConfig(param,value){
                gameConfigModel[param] = value;
                cookieData[param] = value;
                $cookies.putObject('config',cookieData);
            }
        }
    }
});
