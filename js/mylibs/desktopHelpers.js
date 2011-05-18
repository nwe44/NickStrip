// header scroll
nick.desktopBehaviours = function(){
	$(window).bind("scroll",function(){nick.headerScroll.init($('header'), 100)});
	$(window).bind("resize",function(){nick.headerScroll.init($('header'), 100)});
}


nick.headerScroll = {
	settings : {
		one: 1,
		two: 'other'
	},
	init : function($header, headerHeight){
		var winHeight = $(window).height()
		var inPort = $(window).scrollTop() < winHeight - headerHeight;
		if($header.height() > headerHeight || $(window).scrollTop() < winHeight -200){
			var percentage = $(window).scrollTop() > 1 ? 100 - (100 * ($(window).scrollTop() / winHeight )) : 100;
			$header.css('height', percentage + "%");
			
			$header.css('font-size', $header.height()/4 + "px").css('line-height', $header.height() + "px");
			$('.head .slideshow:hidden').groupedCrossFader('startAuto').fadeIn();
			$('.head').removeClass('head-top');
		}else{
			$header.css('height', headerHeight + "px");
			$header.css('font-size', "24px").css('line-height', headerHeight + "px");
			$('.head .slideshow').groupedCrossFader('pauseAuto').fadeOut();
			$('.head').addClass('head-top');
		}
	}
}