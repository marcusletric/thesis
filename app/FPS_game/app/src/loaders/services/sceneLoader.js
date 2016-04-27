angular.module('fps_game.loaders').service('sceneLoader', function ($http, $q, multiplyGenerator, sceneReplacements, helper3D) {

    var self = this;
    var renderScope = null;
	var textureLoading = 0;
	var modelsLoaded = false;
	var texturesLoaded = false;
	var loadDeferred = null;
	var sceneModels = [];
	
	var imageloader = new THREE.ImageLoader();
	imageloader.manager.onStart = function(){
			textureLoading++;
	};
	
	imageloader.manager.onLoad = function(){
		textureLoading--;
		textureLoaded();
	};

    this.generators = {
        "multiply" : multiplyGenerator
    };

    this.loadScene = function(scope,scenePath){
		sceneModels = [];
		loadDeferred = $q.defer();
        scope.loading = true;

		renderScope = scope;
		modelsLoaded = false;
		texturesLoaded = false;

        $http.get(scenePath + '/models.json').then(function(response){
            var sceneModels = response.data.scene_models;
            var loadedModels = [];
            sceneModels.forEach(function(model){
				if(model.model_src){
					loadedModels.push(app.renderModel.loadModel(scenePath + model.model_src, model.model_name));
				}

				if(model.THREE_object){
					var deferred = $q.defer();
					var constructor = THREE[model.THREE_object];
					loadedModels.push(deferred.promise);
					var newObj = new ( constructor.bind.apply( constructor, model.THREE_object_params ) )();
					newObj.name = model.model_name;
					deferred.resolve( newObj );
				}
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
							newModel.name = loadedModel.name;
							if(generator.postTransform){
								helper3D.applyTransformation(newModel,generator.postTransform);
							}

							appendNearRadius(newModel);
							readyModels.push(newModel)
						});
                    } else {
                        var newModel = loadedModel;
						appendNearRadius(newModel);
						readyModels.push(newModel)
                    }
					
					if(loadedModel.meta.replacements){
                        loadedModel.meta.replacements.forEach(function(replacement){
							replaceRecursive(newModel,replacement);
						});
                    }
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
				sceneModels.push(model);
				if(model.name != "player"){
					app.renderModel.addObject(model);
				}
			});
			renderScope.loading = false;
			loadDeferred.resolve(true);
		}
	}

	function replaceRecursive(model,replacement){
		if(needReplace(model, replacement)){
			model = sceneReplacements[replacement.replacementName](model);
		} else {
			if(model.children && model.children.length){
				for(index in model.children){
					replaceRecursive(model.children[index],replacement);
				}
			}
		}

		function needReplace(model, replacement){
			return model.type == replacement.type && model.parent.name.match(replacement.nameRegex)
		}
	}

	self.getSceneModels = function(name){
		return sceneModels.filter(function(model){
			return !name || model.name == name;
		});
	}
});