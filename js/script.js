/* Author: Nick Evans

*/
var nick = nick || {};
nick = {
	settings : {
		mainMessageHeight : $(window).height() / 2
	},
	// universal, device independent behaviours
	behaviours : function(){   	
		$('body').removeClass('loading');
		
		$( "#sectionTmpl" ).tmpl( nick.stripContent ).insertAfter( "#section-0" );
		
		// slideshows
		var horizontalSlideController = {};
		$('.horizontal-carousel').carousel({
			slider: '.horizontal-carousel-slider',
			slide: '.horizontal-carousel-slide',
			nextSlide: '.horizontal-carousel-controls-next',
			prevSlide: '.horizontal-carousel-controls-prev',
			speed: 300 // ms.
		}).each(function () { // build the pager // TODO: group these DOM changes to reduce reflows
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
				.append($myController);
				


		});
		
		// size the main message
		$('#mainMessage span').css('lineHeight', nick.settings.mainMessageHeight*2 + "px").css('fontSize', nick.settings.mainMessageHeight);
		$(window).resize(function () {
			nick.settings.mainMessageHeight = $(window).height() / 2;
			$('#mainMessage span').css('lineHeight', nick.settings.mainMessageHeight*2 + "px").css('fontSize', nick.settings.mainMessageHeight);
		});
		
	},
	
	stripContent : [
		// first and last sections are special cases.
		{
			sectionName : 1, 
			headline : "I design websites", 
			callout : "Because blah",
			mainText : "This is the main text",
			images : ['img/work/CUNY.jpg', 'img/work/lineLength.jpg']
		
		},
		{
			sectionName : 2, 
			headline : "I used to design for print", 
			callout : "This is where I learnt to tell stories.",
			mainText : "This is the main text",
			images : ['img/work/CUNY.jpg', 'img/work/lineLength.jpg']
		
		},
		{
			sectionName : 3, 
			headline : "I can code what I design.", 
			callout : "Because I want to know every detail is perfect.",
			mainText : "This is the main text",
			images : ['img/work/CUNY.jpg', 'img/work/lineLength.jpg']
		
		} // first and last sections are special cases.
	]
};

$(document).ready(function() { 
	nick.behaviours();
	yepnope([{
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
/*
    if (Modernizr.backgroundsize) { // this should not be necessary. Build for the best browsers, so make the markup right first
        $('.horizontal-carousel-slide img').each(function () {
            $(this).parent().css('backgroundImage', "url(" + $(this).attr('src') + ')').end().remove();
        });
    }
*/
});
