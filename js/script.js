/* Author: Nick Evans

*/
var nick = nick || {};
nick = {
	settings : {
		scaleFactor : ( Modernizr.touch) ? ((window.innerHeight > window.innerWidth) ? 4 : 2.5) : 2,
		mainMessageHeight : null
	},
	// universal, device independent behaviours
	behaviours : function(){   	
		nick.settings.mainMessageHeight = parseFloat($(window).height() / this.settings.scaleFactor);
		$('body').removeClass('loading');
		
		$( "#sectionTmpl" ).tmpl( nick.stripContent ).insertAfter( "#section-0" );	

		// slideshows
		$('.horizontal-carousel-with-content').carousel({
			slider: '.horizontal-carousel-slider',
			slide: '.horizontal-carousel-slide',
			pagination: true,
			nextSlide: '.horizontal-carousel-controls-next',
			prevSlide: '.horizontal-carousel-controls-prev',
			speed: 300 // ms.
		});
		
		/*
.each(function () { // build the pager 
				var $myController = $('<ul/>', {
						className: 'horizontal-carousel-pager'
					});
				$(this).find('.horizontal-carousel-slide')
				.each(function (i) {
					var $pageItem = $('<li/>', {
						className: 'horizontal-carousel-pager-item'
					});
					$pageItem  = $pageItem.append($('<a/>', {
						className: 'horizontal-carousel-pager-item-link ir main-sprite',
						text: i
					}));
					$myController.append($pageItem);
				})
				.parent()
				.parent()
				.prepend($myController);

		});
*/

		// size the main message
		$('#mainMessage span').css('lineHeight', nick.settings.mainMessageHeight * this.settings.scaleFactor + "px").css('fontSize', nick.settings.mainMessageHeight);
		$(window).resize(function () {
			nick.settings.mainMessageHeight = $(window).height() / nick.settings.scaleFactor;
			$('#mainMessage span').css('lineHeight', nick.settings.mainMessageHeight * nick.settings.scaleFactor + "px").css('fontSize', nick.settings.mainMessageHeight);
		});
	}
};

$(document).ready(function() { 

	nick.behaviours();
	yepnope([{
		test: Modernizr.touch,
		yep: ['js/libs/iscroll-min.js','js/helper/touchHelpers.js'],
		nope: ['js/helper/desktopHelpers.js'],
		callback: function (url, result, key) {
			if(result){
				if(url === "js/helper/touchHelpers.js"){
			   		nick.touchBehaviours();			
				}
			}else{
			   nick.desktopBehaviours();			   
			}
		}
	},
	{
        test: Modernizr.backgroundsize,
        nope: ['js/libs/jquery.imgCenter.minified.js'],
        callback: function (url, result, key) {
            $('.slider .slider-item img').each(function () {
                $(this).imgCenter();
            });
        }
    }
	]);
    if (Modernizr.backgroundsize) { // this should not be necessary. Build for the best browsers, so make the markup right first
        $('.horizontal-carousel-slide img').each(function () {
        	
            $(this).parent().parent().css('backgroundImage', "url(" + $(this).attr('src') + ')');//.end().remove();
            $(this).remove();
        });
    }
});
