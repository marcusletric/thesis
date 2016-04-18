angular.module('fps_game.rendering')
    .factory("renderModelFactory", function($q,$window){

        return function(config) {
            var self = this;

			self.clock = new THREE.Clock();

            self.scene = null;
            self.renderer = null;
            self.baseCamera = null;

            var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.7 );
            hemiLight.color.setHSL( 0, 0, 0.86 );
            hemiLight.groundColor.setHSL( 0, 0, 0.42 );
            hemiLight.position.set( 0, 500, 0 );

            //

            var dirLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
            dirLight.color.setHSL( 0.1, 1, 0.95 );
            dirLight.position.set( 1, 1.75, -0.7 );
            dirLight.position.multiplyScalar( 200 );

            dirLight.castShadow = true;

            dirLight.shadowMapWidth = 4096;
            dirLight.shadowMapHeight = 4096;

            var d = 100;

            dirLight.shadowCameraLeft = -d;
            dirLight.shadowCameraRight = d;
            dirLight.shadowCameraTop = d;
            dirLight.shadowCameraBottom = -d;

            dirLight.shadowCameraFar = 1000;
            dirLight.shadowBias = -0.0003;
            dirLight.shadowDarkness = 3;
            //dirLight.shadowCameraVisible = true;

            self.actualCamera = null;
            self.sceneElements = [];
			self.updateOnFrame = [];
            self.config = config;

            function construct(constructor, args) {
                function renderModel() {
                    return constructor.apply(this, args);
                }

                renderModel.prototype = constructor.prototype;
                return new renderModel();
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
                self.addObject(self.baseCamera);

                var initialCamTarget = new THREE.Object3D();
                initialCamTarget.position.set(0,0,0);
                self.addObject(initialCamTarget);

                self.actualCamera.position.set(0,100,0);
                self.actualCamera.lookAt(initialCamTarget);

                self.addObject(hemiLight);
                self.addObject(dirLight);


            }
			
			self.addFrameUpdatedObject = function(object){
				self.updateOnFrame.push(object);
			};

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
                        if( child instanceof THREE.Mesh ) {
                            child.material.bumpScale = 0.002;
                        }
                        child.receiveShadow = true;
                        child.castShadow = true;
                    } );
                    deferred.resolve(dae);
                });
                return deferred.promise;
            };

            self.startRender = function(){
                render();
            };

            function render() {
                requestAnimationFrame(render);
				var deltaTime = clock.getDelta();

                renderer.render(self.scene, self.actualCamera);
				
				THREE.AnimationHandler.update(deltaTime);
				
				self.updateOnFrame.forEach(function(object){
					object.update(deltaTime);
				});
            }

            $($window).on('resize',function(){
                self.renderer.setSize(self.config.element.width(),self.config.element.height());
                self.baseCamera.aspect = self.config.element.width()/self.config.element.height();
                self.baseCamera.updateProjectionMatrix();
            });

            init();
            return self;
        };
    });
