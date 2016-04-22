angular.module('fps_game.game').service('gameConfigModel', function () {

    this.setup = false;

    this.resolution = 'low';
    this.shadows = false;
    this.playerName = '';
    this.serverAddr = 'ws://localhost:9001';

});
