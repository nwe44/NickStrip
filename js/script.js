/* Author: Nick Evans

*/

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
       
       // slideshows
       $('.slideshow').groupedCrossFader();
       
       $('body').removeClass('loading');
	},	
}

$(document).ready(function() { 
	nick.behaviours();
	yepnope({
        test: Modernizr.touch,
        yep: ['js/libs/iscroll-min.js','js/myLibs/touchHelpers.js'],
        nope: ['js/myLibs/desktopHelpers.js'],
        callback: function (url, result, key) {
			if(result){
				if(url === "js/myLibs/touchHelpers.js"){
		           nick.touchBehaviours()			
				}
			}else{
			   nick.desktopBehaviours();			   
			}
        }
    });
});
