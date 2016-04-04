angular.module('fps_game.rendering').directive('ngWebgl', function (resourceFetcher, sceneLoader) {
    return {
      restrict: 'A',
      controller: "RenderingController"
    };
  });
