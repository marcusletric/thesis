var sceneLoader = function ($http,$q, housingGenerator) {

    var self = this;

    this.generators = {
        "housing" : housingGenerator
    };

    this.loadScene = function(scope,scenePath){
        scope.loading = true;
        $http.get(scenePath + '/models.json').then(function(response){
            var sceneModels = response.data.scene_models;
            var loadedModels = [];
            sceneModels.forEach(function(model){
                loadedModels.push(scope.renderer.loadModel(scenePath + model.model_src));
            });
            $q.all(loadedModels).then(function(loadedModels){
                loadedModels.forEach(function(loadedModel, index){
                    loadedModel.meta = sceneModels[index];
                    var newModel;

                    /*function applyMatrixTo(model,matrix){
                        if(model.geometry){
                            model.geometry.applyMatrix(matrix);
                        }
                        if(model.children){
                            model.children.forEach(function(child){
                                applyMatrixTo(child,matrix);
                            });
                        }
                    }*/

                    if(loadedModel.meta.generator){
                        var generatorInstance = self.generators[loadedModel.meta.generator.function];
                        newModel = generatorInstance.generate.apply(this,[loadedModel].concat(loadedModel.meta.generator.parameters));
                    } else {
                        newModel = loadedModel;
                    }
					
					/*if(loadedModel.meta.replacements){
                        loadedModel.meta.replacements.forEach(function(replacement){
							newModel
						});
                    }*/
					if(loadedModel.meta.transform){
						newModel.translateX(loadedModel.meta.transform[0][3]);
						newModel.translateY(loadedModel.meta.transform[1][3]);
						newModel.translateZ(loadedModel.meta.transform[2][3]);
					}
					
					scope.renderer.addObject(newModel);
                });
                scope.loading = false;
            });
        });
    };

};

angular.module('fps_game.loaders').service('sceneLoader', ['$http','$q', 'housingGenerator', sceneLoader]);