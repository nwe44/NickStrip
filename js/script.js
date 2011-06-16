/* Author: Nick Evans

*/
var nick = nick || {};
nick = {
	settings : {
		mainMessageHeight : $(window).height()
	},
	// universal, device independent behaviours
	behaviours : function(){       
       $('body').removeClass('loading');
      // slideshows
       $('.slideshow').groupedCrossFader();
       
       $('#mainMessage span').css('lineHeight', nick.settings.mainMessageHeight + "px").css('fontSize', nick.settings.mainMessageHeight);
       $(window).resize(function () {
       nick.settings.mainMessageHeight = $(window).height();
        $('#mainMessage span').css('lineHeight', nick.settings.mainMessageHeight + "px").css('fontSize', nick.settings.mainMessageHeight)
       });
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
