var app = {};
app.renderModel = null;

angular.module('fps_game', [
  'ui.router',
  'ngCookies',
  'fps_game.rendering',
  'fps_game.loaders',
  'fps_game.generators',
  'fps_game.player',
  'fps_game.game',
  'fps_game.network',
  'fps_game.common'
]).config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('config', {
            url: "/config",
            templateUrl: 'src/view/config/config.html'
        });
        $stateProvider.state('game', {
            url: "/game",
            templateUrl: 'src/view/game/game.html'
        });
    }])
.run(function($state,gameConfigModel){
        if(!$state.current.name || $state.current.name == '' || !gameConfigModel.setup){
            $state.go('config', {}, { reload: true });
        }
    });
