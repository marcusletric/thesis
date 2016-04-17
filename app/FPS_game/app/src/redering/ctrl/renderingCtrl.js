var renderCtrl = function ($rootScope, $element, renderModelFactory) {

    var elem = $($element);
    var config = {
        'camera':{
            'fov':90,
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
        renderModel.renderer.shadowMapEnabled = true;
        renderModel.renderer.shadowMapType = THREE.PCFSoftShadowMap;
        renderModel.renderer.physicallyCorrectLights = true;
        renderModel.renderer.toneMapping = THREE.ReinhardToneMapping;

        //renderModel.renderer.shadowMapCullFace = THREE.CullFaceBack;

        renderModel.renderer.shadowMapBias = 0.0002;
        renderModel.renderer.shadowMapDarkness = 0.8;
        renderModel.renderer.shadowMapWidth = 2048;
        renderModel.renderer.shadowMapHeight = 2048;
        renderModel.startRender();
        app.renderer = renderModel;
    };

    init();
};

angular.module('fps_game.rendering').controller('RenderingController', ['$rootScope', '$element', 'renderModelFactory', renderCtrl]);