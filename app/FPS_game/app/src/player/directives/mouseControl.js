angular.module('fps_game.player').directive('mouseControl', function ($window, gameDriver, $timeout, networkGameDriver) {
    return {
        restrict: 'A',
        link: function(scope,element){
            scope.canRespawn = networkGameDriver.networkGame && networkGameDriver.networkGame.running;

            document.exitPointerLock = document.exitPointerLock ||
            document.mozExitPointerLock ||
            document.webkitExitPointerLock;

            element[0].requestPointerLock = element[0].requestPointerLock ||
                element[0].mozRequestPointerLock;

            scope.$watch('player.dead',function(dead){
                if(dead){
                    document.exitPointerLock();
                }
                scope.canRespawn = networkGameDriver.networkGame && networkGameDriver.networkGame.running;
            });

            document.addEventListener('pointerlockchange', lockChange, false);
            document.addEventListener('mozpointerlockchange', lockChange, false);

            function lockChange() {
                scope.pointerLock = document.pointerLockElement === element[0] || document.mozPointerLockElement === element[0];
            }

            scope.respawning = false;
            $($window).on('mousemove',function(event){
                if(scope.pointerLock && !scope.loading && scope.player && !scope.player.dead){
                    scope.player.movementFlags.MV += event.originalEvent.movementY;
                    scope.player.movementFlags.MH += event.originalEvent.movementX;
                }
            });

            $($window).on('click',function(event){
                if(scope.player){
                    if(!scope.player.dead) {
                        element[0].requestPointerLock();
                    }
                    if(scope.player.dead && scope.player.inGame && networkGameDriver.networkGame && networkGameDriver.networkGame.running){
                        !scope.respawning && $timeout(function(){
                            gameDriver.respawnPlayer(scope.player);
                            scope.respawning = false;
                        },1000);
                        scope.respawning = true;
                        scope.$digest();
                    } else if(scope.pointerLock){
                        scope.player.shoot();
                    }
                }
            });
        }
    }
});