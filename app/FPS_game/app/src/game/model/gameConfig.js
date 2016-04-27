angular.module('fps_game.game').service('gameConfigModel', function ($cookies) {
    var self = this;

    var cookieData = $cookies.getObject('config');

    this.setup = false;

    this.resolution = 'low';
    this.shadows = false;
    this.playerName = '';
    this.serverAddr = 'ws://localhost:9001';
    this.mouseSensitivity = '0.35';

    if(cookieData){
        for(key in cookieData){
            self[key] = cookieData[key];
        }
    }
});
