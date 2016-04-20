angular.module('fps_game.game').service('gameDriver', function ($q, resourceFetcher, sceneLoader, Player, networkGameDriver) {
   var respawnPoints = [];
   var renderScope = null;

   this.start = function(scope){
      renderScope = scope;
      // A forrasok gyokerkonyvtara
      var resRoot = '/assets';

      /**
       * A palya elemeinek osszegyujtese, betoltese, palya generalasa
       */
      resourceFetcher.fetchResources(resRoot + '/scenes').then(function (resourceMap) {
         sceneLoader.loadScene(renderScope, resRoot + '/scenes' + resourceMap[0].src).then(initGame)
      });
   };

   /**
    * Jatek inicializalasa
    */
   function initGame() {
      collectRespawnPoints();
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
      renderScope.player = new Player(app.renderer);
      renderScope.player.setID(clientID);
      app.renderer.addFrameUpdatedObject(renderScope.player);
   }

   function collectRespawnPoints(){
      respawnPoints = sceneLoader.getSceneModels().filter(function(model){
         return model.name == "spawnPoint";
      });
   }

   this.respawn = function(player){
      var randomPoint = respawnPoints[Math.floor(random()*respawnPoints.length)];

      player.model.position = randomPoint.position.clone();
      player.model.rotation = randomPoint.rotation.clone();
   };
});
