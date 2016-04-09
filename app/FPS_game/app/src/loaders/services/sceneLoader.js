var sceneLoader = function ($http,$q, housingGenerator) {

    var self = this;
    var renderScope = null;
	var textureLoading = 0;
	var modelsLoaded = false;
	var texturesLoaded = false;
	
	var imageloader = new THREE.ImageLoader();
	imageloader.manager.onStart = function(){
			textureLoading++;
	}
	
	imageloader.manager.onLoad = function(){
		textureLoading--;
		textureLoaded();
	}

    this.generators = {
        "housing" : housingGenerator
    };

    this.loadScene = function(scope,scenePath){
		
        scope.loading = true;
		renderScope = scope;
		modelsLoaded = false;
		texturesLoaded = false;
        $http.get(scenePath + '/models.json').then(function(response){
            var sceneModels = response.data.scene_models;
            var loadedModels = [];
            sceneModels.forEach(function(model){
                loadedModels.push(scope.renderer.loadModel(scenePath + model.model_src));
            });
			
            $q.all(loadedModels).then(function(loadedModels){
				var readyModels = [];
                loadedModels.forEach(function(loadedModel, index){
                    loadedModel.meta = sceneModels[index];
					if(loadedModel.meta.transform){
						applyTransformationMatrix(loadedModel,loadedModel.meta.transform);
					}

                    if(loadedModel.meta.generators){
                        loadedModel.meta.generators.forEach(function(generator){
							var newModel;
							var modelClone = loadedModel.clone();
							var generatorInstance = self.generators[generator.function];
							
							newModel = generatorInstance.generate.apply(this,[modelClone].concat(generator.parameters));
							
							if(generator.postTransform){
								applyTransformationMatrix(newModel,generator.postTransform);
							}
							
							readyModels.push(newModel)
						});
                    } else {
                        newModel = loadedModel;
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
    };
	
	function textureLoaded(){
		if(textureLoading < 1){
			handleLoad();
		}
	}
	
	function handleLoad(loadedModels){
		if(!angular.isUndefined(loadedModels)){
			modelsLoaded = loadedModels;
		} else {
			texturesLoaded = true;
		}
		
		if(texturesLoaded && modelsLoaded){
			modelsLoaded.forEach(function(model){
				renderScope.renderer.addObject(model);
			});
		}
		renderScope.loading = false;
	}
	
	function applyTransformationMatrix(model,tr){
		model.updateMatrix();
		var transMatrix = new THREE.Matrix4();
		var currentMatrix = model.matrix;
		transMatrix.set(
			tr[0][0],tr[0][1],tr[0][2],tr[0][3],
			tr[1][0],tr[1][1],tr[1][2],tr[1][3],
			tr[2][0],tr[2][1],tr[2][2],tr[2][3],
			tr[3][0],tr[3][1],tr[3][2],tr[3][3]
		);
		// TODO: fix!
		//transMatrix.multiply(currentMatrix);
		model.applyMatrix(transMatrix);
	}

};

angular.module('fps_game.loaders').service('sceneLoader', ['$http','$q', 'housingGenerator', sceneLoader]);