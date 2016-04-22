angular.module('fps_game.common').service('helper3D', function () {
	this.applyTransformation = function(model,tr){
		if(angular.isArray(tr)){
			applyTransformationMatrix(model,tr);
		} else {
			applyTransformationObject(model,tr);
		}
	};

	function applyTransformationMatrix(model,tr){
		model.updateMatrix();
		var transMatrix = new THREE.Matrix4();
		transMatrix.set(
			tr[0],tr[1],tr[2],tr[3],
			tr[4],tr[5],tr[6],tr[7],
			tr[8],tr[9],tr[10],tr[11],
			tr[12],tr[13],tr[14],tr[15]
		);
		model.applyMatrix(transMatrix);
		model.updateMatrix();
	}

	function applyTransformationObject (model,trObj){
		model.updateMatrix();
		model.position.set(trObj.position[0],trObj.position[1],trObj.position[2]);
		model.rotation.set(trObj.rotation[0]/180*Math.PI,trObj.rotation[1]/180*Math.PI,trObj.rotation[2]/180*Math.PI);
		model.updateMatrix();
	}


});