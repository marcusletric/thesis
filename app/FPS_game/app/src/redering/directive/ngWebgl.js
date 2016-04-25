angular.module('fps_game.rendering').directive('ngWebgl', function (gameDriver) {
    return {
      restrict: 'A',
      controller: "RenderingController",
        link: function(scope,element){
            gameDriver.init(scope);

            scope.$on('$destroy',function(){
                scope.player = null;
            });
        }
    };
  });
