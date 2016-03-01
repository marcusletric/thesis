/**
 * Created by Administrator on 2016.02.14..
 */
var sceneLoaderCtrl = function ($scope,$http) {

    $scope.loadScene = function(scenePath){
        $http(scenePath).then(function(jsonData){
            var sceneModels = angular.fromJson(jsonData);

            sceneModels.forEach(function(model){
                $scope.renderer.loadModel(model.model_src);
            });
        });
    };

};

angular.module('app.loaders').controller('sceneLoader', ['$scope', '$http', sceneLoaderCtrl]);