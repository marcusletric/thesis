angular.module('fps_game.game').service('gameDriver', function ($q, resourceFetcher, sceneLoader, Player, networkGameDriver,webSocket,gameConfigModel) {
   var self = this;
   var respawnPoints = [];
   var renderScope = null;
   var playerModel = null;

   self.init = function(scope){
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
      playerModel = sceneLoader.getSceneModels("player")[0];
      respawnPoints = sceneLoader.getSceneModels("spawnPoint");
      networkGameDriver.connect().then(function (networkPlayerInstance) {
         addUserPlayer(networkPlayerInstance);
      });
   }

   self.startGame = function(game){
      if(game.activePlayers.find(function(activePlayer){
            return activePlayer.id == networkGameDriver.currentPlayer.getID();
          })){
         self.respawnPlayer(networkGameDriver.currentPlayer);
         networkGameDriver.currentPlayer.score=0;
      }
      networkGameDriver.networkGame = game;
   };

   self.endGame = function(game){

   };


   webSocket.addListener('startGame',self.startGame);
   webSocket.addListener('endGame',self.endGame);

   /**
    * Aktualis jatekos hozzaadasa a jatekhoz
    *
    * @param networkPlayer Játékos objektum
    * @returns {$q.promise}
    */
   function addUserPlayer(networkPlayer) {
      renderScope.player = new Player(app.renderModel,playerModel);
      renderScope.player.name = networkPlayer.name || gameConfigModel.playerName;
      renderScope.player.setID(networkPlayer.id);

      networkGameDriver.addCurrentPlayer(renderScope.player);

      if(networkPlayer.inGame){
            renderScope.player.addPlayerModel();
            app.renderModel.addFrameUpdatedObject(renderScope.player);
            networkGameDriver.updatePlayerAttrs(renderScope.player,networkPlayer);
      }

      webSocket.playerUpdate(networkGameDriver.currentPlayer.getNetworkPlayer());
      webSocket.updateGame();
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

      }
      renderScope.$digest();
   }


});
