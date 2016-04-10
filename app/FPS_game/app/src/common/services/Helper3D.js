angular.module('fps_game.common').service('helper3D', function () {

	this.applyTransformationMatrix = function(model,tr){
		var transMatrix = new THREE.Matrix4();
		transMatrix.set(
			tr[0],tr[1],tr[2],tr[3],
			tr[4],tr[5],tr[6],tr[7],
			tr[8],tr[9],tr[10],tr[11],
			tr[12],tr[13],tr[14],tr[15]
		);
		model.applyMatrix(transMatrix);
	}


});