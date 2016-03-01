var gameSetupCtrl = function ($scope, resourceFetcher) {

    var init = function () {
        $scope.stageList = resourceFetcher.fetchResources('/assets/scenes');
        $scope.characterList = resourceFetcher.fetchResources('/assets/scenes');
    };

    init();
};

angular.module('app.rendering').controller('GameSetupCtrl', ['$scope', '$element', gameSetupCtrl]);