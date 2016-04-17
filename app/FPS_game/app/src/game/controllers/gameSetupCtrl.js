angular.module('fps_game.game').controller('GameSetupCtrl', function ($scope, $q, resourceFetcher, sceneLoader, Player, networkGameDriver, networkPlayerControlService) {
	var init = function () {

		// A forrasok gyokerkonyvtara
		var resRoot = '/assets';

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
			networkGameDriver.connect().then(function (clientID) {
				addUserPlayer(clientID);
				networkGameDriver.addCurrentPlayer($scope.player);
			});
		}

		/**
		 * Aktualis jatekos hozzaadasa
		 *
		 * @param clientID Kliens azonosito
		 * @returns {$q.promise}
		 */
		function addUserPlayer(clientID) {
			$scope.player = new Player(app.renderer);
			$scope.player.setID(clientID);
			app.renderer.addFrameUpdatedObject($scope.player);
		}
	};

	init();
});