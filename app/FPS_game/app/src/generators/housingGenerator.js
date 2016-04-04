/**
 * Created by Administrator on 2016.03.28..
 */
var housingGenerator = function () {

        this.generate = function(model,xMult,yMult,zMult) {
            var newModel = new THREE.Object3D;
            var cursor = null;
			
			var boxHelper = new THREE.BoundingBoxHelper( model, 0xff0000 );
			boxHelper.update();
			boundbox = boxHelper.box;
			
			cursor = model.clone();
			cursor.translateX(-boundbox.max.x*(xMult-1));
			cursor.translateY(-boundbox.max.y*(yMult-1));
			cursor.translateZ(-boundbox.max.z*(zMult-1));
            for (var x = 0; x < xMult; x++) {
                newModel.add(cursor.clone());
                cursor.translateX(boundbox.max.x*2);
			}
			cursor = newModel.clone();
            for (var y = 0; y < yMult; y++) {
				newModel.add(cursor.clone());
                cursor.translateY(boundbox.max.y*2);
			}
			cursor = newModel.clone();
			for (var z = 0; z < zMult; z++) {
				newModel.add(cursor.clone());
				cursor.translateZ(boundbox.max.z*2);
			}
                
            return newModel;
        }

};

angular.module('fps_game.generators').service('housingGenerator', [housingGenerator]);