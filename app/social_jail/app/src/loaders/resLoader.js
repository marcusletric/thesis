var resourceFetcher = function ($http,$q) {

    this.fetchResources = function(dirPath){
        return getJSON(dirPath + '/resInfo.json')
    };

    function getJSON(url){
        var deferred = $q.defer();
        $http.get(url).then(function(data){
            deferred.resolve($.parseJSON(data));
        });
        return deferred.promise;
    }

};

angular.module('app.rendering').service('resourceFetcher', ['$http', '$q', resourceFetcher]);