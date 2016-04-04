var gameSetupCtrl = function ($scope, resourceFetcher, sceneLoader) {

    var init = function () {
        var resRoot = '/assets/scenes';
        resourceFetcher.fetchResources(resRoot).then(function(resourceMap){
            sceneLoader.loadScene($scope,resRoot + resourceMap[0].src);
        });
        //$scope.characterList = resourceFetcher.fetchResources('/assets/scenes');
    };

    init();
};

angular.module('fps_game.rendering').controller('GameSetupCtrl', ['$scope', 'resourceFetcher', 'sceneLoader', gameSetupCtrl]);