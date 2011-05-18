/* Author: Nick Evans

*/
var nick = nick || {};
nick = {
	// universal, device independent behaviours
	behaviours : function(){

		// header
		yepnope({
                test: Modernizr.backgroundsize,
                nope: ['js/libs/jquery.imgCenter.minified.js'],
                callback: function (url, result, key) {
                    $('.header .head').imgCenter();
                    $('.slideshow li img').imgCenter();
                }
        });

       if (Modernizr.backgroundsize) {
           $('.head .title img, .slideshow li img').each(function(){
	           $(this).parent().css('backgroundImage', "url(" + $(this).attr('src') + ')').end().remove();
           });
       }
       $.fn.waypoint.defaults.offset = "75%";
       $('section').each(function(){
			$(this).waypoint(function() {
			   $.waypoints().removeClass('waypoint-active');
			   $(this).addClass('waypoint-active');
			});
       });
       
       // slideshows
       $('.slideshow').groupedCrossFader();
       
       $('body').removeClass('loading');
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
