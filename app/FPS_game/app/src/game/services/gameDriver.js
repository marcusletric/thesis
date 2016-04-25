angular.module('fps_game.game').service('gameDriver', function ($q, resourceFetcher, sceneLoader, Player, networkGameDriver,webSocket,gameConfigModel) {
   var self = this;
   var respawnPoints = [];
   var renderScope = null;

   this.init = function(scope){
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

   this.start = function(){
      self.respawnPlayer(networkGameDriver.currentPlayer);
      networkGameDriver.currentPlayer.score=0;
   };

   webSocket.addListener('startGame',self.start);

   /**
    * Jatek inicializalasa
    */
   function initGame() {
      collectRespawnPoints();
      networkGameDriver.connect().then(function (networkPlayer) {
         addUserPlayer(networkPlayer);
      });
   }

   /**
    * Aktualis jatekos hozzaadasa
    *
    * @param networkPlayer Játékos objektum
    * @returns {$q.promise}
    */
   function addUserPlayer(networkPlayer) {
      renderScope.player = new Player(app.renderModel);
      renderScope.player.name = networkPlayer.name || gameConfigModel.playerName;
      renderScope.player.setID(networkPlayer.id);

      if(networkPlayer.position && networkPlayer.rotation){
         networkGameDriver.currentPlayer = renderScope.player;
         networkGameDriver.updatePlayer(networkPlayer);
         networkGameDriver.updateUserPlayer(networkPlayer);
      } else {
         networkGameDriver.addCurrentPlayer(renderScope.player);
      }
      webSocket.playerUpdate(networkGameDriver.currentPlayer.getNetworkPlayer());
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
