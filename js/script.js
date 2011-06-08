/* Author: Nick Evans

*/
var nick = nick || {};
nick = {
	// universal, device independent behaviours
	behaviours : function(){       
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
