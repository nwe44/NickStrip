/* Author: Nick Evans

*/
var nick = nick || {};
nick = {
	// universal, device independent behaviours
	behaviours : function(){

		// header
       $.fn.waypoint.defaults.offset = "75%";
       $('.col').each(function(){
			$(this).waypoint(function(event, direction) {
			   $.waypoints().parent().removeClass('waypoint-active');
			   if(direction == "down"){
				   $(this).parent().addClass('waypoint-active');			   
			   }else{
				   $(this).parent().prev().addClass('waypoint-active');			   			   	
			   }

			});
       });
       
       
       $('body').removeClass('loading');
      // slideshows
       $('.slideshow').groupedCrossFader();
	}	
};

$(document).ready(function() { 
	nick.behaviours();
	yepnope({
        test: Modernizr.touch,
        yep: ['js/libs/iscroll-min.js','js/mylibs/touchHelpers.js'],
        nope: ['js/mylibs/desktopHelpers.js'],
        callback: function (url, result, key) {
			if(result){
				if(url === "js/mylibs/touchHelpers.js"){
		           nick.touchBehaviours();			
				}
			}else{
			   nick.desktopBehaviours();			   
			}
        }
    });
});
