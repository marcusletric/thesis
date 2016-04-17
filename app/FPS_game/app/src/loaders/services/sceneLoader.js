angular.module('fps_game.loaders').service('sceneLoader', function ($http, $q, housingGenerator,helper3D) {

    var self = this;
    var renderScope = null;
	var textureLoading = 0;
	var modelsLoaded = false;
	var texturesLoaded = false;
	var loadDeferred = null;
	
	var imageloader = new THREE.ImageLoader();
	imageloader.manager.onStart = function(){
			textureLoading++;
	};
	
	imageloader.manager.onLoad = function(){
		textureLoading--;
		textureLoaded();
	};

    this.generators = {
        "housing" : housingGenerator
    };

    this.loadScene = function(scope,scenePath){
		loadDeferred = $q.defer();
        scope.loading = true;

		renderScope = scope;
		modelsLoaded = false;
		texturesLoaded = false;

        $http.get(scenePath + '/models.json').then(function(response){
            var sceneModels = response.data.scene_models;
            var loadedModels = [];
            sceneModels.forEach(function(model){
                loadedModels.push(app.renderer.loadModel(scenePath + model.model_src));
            });
			
            $q.all(loadedModels).then(function(loadedModels){
				var readyModels = [];
                loadedModels.forEach(function(loadedModel, index){
                    loadedModel.meta = sceneModels[index];
					if(loadedModel.meta.transform){
						helper3D.applyTransformationMatrix(loadedModel,loadedModel.meta.transform);
					}

                    if(loadedModel.meta.generators){
                        loadedModel.meta.generators.forEach(function(generator){
							var newModel;
							var modelClone = loadedModel.clone();
							var generatorInstance = self.generators[generator.function];
							
							newModel = generatorInstance.generate.apply(this,[modelClone].concat(generator.parameters));
							
							if(generator.postTransform){
								helper3D.applyTransformationMatrix(newModel,generator.postTransform);
							}

							appendNearRadius(newModel);
							readyModels.push(newModel)
						});
                    } else {
                        newModel = loadedModel;
						appendNearRadius(newModel);
						readyModels.push(newModel)
                    }
					
					/*if(loadedModel.meta.replacements){
                        loadedModel.meta.replacements.forEach(function(replacement){
							newModel
						});
                    }*/
                });
				handleLoad(readyModels);
            });
        });

		return loadDeferred.promise;
    };
	
	function textureLoaded(){
		if(textureLoading < 1){
			handleLoad();
		}
	}

	function appendNearRadius(object) {
		var boxHelper = new THREE.BoundingBoxHelper( object, 0xff0000 );
		boxHelper.update();
		var largest = 0;
		for(var edge in boxHelper.box){
			for(var axis in boxHelper.box[edge]) {
				var radius = Math.abs(boxHelper.box[edge][axis]) - Math.abs(object.position[axis]);
				if (radius > largest) {
					largest = radius;
				}
			}
		}
		object.nearRadius = largest + 1;
	}

	function handleLoad(loadedModels){
		if(!angular.isUndefined(loadedModels)){
			modelsLoaded = loadedModels;
		} else {
			texturesLoaded = true;
		}
		
		if(texturesLoaded && modelsLoaded){
			modelsLoaded.forEach(function(model){
				app.renderer.addObject(model);
			});
			renderScope.loading = false;
			loadDeferred.resolve(true);
		}
	}
});