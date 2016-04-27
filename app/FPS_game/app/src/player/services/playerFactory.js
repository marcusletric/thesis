angular.module('fps_game.player').factory('Player', function ($timeout,$rootScope,$q,webSocket,gameConfigModel){
	return function (renderer,model) {
		var self = this;
		var playerID = null;
		var gameID = null;
		self.pingStart = new Date().getTime();

		var movementSpeed = 3.2;
		var mouseSensitivity = gameConfigModel.mouseSensitivity || 0.55;
		var modelLoaded = false;
		var shootShatter = { x: 0, y: 0};

		self.renderer = renderer;
		self.camera = renderer.baseCamera;
		self.model = model;
		self.animation = null;
		self.networkPlayer = false;
		self.ready = false;
		self.active = true;
		self.ping = 0;
		self.onStage = false;

		self.lookTarget = new THREE.Object3D();
		self.movementVector = null;
		self.initialRotation = {x: 0, y: 0, z: 0};
		self.lookAngles = { x: 0, y: 0, z: 0};
		self.movementFlags = { F: 0, B: 0, L: 0, R: 0, MV: 0, MH: 0};

		self.inGame = false;
		self.name = '';
		self.dead = true;
		self.health = 0;
		self.score = 0;
		self.tookDmg = false;
		self.headShot = false;
		self.shooting = false;
		self.hitAreas = [];


		self.setReadyState = function(readiness){
			self.ready = readiness;
			webSocket.playerReadyStateChange(self.getNetworkPlayer());
		};

		self.setGameID = function(id){
			gameID = id;
		};

		self.getGameID = function(){
			return gameID;
		};

		self.setID = function(id){
			playerID = id;
			if(self.name == ''){
				self.name = 'Anonim ' + id;
			}
		};

		self.getID = function(){
			return playerID;
		};


		self.refreshPing = function(){
			self.pingStart = new Date().getTime();
			self.ping = 0;
			webSocket.ping(self.getNetworkPlayer());
		};

		self.pong = function(player){
			if(player.id == self.getID()){
				self.ping = (new Date().getTime()) - self.pingStart;
				webSocket.playerUpdate(self.getNetworkPlayer());
			}
		};

		self.update = function(deltaTime){
			if(!self.networkPlayer) {
				var moving = moveUpdated();

				if (moving) {
					if (!self.animation.isPlaying) {
						self.animation.play(0);
					}
				} else {
					if (self.animation.isPlaying) {
						self.animation.stop();
					}
				}

				if(self.movementFlags.MV){
					if(self.lookAngles.x > -50 && self.lookAngles.x < 50){
						self.lookAngles.x -= (self.movementFlags.MV / 180 * Math.PI) * mouseSensitivity;
					} else {
						self.lookAngles -= (Math.abs(self.lookAngles) / self.lookAngles * 2);
					}
					self.movementFlags.MV = 0;
				}

				if(self.movementFlags.MH){
					self.lookAngles.y -= (self.movementFlags.MH / 180 * Math.PI) * mouseSensitivity;
					self.movementFlags.MH = 0;
				}

				if (self.dead) {
					self.model.rotation.set(Math.PI / 2, self.lookAngles.y, 0);
				} else {
					self.model.applyMatrix(calculateNextMatrix(deltaTime));
					self.model.rotation.set(0, self.lookAngles.y, 0);
				}
				self.model.updateMatrix();


				self.camera.position.set(self.model.position.x, self.model.position.y + self.boundBox.max.y, self.model.position.z);
				self.lookTarget.position.set(
					self.model.position.x + -(Math.sin(self.lookAngles.y)),
					self.model.position.y + self.boundBox.max.y + (self.lookAngles.x ),
					self.model.position.z + -(Math.cos(self.lookAngles.y))
				);
				self.camera.lookAt(self.lookTarget.position);
				webSocket.playerUpdate(self.getNetworkPlayer());

				if(self.camera.fov > app.renderModel.config.camera.fov){
					self.camera.fov-=0.5;
					self.camera.updateProjectionMatrix();
				}
			}

			self.nozzleFlash.visible = self.shooting;
			if (self.shooting) {
				self.nozzleFlash.rotation.set(-Math.PI / 2, Math.random() * Math.PI * 2, 0);
				self.lookAngles.x -= shootShatter.y / 2;
				self.lookAngles.y -= shootShatter.x / 2;
				shootShatter.x = shootShatter.x / 2;
				shootShatter.y = shootShatter.y / 2;
				self.shooting = false;
			}
		};

		/*self.updateLook = function(delta){
			self.lookAngles.x = (delta.y * (Math.PI / 2)) + shootShatter.x;
			self.lookAngles.y = self.initialRotation.y + (delta.x * Math.PI) + shootShatter.y;
		};*/

		self.getNetworkPlayer = function(){
			return {
				'id' : self.getID(),
				'gameID' : self.getGameID(),
				'ping' : self.ping,
				'dead' : self.dead,
				'active' : self.active,
				'name' : self.name,
				'health' : self.health,
				'score' :self.score,
				'position' : self.model.position,
				'rotation' : self.model.rotation,
				'walking'  : self.animation && self.animation.isPlaying,
				'shooting' : self.shooting,
				'inGame': self.inGame,
				'ready' : self.ready
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
				var playerHit = closest.object.rootObj.player;
				function calculateDmg(){
					playerHit.hitAreas.forEach(function(hitArea){
						hitArea.visible=true;
					});
					var pierced = raycaster.intersectObjects( playerHit.hitAreas, true );
					playerHit.hitAreas.forEach(function(hitArea){
						hitArea.visible=false;
					});
					var dmg = 0;
					pierced.forEach(function(hitArea){
						var dmgValue = hitArea.object.parent.name.split('_')[2];
						if( dmgValue > dmg){
							dmg = dmgValue;
						}
					});
					dmg = (dmg == 0 ? 20 : dmg);
					return dmg;
				}

				webSocket.playerTakeDmg(angular.extend(closest.object.rootObj.player.getNetworkPlayer(),{"dmg": calculateDmg(), "fromPlayer" : self.getNetworkPlayer()}));
			}

			shootShatter.x = ((Math.random())-0.5)/180*Math.PI;
			shootShatter.y = ((Math.random())-0.5)/180*Math.PI;
			self.camera.fov += 1.5;
			self.camera.updateProjectionMatrix();
			self.lookAngles.x += shootShatter.x;
			self.lookAngles.y += shootShatter.y;
			self.shooting = true;
		};

		self.takeDamage = function(dmg,fromPlayer) {
			if(self.dead){
				return;
			}

			self.health -= dmg;
			if(self.health < 1){
				self.die(dmg,fromPlayer);
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

		self.die = function(dmg,fromPlayer){
			self.health = 0;
			self.dead = true;
			webSocket.playerScore(dmg,fromPlayer);
			$rootScope.$digest();
		};

		self.headShotKill = function(){
			self.headShot = true;
			$rootScope.$digest();
			$timeout(function(){
				self.headShot = false;
			},100);
		};

		self.addPlayerModel = function(){
			if(!self.onStage) {
				self.renderer.addObject(self.model);
				self.model.visible = true;
				self.renderer.addFrameUpdatedObject(self);
				self.onStage = true;
			}
		};

		self.removePlayerModel = function(){
			if(self.onStage){
				self.renderer.removeObject(self.model);
				self.model.visible = false;
				self.renderer.removeFrameUpdatedObject(self);
				self.onStage = false;
			}
		};

		init();

		function init(){
			webSocket.addListener('pong',self.pong);

			var boxhelper = new THREE.BoundingBoxHelper( self.model, 0xff0000 );
			boxhelper.update();

			self.boundBox = boxhelper.box;

			self.model.traverse( function( child ) {
				child.rootObj = self.model;
				if ( child instanceof THREE.SkinnedMesh ) {
					self.animation = new THREE.Animation( child, child.geometry.animation );
				}
			});

			self.model.children.forEach(function(child){
				if(child.name == "nozzleFlash"){
					self.nozzleFlash = child;
					child.visible = false;
				}
				if(child.name.indexOf("hitArea") > -1){
					self.hitAreas.push(child);
					child.visible = false;
				}
			});

			self.model.player = self;
			self.renderer.addObject(self.lookTarget);
			self.model.visible = false;
			resetMovementFlag();
			modelLoaded = true;
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
				new THREE.Vector3(self.model.position.x,self.model.position.y + self.boundBox.max.y,self.model.position.z),
				new THREE.Vector3(0,-1,0).normalize()
			);

			var raycaster = new THREE.Raycaster();

			raycaster.ray = collisionRay;

			var nearObjects = [];

			self.renderer.scene.children.forEach(function(child){
				if(self.model != child && self.model.position.distanceTo(child.position) <= child.nearRadius){
					nearObjects.push(child);
				}
			});

			var closest = raycaster.intersectObjects( nearObjects, true )[0];

			if( closest && closest.distance <= self.boundBox.max.x + 0.5 ){
				self.movementVector.setLength(0);
			}

			raycaster.ray = downRay;

			closest = raycaster.intersectObjects( nearObjects, true )[0];

			if( closest && angular.isNumber(closest.distance) && self.model.position.y + self.boundBox.max.y - closest.distance > self.model.position.y + 0.01 ){
				self.movementVector.setY(self.boundBox.max.y - closest.distance);
				//self.movementVector.setY(0);
			} else if(closest && self.model.position.y + self.boundBox.max.y - closest.distance < self.model.position.y - 0.01) {
				self.movementVector.setY(-(self.model.position.y - (self.model.position.y + self.boundBox.max.y - closest.distance)));
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