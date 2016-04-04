angular.module('fps_game.rendering')
    .factory("renderModelFactory", function($q){

        return function(config) {
            var self = this;
            var camControls = null;
            var lightControls = null;
			var clock = new THREE.Clock();

            self.scene = null;
            self.renderer = null;
            self.baseCamera = null;
            self.baseLight = new THREE.DirectionalLight( 0xDEDEDE , 1);

            self.ambientLight = new THREE.AmbientLight( 0x101010 ); // soft white light
            self.actualCamera = null;
            self.sceneElements = [];
            self.config = config;


            function construct(constructor, args) {
                function F() {
                    return constructor.apply(this, args);
                }

                F.prototype = constructor.prototype;
                return new F();
            }

            function getConfigParam(param) {
                return $.map(self.config[param], function (value, index) {
                    return [value];
                });
            }


            function init() {
                self.scene = new THREE.Scene();
                self.renderer = new THREE.WebGLRenderer();
                self.baseCamera = construct(THREE.PerspectiveCamera, getConfigParam('camera'));
                self.actualCamera = self.baseCamera;

                /*self.baseLight.castShadow = true;
                self.baseLight.shadowDarkness = 0.6;
                self.baseLight.shadowCameraVisible = false;
                //self.baseLight.shadowCameraNear = getConfigParam('camera').near;
                //self.baseLight.shadowCameraFar = getConfigParam('camera').far;
                self.baseLight.shadowCameraNear = 0.1;
                self.baseLight.shadowCameraFar = 1000;
                self.baseLight.shadowCameraFov = 170;
                self.baseLight.shadowCameraLeft = 50; // CHANGED
                self.baseLight.shadowCameraRight = -50; // CHANGED
                self.baseLight.shadowCameraTop = 50; // CHANGED
                self.baseLight.shadowCameraBottom = -50; // CHANGED*/

                /*self.baseLight.shadowMapBias = 0.0039;
                self.baseLight.shadowMapDarkness = 0.1;
                self.baseLight.shadowMapWidth = 1024;
                self.baseLight.shadowMapHeight = 1024;*/
			

                camControls = new THREE.OrbitControls(self.baseCamera, self.renderer.domElement);

                self.addObject(self.baseCamera);
                self.addObject(self.baseLight);
                

            }

            self.addObject = function (object) {
                sceneElements.push(object);
                scene.add(object);
            };

            self.removeObject = function (object) {
                scene.remove(object);
            };

            self.loadModel = function (modelUrl) {
                var deferred = $q.defer();
                var loader = new THREE.ColladaLoader(); // init the loader util
                loader.options.convertUpAxis = true;

                loader.load(modelUrl, function (collada) {
                    var dae = collada.scene;

                    dae.traverse( function( child ) {
						if ( child instanceof THREE.SkinnedMesh ) {
							var animation = new THREE.Animation( child, child.geometry.animation );
							animation.play();
						}
                        if( child instanceof THREE.Mesh ) {
                            child.material.bumpScale = 0.002;
                            child.receiveShadow = true;
                            child.castShadow = true;
                        }
                        deferred.resolve(dae);
                    } );
                });
                return deferred.promise;
            };

            self.render = function () {
                requestAnimationFrame(self.render);
                camControls.update();

                for(coord in self.baseLight.position){
                    self.baseLight.position[coord] = self.baseCamera.position[coord]-1;
                }

                //self.baseLight.lookAt(0,0,0);

                renderer.render(self.scene, self.actualCamera);


                self.baseLight.updateMatrix();
                self.baseLight.updateMatrixWorld();
				
				THREE.AnimationHandler.update( clock.getDelta() );
                //self.baseLight.target = self.baseCamera.target;
            };

            init();
            return self;
        };
    });
