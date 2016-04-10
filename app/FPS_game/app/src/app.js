angular.module('fps_game', [
  'ui.router',
  'fps_game.rendering',
  'fps_game.loaders',
  'fps_game.generators',
  'fps_game.player',
  'fps_game.game',
  'fps_game.network',
  'fps_game.common'
]).config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('home', {
            url: "/",
            templateUrl: 'src/view/view1/view1.html'
        });
    }])
.run(function($state){
        if(!$state.current.name || $state.current.name == ''){
            $state.go('home');
}});

angular.module('fps_game').constant('config',
    {
        gameServerAddress : 'ws://192.168.1.3:9001',
        rendering: {

        }
    }
);
