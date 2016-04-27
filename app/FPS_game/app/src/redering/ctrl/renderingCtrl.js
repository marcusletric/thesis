angular.module('fps_game.rendering').controller('RenderingController', function ($rootScope, $element, renderModelFactory, gameConfigModel) {

    var elem = $($element);
    var config = {
        'camera':{
            'fov':75,
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

        var pixelRatio = 0.5;

        switch (gameConfigModel.resolution){
            case 'low' : pixelRatio = 0.5; break;
            case 'med' : pixelRatio = 0.7; break;
            case 'hi' : pixelRatio = 1; break;
        }

        elem.append(renderModel.renderer.domElement);
        renderModel.renderer.setSize(config.dimensions.width,config.dimensions.height);
        renderModel.renderer.setPixelRatio(pixelRatio);
        renderModel.renderer.antialias = true;
        renderModel.renderer.shadowMapEnabled = gameConfigModel.shadows;
        renderModel.renderer.shadowMapType = THREE.PCFSoftShadowMap;
        renderModel.renderer.physicallyCorrectLights = true;
        renderModel.renderer.gammaInput = true;
        renderModel.renderer.gammaOutput = true;

        renderModel.renderer.shadowMap.cullFace = THREE.CullFaceBack;

        renderModel.startRender();
        app.renderModel = renderModel;
    };

    init();
});