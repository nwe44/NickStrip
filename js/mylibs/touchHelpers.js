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
	var myHeader = new scrollableHeader();
	
	// setting up the horizontal carousels
	myHeader.sections = document.querySelectorAll('.division');
	
	myHeader.init({
		callbacks : {
			lockOffElement : function () {
				$("#mainMessage")
					.css('height', '100px')
					.addClass('main-message-hidden')
					.parent()
					.addClass('division-past');
				$('.head').addClass('head-top');
				$('#section-1 .static-title').removeClass('static-title-obscured');
			},
			onRemoveLockOff : function () {

				$("#mainMessage")
					.css('height', 'auto')
					.removeClass('main-message-hidden')
					.parent()
					.removeClass('division-past');
				$('.head').removeClass('head-top');
				$('#section-1 .static-title').addClass('static-title-obscured');
			},
			onScrollEnd : function (that) {

				if (that.section_flip.currPageY != that.settings.prev_section) {
					var oldItem = that.sections[that.settings.prev_section].children[0],
						newItem = that.sections[that.section_flip.currPageY].children[0];
					var oldDivision = (that.settings.prev_section > that.section_flip.currPageY) ? 'division-future' : 'division-past';
					
					
					// something weird is happening here on multiple scrolls.
					$('.waypoint-active').removeClass('waypoint-active').addClass(oldDivision);
					$(newItem).parent().addClass('waypoint-active').removeClass('division-future division-past');
					console.log($(newItem).attr('class'));

					//oldItem.style.webkitTransitionDuration = '0';
					//oldItem.style.webkitTransform = 'translate3d(' + nick.scroll.settings.prev_x + 'px, ' + nick.scroll.settings.prev_y + 'px, 0)';
/*
		
					this.horizontal_scroll = new iScroll( this.sections[this.section_flip.currPageY], {
						hScrollbar: false,
						vScrollbar: false,
						snap:true
					});
*/
					//$(nick.scroll.settings.horizontal_scroll.scroller).css("-webkit-transform",'100 100').css('border', '1px solid blue').css('-webkit-transform-origin','100 100');
					that.settings.prev_section = that.section_flip.currPageY;
				}

			
			}
		},
		extraElements : ['#section-1 .static-title']
	});
};
