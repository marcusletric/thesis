var playerFactory = function (){
	return function (model,camera) {
		var self = this;
		
		var movementSpeed = 3.2;

		self.mouseSensitivity = 0.8;
		self.model = model;
		self.camera = camera;
		self.lookTarget = new THREE.Object3D();
		self.animation = null;
		self.movementFlags = {
			F: 0,
			B: 0,
			L: 0,
			r: 0
		};

		var boxhelper = new THREE.BoundingBoxHelper( self.model, 0xff0000 );
		boxhelper.update();
		self.boundBox = boxhelper.box;
		
		
		self.lookAngles = {
			x: 0,
			y: 0,
			z: 0
		};
		
		init();

		self.stop = function(){
			self.animation.stop();
			resetMovementFlag();
		};

		self.lookAt = function (xAngle,yAngle) {
			self.lookAngles.x = xAngle;
			self.lookAngles.y = yAngle;
		};

		self.update = function(deltaTime){
			self.model.applyMatrix(calculateNextMatrix(deltaTime));
			self.model.rotation.set(0,self.lookAngles.y,0);
			self.model.updateMatrix();
			self.camera.position.set(self.model.position.x,self.boundBox.max.y,self.model.position.z);
			self.lookTarget.position.set(
				self.model.position.x + -(Math.sin(self.lookAngles.y)),
				self.boundBox.max.y + (2 * Math.sin(self.lookAngles.x)),
				self.model.position.z + -(Math.cos(self.lookAngles.y))
			);
			self.camera.lookAt(self.lookTarget.position);
		};

		self.updateLook = function(delta){
			self.lookAngles.x = delta.y * (Math.PI / 2);
			self.lookAngles.y = delta.x * Math.PI;
		};

		function init(){
			self.model.traverse( function( child ) {
				if ( child instanceof THREE.SkinnedMesh ) {
					self.animation = new THREE.Animation( child, child.geometry.animation );
				}
			});
			resetMovementFlag();
		}
		
		function resetMovementFlag(){
			self.movementDirection = null;
		}
		
		function calculateNextMatrix(deltaTime){
			var distance = deltaTime * movementSpeed;
			var mv = [0,0,0];

			mv[2] = (self.movementFlags.F ? -1 : (self.movementFlags.B ? 1 : 0));
			mv[0] = (self.movementFlags.L ? -1 : (self.movementFlags.R ? 1 : 0));
			
			var movementVector = new THREE.Vector3(mv[0],mv[1],mv[2]);
			
			movementVector.setLength(distance);
			movementVector.applyAxisAngle(new THREE.Vector3(0,1,0).normalize(), self.lookAngles.y);
			
			
			var transMatrix = new THREE.Matrix4();
			transMatrix.setPosition(movementVector);
			return transMatrix;
		}

	};
};

angular.module('fps_game.player').factory('Player', ['$http', '$q', playerFactory]);