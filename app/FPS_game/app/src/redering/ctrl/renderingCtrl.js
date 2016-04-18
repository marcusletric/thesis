var renderCtrl = function ($rootScope, $element, renderModelFactory) {

    var elem = $($element);
    var config = {
        'camera':{
            'fov':60,
            'aspect':elem.width()/elem.height(),
            'near':0.01,
            'far':1000
        },
        'dimensions':{
            'width':elem.width(),
            'height':elem.height()
        },
        'element': elem
    };

    var renderModel = renderModelFactory(config);

    var init = function () {

        elem.append(renderModel.renderer.domElement);
        renderModel.renderer.setSize(config.dimensions.width,config.dimensions.height);
        renderModel.renderer.antialias = true;
        //renderModel.renderer.shadowMapEnabled = true;
        //renderModel.renderer.shadowMapType = THREE.PCFSoftShadowMap;
        renderModel.renderer.physicallyCorrectLights = true;
        renderModel.renderer.gammaInput = true;
        renderModel.renderer.gammaOutput = true;

        renderModel.renderer.shadowMap.cullFace = THREE.CullFaceBack;

        renderModel.startRender();
        app.renderer = renderModel;
    };

    init();
};

angular.module('fps_game.rendering').controller('RenderingController', ['$rootScope', '$element', 'renderModelFactory', renderCtrl]);