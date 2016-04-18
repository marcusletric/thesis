angular.module('fps_game.player').directive('mouseControl', function ($window) {
    return {
        restrict: 'A',
        link: function(scope){
            var canvas = app.renderer.renderer.domElement;
            var middle = {x:canvas.width/2,y:canvas.height/2};
            var currentPos = angular.extend({},middle);
            var mouseSensitivity = 0.95;
            $($window).on('mousemove',function(event){
                if(scope.pointerLock && ! scope.loading){
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
                scope.player.shoot();
            });
        }
    }
});