var listRenderCtrl = function ($scope, $element) {

    var itemWidth = $element.find('.list-item').first().width();

    $scope.selectedElement = 0;

    $scope.$watch('selectedElement', function(newValue){
        $element.find('.list-canvas').left = newValue * itemWidth;
    });

    $scope.nextItem = function(){
        $scope.selectedElement ++;
        if($scope.selectedElement > $scope.src.length - 1){
            $scope.selectedElement = 0;
        }
    };

    $scope.prevItem = function(){
        $scope.selectedElement --;
        if($scope.selectedElement < 0){
            $scope.selectedElement = $scope.src.length - 1;
        }
    };


};

angular.module('fps_game.rendering').controller('ListRenderCtrl', ['$scope', '$element', listRenderCtrl]);