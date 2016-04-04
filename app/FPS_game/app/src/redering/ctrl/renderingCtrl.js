var renderCtrl = function ($scope, $element, renderModelFactory) {

    var elem = $($element);
    var config = {
        'camera':{
            'fov':80,
            'aspect':elem.width()/elem.height(),
            'near':0.001,
            'far':1000
        },
        'dimensions':{
            'width':elem.width(),
            'height':elem.height()
        }
    };

    var init = function () {
        var renderModel = renderModelFactory(config);

        renderModel.baseCamera.position.z=10;
        renderModel.baseCamera.lookAt(new THREE.Vector3(0,0,0));

        elem.append(renderModel.renderer.domElement);
        renderModel.renderer.setSize(config.dimensions.width,config.dimensions.height);
        renderModel.renderer.antialias = true;
        renderModel.renderer.shadowMapEnabled = true;
        renderModel.renderer.shadowMapType = THREE.PCFSoftShadowMap;

        //renderModel.renderer.shadowMapCullFace = THREE.CullFaceBack;

        renderModel.renderer.shadowMapBias = 0.0002;
        renderModel.renderer.shadowMapDarkness = 0.8;
        renderModel.renderer.shadowMapWidth = 2048;
        renderModel.renderer.shadowMapHeight = 2048;
        renderModel.render();
        $scope.renderer = renderModel;
    };

    init();
};

angular.module('fps_game.rendering').controller('RenderingController', ['$scope', '$element', 'renderModelFactory', renderCtrl]);