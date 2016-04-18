angular.module('fps_game.loaders').service('sceneReplacements', function () {
    this.streetLight = function(original) {
        original.intensity = 0.1;
        original.distance = 5;
        original.exponent = 50;
        var modTarget = findTarget(original);
        modTarget.position.set(original.parent.position.x,0,original.parent.position.z);
        original.target = modTarget;
        return original;

        function findTarget(light){
            return light.parent.parent.children.find(function(child){
                return child.name = light.parent.name + ".Target"
            });
        }
    };

});
