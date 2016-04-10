angular.module('fps_game.game').controller('GameSetupCtrl', function ($scope, $q, resourceFetcher, sceneLoader, Player, webSocket) {
	var init = function () {

		// A forrasok gyokerkonyvtara
		var resRoot = '/assets';
		var networkPlayers = {};


		/**
		 * A palya elemeinek osszegyujtese, betoltese, palya generalasa
		 */
		resourceFetcher.fetchResources(resRoot + '/scenes').then(function (resourceMap) {
			sceneLoader.loadScene($scope, resRoot + '/scenes' + resourceMap[0].src).then(initGame);
		});

		/**
		 * Jatek inicializalasa
		 */
		function initGame() {
			webSocket.init().then(function (clientID) {
				addUserPlayer(clientID).then(function(){
					webSocket.addListener('getAllPlayers',addOtherPlayers);
					webSocket.addListener('playerUpdate',updatePlayer);
					webSocket.addListener('playerConnect',addNetworkPlayer);
					webSocket.addListener('playerDisconnect',removeNetworkPlayer);
					webSocket.getAllPlayers();
				});
			});
		}

		/**
		 * Aktualis jatekos hozzaadasa
		 *
		 * @param clientID Kliens azonosito
		 * @returns {$q.promise}
		 */
		function addUserPlayer(clientID) {
			var deferred = $q.defer();
			$scope.renderer.loadModel(resRoot + '/meshes/player.dae').then(function (playerMesh) {
				$scope.player = new Player(playerMesh, $scope.renderer);
				$scope.player.setID(clientID);
				webSocket.addPlayer($scope.player.getNetworkPlayer());
				$scope.renderer.addObject($scope.player.model);
				$scope.renderer.addObject($scope.player.lookTarget);
				$scope.renderer.addFrameUpdatedObject($scope.player);
				deferred.resolve(true);
			});

			return deferred.promise;
		}

		/**
		 * A jatekszerverhez csatlakozott jatekosok hozzaadasa
		 *
		 * @param networkPlayers
		 */
		function addOtherPlayers(networkPlayers){
			for(var id in networkPlayers){
				addNetworkPlayer(networkPlayers[id]);
			}
		}

		/**
		 * Egy szerveren tartozkodo jatekos hozzaadasa a szcenahoz
		 *
		 * @param player
		 */
		function addNetworkPlayer(player){
			if(player.id != $scope.player.getID()) {
				$scope.renderer.loadModel(resRoot + '/meshes/player.dae').then(function (playerMesh) {
					var newPlayer = new Player(playerMesh, $scope.renderer);
					newPlayer.setID(player.id);
					$scope.renderer.addObject(newPlayer.model);
					newPlayer.model.position.set(player.position.x,player.position.y,player.position.z);
					newPlayer.model.rotation.set(player.rotation._x,player.rotation._y,player.rotation._z,player.rotation._order);
					networkPlayers[player.id] = newPlayer;
					console.log('Player ' + player.id + ' connected');
				});
			}
		}

		/**
		 * Jatekos parametereinek frissitese
		 *
		 * @param player
		 */
		function updatePlayer(player){
			if(networkPlayers[player.id]){
				networkPlayers[player.id].model.position.set(player.position.x,player.position.y,player.position.z);
				networkPlayers[player.id].model.rotation.set(player.rotation._x,player.rotation._y,player.rotation._z,player.rotation._order);
			}
		}

		/**
		 * Lecsatlakozott jatekos eltavolitasa
		 *
		 * @param player
		 */
		function removeNetworkPlayer(player){
			if(networkPlayers[player.id]){
				$scope.renderer.removeObject(networkPlayers[player.id].model);
				delete(networkPlayers[player.id]);
			}
		}


	};

	init();
});