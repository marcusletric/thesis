angular.module('fps_game.player').directive('mouseControl', function ($window, gameDriver, $timeout) {
    return {
        restrict: 'A',
        link: function(scope){
            var canvas = app.renderModel.renderer.domElement;
            var middle = {x:canvas.width/2,y:canvas.height/2};
            var currentPos = angular.extend({},middle);
            var mouseSensitivity = 0.5;
            scope.respawning = false;
            $($window).on('mousemove',function(event){
                if(scope.pointerLock && !scope.loading && scope.player && !scope.player.dead){
                    currentPos.x += event.originalEvent.movementX*mouseSensitivity;
                    if(event.originalEvent.movementY > 0 && currentPos.y < canvas.height ||
                        event.originalEvent.movementY < 0 && currentPos.y > 0 ){
                        currentPos.y += event.originalEvent.movementY*mouseSensitivity;
                    }
                    var delta = {
                        x: (middle.x - currentPos.x)/(canvas.width/2),
                        y: (middle.y - currentPos.y)/(canvas.height/2)
                    };

                    scope.player.updateLook(delta);
                }
            });

            $($window).on('click',function(event){
                if(scope.player){
                    if(scope.player.dead){
                        /*!scope.respawning && $timeout(function(){
                            gameDriver.respawnPlayer(scope.player);
                            scope.respawning = false;
                        },5000);
                        scope.respawning = true;
                        scope.$digest();*/
                    } else {
                        scope.player.shoot();
                    }
                }
            });
        }
    }
});