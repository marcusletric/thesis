var GameInstance = function(gameID,playerPool){
    var self = this;

    self.id = gameID;
    self.running = false;
    self.queueing = false;
    self.playerQueue = [];
    self.activePlayers = [];


    self.startGame = function(timestamp,gameTime){
        self.running = timestamp;
        self.queueing = false;
        self.gameTime = timestamp + gameTime;
        self.activePlayers = [];
        self.activePlayers = self.activePlayers.concat(self.playerQueue);
        self.activePlayers.forEach(function(player){
            playerPool[player.id].inGame = true;
        });
    };

    self.endGame = function(){
        self.running = false;
        self.activePlayers.forEach(function(player){
            playerPool[player.id].dead = true;
            playerPool[player.id].ready = false;
        });
    };

    self.inQueue = function(player){
        return self.playerQueue.find(function(queuedPlayer){
            return player.id == queuedPlayer.id;
        });
    };

    self.startQueueing = function(timestamp,queueTime){
        for(var id in playerPool){
            playerPool[id].inGame = false;
        }
        self.activePlayers = [];
        self.playerQueue = [];
        self.queueing = timestamp;
        self.queueTime = timestamp + queueTime;
    };

    self.queue = function(player){
        console.log('Player ' + player.id + ' added to queue.');
        player.gameID = self.id;
        self.playerQueue.push(player);
    };

    self.unQueue = function(player) {
        self.playerQueue = self.playerQueue.filter(function(queuedPlayer){
            return player.id != queuedPlayer.id;
        });

        console.log('Player ' + player.id + ' removed from queue.');
    };
};

module.exports = GameInstance;
