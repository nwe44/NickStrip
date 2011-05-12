// header scroll
nick.desktopBehaviours = function(){
	$(window).scroll(function(){nick.headerScroll.init($('header'), 100)});
}


nick.headerScroll = {
	init : function($header, headerHeight){
		var winHeight = $(window).height()
		var inPort = $(window).scrollTop() < winHeight - headerHeight;
		if($header.height() > headerHeight || $(window).scrollTop() < winHeight -200){
			var percentage = $(window).scrollTop() > 1 ? 100 - (100 * ($(window).scrollTop() / winHeight )) : 100;
			$header.css('height', percentage + "%");
			$('.head .slideshow:hidden').groupedCrossFader('startAuto').fadeIn();
			$('.head').removeClass('head-top');
		}else{
			$header.css('height', headerHeight + "px");
			$('.head .slideshow').groupedCrossFader('pauseAuto').fadeOut();
			$('.head').addClass('head-top');
		}
	},
	inViewport : function($object){
		var bottom = $(window).height() + $(window).scrollTop(),
			top = $(window).scrollTop();
		if( bottom <= $object.offset().top && top >= $object.offset().top + $object.height()){
			return false;
		}else{
			return true;
		}
	
		
	}
}