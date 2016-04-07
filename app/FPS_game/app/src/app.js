// Declare app level module which depends on views, and components,
// initiate routeProvider instance
angular.module('fps_game', [
  'ui.router',
  'fps_game.rendering',
  'fps_game.loaders',
  'fps_game.generators',
  'fps_game.player'
]).
config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('home', {
            url: "/",
            templateUrl: 'src/view/view1/view1.html'
        });
    }])
.run(function($state){
        if(!$state.current.name || $state.current.name == ''){
            $state.go('home');
}});
