angular.module('fps_game.player').directive('keyboardControl', function () {
    return {
      restrict: 'A',
      link: function(scope){
		  $('body').on('keydown',function(event){
			  if(scope.loading){return;}
			  switch(String.fromCharCode(event.which)){
				  case 'w' :
				  case 'W' : scope.player.movementFlags.F=1; break;
				  case 'a' :
				  case 'A' : scope.player.movementFlags.L=1; break;
				  case 's' :
				  case 'S' : scope.player.movementFlags.B=1; break;
				  case 'd' :
				  case 'D' : scope.player.movementFlags.R=1; break;
			  }
			  if(event.keyCode == 9){
				  if(event.preventDefault) {
					  event.preventDefault();
				  }
				  scope.showstats = true;
				  scope.$digest();
			  }
		  });
		  
		  $('body').on('keyup',function(){
			  if(scope.loading){return;}
			  switch(String.fromCharCode(event.which)){
				  case 'w' :
				  case 'W' : scope.player.movementFlags.F=0; break;
				  case 'a' :
				  case 'A' : scope.player.movementFlags.L=0; break;
				  case 's' :
				  case 'S' : scope.player.movementFlags.B=0; break;
				  case 'd' :
				  case 'D' : scope.player.movementFlags.R=0; break;
			  }
			  if(event.keyCode == 9){
				  if(event.preventDefault) {
					  event.preventDefault();
				  }
				  scope.showstats = false;
				  scope.$digest();
			  }
		  });
	  }
    };
  });