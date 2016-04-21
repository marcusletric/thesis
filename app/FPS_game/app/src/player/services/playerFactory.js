angular.module('fps_game.player').factory('Player', function ($timeout,$rootScope,webSocket,eventService){
	return function (renderer) {
		var self = this;
		var playerID = null;

		var movementSpeed = 3.2;
		var oldLookAngles = null;
		var modelLoaded = false;

		new eventService(self);

		self.health = 0;
		self.score = 0;
		self.tookDmg = false;
		self.dead = true;

		self.model = new THREE.Object3D();
		self.renderer = renderer;
		self.camera = renderer.baseCamera;
		self.lookTarget = new THREE.Object3D();
		self.animation = null;
		self.movementFlags = {
			F: 0,
			B: 0,
			L: 0,
			r: 0
		};

		self.movementVector = null;
		self.lookAngles = {
			x: 0,
			y: 0,
			z: 0
		};

		self.setID = function(id){
			playerID = id;
		};

		self.getID = function(){
			return playerID;
		};

		self.lookAt = function (xAngle,yAngle) {
			self.lookAngles.x = xAngle;
			self.lookAngles.y = yAngle;
		};

		self.update = function(deltaTime){
			if(!modelLoaded){
				return;
			}

			var moving = moveUpdated();

			if(moving) {
				if(!self.animation.isPlaying){
					self.animation.play(0);
				}
			} else {
				if(self.animation.isPlaying){
					self.animation.stop();
				}
			}

			if(self.dead){
				self.model.rotation.set(Math.PI/2, self.lookAngles.y, 0);
			} else {
				self.model.applyMatrix(calculateNextMatrix(deltaTime));
				self.model.rotation.set(0, self.lookAngles.y, 0);
			}
			self.model.updateMatrix();


			self.camera.position.set(self.model.position.x, self.model.position.y + self.boundBox.max.y, self.model.position.z);
			self.lookTarget.position.set(
					self.model.position.x + -(Math.sin(self.lookAngles.y)),
					self.model.position.y + self.boundBox.max.y + (2 * Math.sin(self.lookAngles.x) ),
					self.model.position.z + -(Math.cos(self.lookAngles.y))
			);
			self.camera.lookAt(self.lookTarget.position);
			webSocket.playerUpdate(self.getNetworkPlayer());
		};

		self.updateLook = function(delta){
			self.lookAngles.x = delta.y * (Math.PI / 2);
			self.lookAngles.y = delta.x * Math.PI;
		};

		self.getNetworkPlayer = function(){
			return {
				'id' : self.getID(),
				'health' : self.health,
				'position' : self.model.position,
				'rotation' : self.model.rotation,
				'walking'  : self.animation && self.animation.isPlaying
			}
		};

		self.shoot = function(){
			if(self.dead){
				return;
			}

			var shootRay = new THREE.Ray(
				new THREE.Vector3(self.camera.position.x, self.camera.position.y, self.camera.position.z),
				new THREE.Vector3(self.lookTarget.position.x - self.camera.position.x,self.lookTarget.position.y - self.camera.position.y,self.lookTarget.position.z -self.camera.position.z).normalize()
			);

			var raycaster = new THREE.Raycaster();

			raycaster.ray = shootRay;

			var closest = raycaster.intersectObjects( self.renderer.scene.children, true )[0];

			if(closest.object.rootObj && closest.object.rootObj.player && closest.object.rootObj.player.getID() != playerID){
				webSocket.playerTakeDmg(angular.extend(closest.object.rootObj.player.getNetworkPlayer(),{"dmg": 30, "fromPlayer" : self.getNetworkPlayer()}));
			}
		};

		self.takeDamage = function(dmg,fromPlayer) {
			if(self.dead){
				return;
			}

			self.health -= dmg;
			if(self.health < 1){
				self.die(fromPlayer);
			}
			self.tookDmg = true;
			$rootScope.$digest();
			$timeout(function(){
				self.tookDmg = false;
			},100);
		};

		self.kill = function(){
			self.score++;
		};

		self.die = function(fromPlayer){
			self.health = 0;
			self.dead = true;
			webSocket.playerScore(fromPlayer);
			$rootScope.$digest();
		};

		init();

		function init(){
			self.renderer.loadModel('/assets/meshes/player.dae').then(function (playerMesh) {
				var boxhelper = new THREE.BoundingBoxHelper( playerMesh, 0xff0000 );
				boxhelper.update();

				self.boundBox = boxhelper.box;
				self.model = playerMesh;
				self.model.traverse( function( child ) {
					child.rootObj = self.model;
					if ( child instanceof THREE.SkinnedMesh ) {
						//self.animation = new THREE.Animation( child, child.geometry.animation );
						self.animation = {
							isPlaying : false,
							play: function(){},
							stop: function(){}
						}
					}
				});
				self.model.player = self;
				self.renderer.addObject(self.lookTarget);
				self.renderer.addObject(self.model);

				resetMovementFlag();
				modelLoaded = true;
			});
		}
		
		function resetMovementFlag(){
			self.movementDirection = null;
		}

		function moveUpdated(){
			return self.movementFlags.F || self.movementFlags.B || self.movementFlags.L || self.movementFlags.R;
		}

		function calculateNextMatrix(deltaTime){
			var distance = deltaTime * movementSpeed;
			var mv = [0,0,0];

			mv[2] = (self.movementFlags.F ? -1 : (self.movementFlags.B ? 1 : 0));
			mv[0] = (self.movementFlags.L ? -1 : (self.movementFlags.R ? 1 : 0));
			
			self.movementVector = new THREE.Vector3(mv[0],mv[1],mv[2]);

			self.movementVector.setLength(distance);
			self.movementVector.applyAxisAngle(new THREE.Vector3(0,1,0).normalize(), self.lookAngles.y);

			var collisionRay = new THREE.Ray(
				new THREE.Vector3(self.model.position.x,self.boundBox.max.y/3,self.model.position.z),
				self.movementVector.clone().normalize()
			);

			var downRay = new THREE.Ray(
				new THREE.Vector3(self.model.position.x,self.model.position.y + self.boundBox.max.y/2,self.model.position.z),
				new THREE.Vector3(0,-1,0).normalize()
			);

			var raycaster = new THREE.Raycaster();

			raycaster.ray = collisionRay;

			var nearObjects = [];

			self.renderer.scene.children.forEach(function(child){
				if(self.model.position.distanceTo(child.position) <= child.nearRadius){
					nearObjects.push(child);
				}
			});

			var closest = raycaster.intersectObjects( nearObjects, true )[0];

			if( closest && closest.distance <= self.boundBox.max.x + 0.5 ){
				self.movementVector.setLength(0);
			}

			raycaster.ray = downRay;

			closest = raycaster.intersectObjects( nearObjects, true )[0];

			if( closest && closest.distance - self.boundBox.max.y/2 - self.model.position.y < 0.1 ){
				self.movementVector.setY(self.boundBox.max.y/2 - closest.distance);
				//self.movementVector.setY(0);
			} else if(closest && closest.distance - self.boundBox.max.y/2 - self.model.position.y > 0.1) {
				self.movementVector.setY(self.boundBox.max.y/2 + closest.distance);
			} else {
				self.movementVector.setY(0);
			}

			if(self.dead){
				self.movementVector.setLength(0);
			}
			
			var transMatrix = new THREE.Matrix4();
			transMatrix.setPosition(self.movementVector);
			return transMatrix;
		}
	};
});