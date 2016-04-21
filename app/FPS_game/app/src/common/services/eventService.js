angular.module('fps_game.common').factory('eventService', function () {
    return function(instance){
        instance.eventHandlers = [];

        instance.on = function(event, eventHandler){
            var eventObj = {};
            eventObj[event] = eventHandler;
            eventHandlers.push(eventObj);
        };

        instance.trigger = function(event){
            instance.eventHandlers.forEach(function(eventObj){
                eventObj[event] && eventObj[event]();
            });
        }
    }


});
