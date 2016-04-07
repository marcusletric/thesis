var playerFactory = function (model) {
	
	var movementSpeed = 
	
    this.model = model;
	this.animation = null;
	
	
	var lookAngles = {
		x: 0,
		y: 0
	};
	
	init();
	
	this.moveForward = function(){
		this.animation.play(0);
		this.movementDirection = "F";
	};
	
	this.moveBackwards = function(){
		this.animation.play(0);
		this.movementDirection = "B";
	};
	
	this.strafeLeft = function(){
		this.animation.play(0);
		this.movementDirection = "L";
	};
	
	this.strafeRight = function(){
		this.animation.play(0);
		this.movementDirection = "R";
	};
	
	this.stop = function(){
		this.animation.stop();
		resetMovementFlag();
	};
	
	this.lookAt = function (xAngle,yAngle) {
		lookAngles.x = xAngle;
		lookAngles.y = yAngle;
	};
	
	this.frameUpdate = function(deltaTime){
		if(this.movementDirection){
			switch(this.movementDirection){
				case "F" : this.model.applyMatrix(calculateNextFMatrix(deltaTime)); break;
				case "B" : this.model.applyMatrix(calculateNextBMatrix(deltaTime)); break;
				case "L" : this.model.applyMatrix(calculateNextLMatrix(deltaTime)); break;
				case "R" : this.model.applyMatrix(calculateNextRMatrix(deltaTime)); break;
			}
			this.model.updateMatrix();
		}
	};
	
	function init(){
		this.model.traverse( function( child ) {
			if ( child instanceof THREE.SkinnedMesh ) {
				this.animation = new THREE.Animation( child, child.geometry.animation );
				this.animation.timeScale(1.5);
			}
		});
		resetMovementFlag();
	};
	
	function resetMovementFlag(){
		this.movementDirection = null;
	};
	
	function calculateNextFMatrix(){
		var currentPos = this.model.position;
		
	};

};

angular.module('fps_game.player').factory('player', ['$http', '$q', playerFactory]);