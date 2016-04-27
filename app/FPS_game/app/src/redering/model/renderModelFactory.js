angular.module('fps_game.rendering')
    .factory("renderModelFactory", function($q,$window){

        return function(config) {
            var self = this;

			self.clock = new THREE.Clock();

            self.scene = null;
            self.renderer = null;
            self.baseCamera = null;

            var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2.2 );
            hemiLight.color.setHSL( 0, 0, 1.1);
            hemiLight.groundColor.setHSL( 0, 0, 0.6 );
            hemiLight.position.set( 0, 500, 0 );

            var dirLight = new THREE.DirectionalLight( 0xffffff, 1.3 );
            dirLight.color.setHSL( 0.1, 1, 0.95 );
            dirLight.position.set( 1, 1.75, -0.7 );
            dirLight.position.multiplyScalar( 200 );

            dirLight.castShadow = true;

            dirLight.shadow.mapSize.width = 4096;
            dirLight.shadow.mapSize.height = 4096;

            var d = 100;

            dirLight.shadow.camera.left = -d;
            dirLight.shadow.camera.right = d;
            dirLight.shadow.camera.top = d;
            dirLight.shadow.camera.bottom = -d;

            dirLight.shadow.camera.far = 1000;
            dirLight.shadow.bias = -0.0003;

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

                self.resetCamera();

                self.addObject(hemiLight);
                self.addObject(dirLight);

                renderer.render(self.scene, self.actualCamera);

            }

            self.resetCamera = function(){
                self.actualCamera.position.set(25,20,25);
                self.actualCamera.rotation.set(-Math.sin(Math.PI/4)*Math.PI/3,Math.PI/4,Math.cos(Math.PI/4)*Math.PI/4);
            };

			self.addFrameUpdatedObject = function(object){
				self.updateOnFrame.push(object);
			};

            self.removeFrameUpdatedObject = function(object){
                self.updateOnFrame = self.updateOnFrame.filter(function(updatedObj){
                    return object != updatedObj;
                });
            };

            self.addObject = function (object) {
                sceneElements.push(object);
                self.scene.add(object);
            };

            self.removeObject = function (object) {
                self.scene.remove(object);
            };

            self.loadModel = function (modelUrl,modelName) {
                var deferred = $q.defer();
                var loader = new THREE.ColladaLoader(); // init the loader util
                loader.options.convertUpAxis = true;

                loader.load(modelUrl, function (collada) {
                    collada.scene.name = modelName || "";
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

            self.render = function() {
                requestAnimationFrame(self.render);
				var deltaTime = clock.getDelta();

                renderer && renderer.render(self.scene, self.actualCamera);
				
				THREE.AnimationHandler.update(deltaTime);
				
				self.updateOnFrame.forEach(function(object){
					object.update(deltaTime);
				});
            };

            $($window).on('resize',function(){
                self.renderer.setSize(self.config.element.width(),self.config.element.height());
                self.baseCamera.aspect = self.config.element.width()/self.config.element.height();
                self.baseCamera.updateProjectionMatrix();
            });

            init();
            return self;
        };
    });
