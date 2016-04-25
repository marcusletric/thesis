angular.module('fps_game.loaders').service('resourceFetcher', function ($http,$q) {
    this.fetchResources = function(dirPath){
        return getJSON(dirPath + '/resInfo.json')
    };

    function getJSON(url){
        var deferred = $q.defer();
        $http.get(url).then(function(response){
            deferred.resolve(response.data);
        });
        return deferred.promise;
    }

});