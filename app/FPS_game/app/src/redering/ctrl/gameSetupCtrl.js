var gameSetupCtrl = function ($scope, resourceFetcher, sceneLoader, Player, $timeout) {

    var init = function () {
        var resRoot = '/assets';
        resourceFetcher.fetchResources(resRoot + '/scenes').then(function(resourceMap){
            sceneLoader.loadScene($scope,resRoot + '/scenes' + resourceMap[0].src);
        });
		$timeout(function(){
			$scope.renderer.loadModel(resRoot + '/meshes/player.dae').then(function(playerMesh){
				$scope.player = new Player(playerMesh,$scope.renderer.baseCamera);
				$scope.renderer.addObject($scope.player.model);
				$scope.renderer.addObject($scope.player.lookTarget);
				$scope.renderer.addFrameUpdatedObject($scope.player);
			});
		});
			
		
    };

    init();
};

angular.module('fps_game.rendering').controller('GameSetupCtrl', ['$scope', 'resourceFetcher', 'sceneLoader', 'Player', '$timeout', gameSetupCtrl]);