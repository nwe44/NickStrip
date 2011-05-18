/*
 * MBP - Mobile boilerplate helper functions
 */
(function(document){

window.MBP = window.MBP || {}; 

// Fix for iPhone viewport scale bug 
// http://www.blog.highub.com/mobile-2/a-fix-for-iphone-viewport-scale-bug/

MBP.viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]');
MBP.ua = navigator.userAgent;

MBP.scaleFix = function () {
  if (MBP.viewportmeta && /iPhone|iPad/.test(MBP.ua) && !/Opera Mini/.test(MBP.ua)) {
    MBP.viewportmeta.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
    document.addEventListener("gesturestart", MBP.gestureStart, false);
  }
};
MBP.gestureStart = function () {
    MBP.viewportmeta.content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
};


// Hide URL Bar for iOS
// http://remysharp.com/2010/08/05/doing-it-right-skipping-the-iphone-url-bar/

MBP.hideUrlBar = function () {
    /iPhone/.test(MBP.ua) && !pageYOffset && !location.hash && setTimeout(function () {
      window.scrollTo(0, 1);
    }, 1000);
};


// Fast Buttons - read wiki below before using
// https://github.com/shichuan/mobile-html5-boilerplate/wiki/JavaScript-Helper

MBP.fastButton = function (element, handler) {
    this.element = element;
    this.handler = handler;
    if (element.addEventListener) {
      element.addEventListener('touchstart', this, false);
      element.addEventListener('click', this, false);
    }
};

MBP.fastButton.prototype.handleEvent = function(event) {
    switch (event.type) {
        case 'touchstart': this.onTouchStart(event); break;
        case 'touchmove': this.onTouchMove(event); break;
        case 'touchend': this.onClick(event); break;
        case 'click': this.onClick(event); break;
    }
};

MBP.fastButton.prototype.onTouchStart = function(event) {
    event.stopPropagation();
    this.element.addEventListener('touchend', this, false);
    document.body.addEventListener('touchmove', this, false);
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.element.style.backgroundColor = "rgba(0,0,0,.7)";
};

MBP.fastButton.prototype.onTouchMove = function(event) {
    if(Math.abs(event.touches[0].clientX - this.startX) > 10 || Math.abs(event.touches[0].clientY - this.startY) > 10) {
        this.reset();
    }
};

MBP.fastButton.prototype.onClick = function(event) {
    event.stopPropagation();
    this.reset();
    this.handler(event);
    if(event.type == 'touchend') {
        MBP.preventGhostClick(this.startX, this.startY);
    }
    this.element.style.backgroundColor = "";
};

MBP.fastButton.prototype.reset = function() {
    this.element.removeEventListener('touchend', this, false);
    document.body.removeEventListener('touchmove', this, false);
    this.element.style.backgroundColor = "";
};

MBP.preventGhostClick = function (x, y) {
    MBP.coords.push(x, y);
    window.setTimeout(function (){
        MBP.coords.splice(0, 2);
    }, 2500);
};

MBP.ghostClickHandler = function (event) {
    for(var i = 0, len = MBP.coords.length; i < len; i += 2) {
        var x = MBP.coords[i];
        var y = MBP.coords[i + 1];
        if(Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
};

if (document.addEventListener) {
    document.addEventListener('click', MBP.ghostClickHandler, true);
}
                            
MBP.coords = [];


// iOS Startup Image
// https://github.com/shichuan/mobile-html5-boilerplate/issues#issue/2

MBP.splash = function () {
    var filename = navigator.platform === 'iPad' ? 'h/' : 'l/';
    document.write('<link rel="apple-touch-startup-image" href="/img/' + filename + 'splash.png" />' );
};


// Autogrow
// http://googlecode.blogspot.com/2009/07/gmail-for-mobile-html5-series.html

MBP.autogrow = function (element, lh) {

    function handler(e){
        var newHeight = this.scrollHeight,
            currentHeight = this.clientHeight;
        if (newHeight > currentHeight) {
            this.style.height = newHeight + 3 * textLineHeight + "px";
        }
    }

    var setLineHeight = (lh) ? lh : 12,
        textLineHeight = element.currentStyle ? element.currentStyle.lineHeight : 
                         getComputedStyle(element, null).lineHeight;

    textLineHeight = (textLineHeight.indexOf("px") == -1) ? setLineHeight :
                     parseInt(textLineHeight, 10);

    element.style.overflow = "hidden";
    element.addEventListener ? element.addEventListener('keyup', handler, false) :
                               element.attachEvent('onkeyup', handler);
};

})(document);

nick.touchBehaviours = function(){
	MBP.hideUrlBar();
	nick.scroll.init();
};

nick.scroll = {
	sections: null,
	horizontal_scroll : null,
	section_flip : null,
	prev_section : 0,
	settings : {
		timer: null,
		$header : $('header'),
		winHeight : $(window).height(),
		prev_x : 0,
		prev_y : 0,
	},
	setScrollerWidth : function($children){
		var slugWidth = 0,
			slugItemWidth,
			$slugItem;
		for(var i = 0; i < $children.length; i++) {
			$slugItem = $children.eq(i);
			slugItemWidth =  parseInt($slugItem.outerWidth(true));
			slugWidth += slugItemWidth;
		}
		return slugWidth;
	},
	updateHorizontalScroller : function () {

		if(this.horizontal_scroll == null){
			console.log('was null');
			nick.scroll.horizontal_scroll = new iScroll(nick.scroll.sections[0], {
				hScrollbar: false,
				vScrollbar: false,
				snap:true
			});
		}
		if(this.section_flip != null){
			this.settings.prev_x = this.horizontal_scroll.x;
			this.settings.prev_y = this.horizontal_scroll.y;
			
			if (this.section_flip.currPageY != this.settings.prev_section) {

				this.horizontal_scroll = this.horizontal_scroll.destroy();
				var oldItem = this.sections[this.prev_section].children[0];
				var newItem = this.sections[this.section_flip.currPageY].children[0];
				//oldItem.style.webkitTransitionDuration = '0';
				//oldItem.style.webkitTransform = 'translate3d(' + nick.scroll.settings.prev_x + 'px, ' + nick.scroll.settings.prev_y + 'px, 0)';
	
				this.horizontal_scroll = new iScroll( this.sections[this.section_flip.currPageY], {
					hScrollbar: false,
					vScrollbar: false,
					snap:true
				});
				//$(nick.scroll.settings.horizontal_scroll.scroller).css("-webkit-transform",'100 100').css('border', '1px solid blue').css('-webkit-transform-origin','100 100');
				this.prev_section = this.section_flip.currPageY;
			}
		}
	},
	init : function(){

		this.sections = document.querySelectorAll('.horizontal-carousel-wrapper');
		$(this.sections).each(function(){
			$(this).children().eq(0).width(nick.scroll.setScrollerWidth($(this).children().eq(0).children()))
		});



		this.section_flip = new iScroll('container', {

			hScrollbar: false,
			vScrollbar: true,
			snap: 'section',
			momentum: false,
			onScrollEnd: function(){nick.scroll.updateHorizontalScroller.apply(nick.scroll)}
		});
		
		nick.scroll.horizontal_scroll = new iScroll(nick.scroll.sections[0], {
			hScrollbar: false,
			vScrollbar: false,
			snap:true
		});
		
		this.setupHeader();
		

		
	},


	
	setupHeader : function(){
		if(nick.scroll.settings.$header.height() < nick.scroll.settings.winHeight){
			$('.head').addClass('head-top');
		}else{
			$('.head').removeClass('head-top');		
		}
		
		nick.scroll.checkSize(nick.scroll.settings);
		nick.scroll.settings.timer = setTimeout("nick.scroll.setupHeader()",10);	
	},
	
	checkSize : function(st){
		var $header = st.$header;
		if($header.height() > 100 || -($('#container-liner').offset()).top < st.winHeight -100){
			var percentage = ($('#container-liner').offset()).top < 1 ? 
						100 - (100 * -(($('#container-liner').offset()).top / st.winHeight )) : 100;
			$header.css('height', percentage + "%");
			$('.head .slideshow:hidden').groupedCrossFader('startAuto').fadeIn();
		}else{
			$header.css('height', 100 + "px");
			$('.head .slideshow').groupedCrossFader('pauseAuto').fadeOut();
		}
	},
	end : function(){
		if(nick.scroll.settings.$header.height() < nick.scroll.settings.winHeight){
			$('.head').addClass('head-top');
		}else{
			$('.head').removeClass('head-top');		
		}
		clearTimeout(nick.scroll.settings.timer);
	}
};