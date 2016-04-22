angular.module('fps_game.game').service('gameDriver', function ($q, resourceFetcher, sceneLoader, Player, networkGameDriver, gameConfigModel) {
   var self = this;
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
      });
   }

   /**
    * Aktualis jatekos hozzaadasa
    *
    * @param clientID Kliens azonosito
    * @returns {$q.promise}
    */
   function addUserPlayer(clientID) {
      renderScope.player = new Player(app.renderModel);
      renderScope.player.name = gameConfigModel.name;
      renderScope.player.setID(clientID);
      networkGameDriver.addCurrentPlayer(renderScope.player);
      //renderScope.player.on('die')
   }

   function collectRespawnPoints(){
      respawnPoints = sceneLoader.getSceneModels().filter(function(model){
         return model.name == "spawnPoint";
      });
   }

   self.respawnPlayer = function(player){
      var randomPoint = respawnPoints[Math.floor(Math.random()*respawnPoints.length)];
      player.health = 100;
      player.dead = false;
      player.model.position.set( randomPoint.position.x, randomPoint.position.y, randomPoint.position.z);
      player.model.rotation.set( randomPoint.rotation.x, randomPoint.rotation.y, randomPoint.rotation.z);
      player.model.updateMatrix();
      player.initialRotation.y = randomPoint.rotation.y;
      player.lookAngles.y = player.initialRotation.y;
      player.update();

      if(!player.inGame){
         player.modelLoad.then(function(){
            app.renderModel.addObject(player.model);
            player.model.visible = true;
            app.renderModel.addFrameUpdatedObject(player);
         });
         player.inGame = true;
      }
      renderScope.$digest();
   }
});
