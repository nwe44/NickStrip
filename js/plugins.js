
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
      arguments.callee = arguments.callee.caller;
      console.log( Array.prototype.slice.call(arguments) );
  }
};
// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();)b[a]=b[a]||c})(window.console=window.console||{});


// place any jQuery/helper plugins in here, instead of separate, slower script files.

/*! Copyright (c) 2010 Burin Asavesna (http://helloburin.com)
 * Licensed under the MIT License (LICENSE.txt).
 */
(function($) {
    var div = document.createElement('div'),
        divStyle = div.style,
        support = $.support,
        props = "Property Duration TimingFunction".split(" ");

    support.transition =
        divStyle.MozTransition     === ''? 'MozTransition'    :
        (divStyle.MsTransition     === ''? 'MsTransition'     :
        (divStyle.WebkitTransition === ''? 'WebkitTransition' :
        (divStyle.OTransition      === ''? 'OTransition'      :
        (divStyle.transition       === ''? 'Transition'       :
        false))));

    div = null;

    if ( support.transition && support.transition !== "Transition" ) {
        $.cssHooks.transition = {
            get: function( elem, computed, extra ) {
                return $.map(props, function( prop, i ) {
                    return $.css(elem, support.transition + prop);
                }).join(" ");
            },
            set: function( elem, value ) {
                elem.style[ support.transition ] = value;
            }
        };

        $.each(props, function( i, prop ) {
            $.cssHooks[ "transition" + prop ] = {
                get: function( elem, computed, extra ) {
                    return $.css(elem, support.transition + prop);
                },
                set: function( elem, value ) {
                    elem.style[ support.transition + prop ] = value;
                }
            };
        });

    }

})(jQuery);

// header sizing module
(function (window) {
	var ua = navigator.userAgent.toLowerCase();
  isWebkit = !!ua.match(/applewebkit/i);
  var supportsTouch = false;
  try {
    document.createEvent("TouchEvent");
    supportsTouch = true;
  } catch (e) {}
  
	var sch = function () {},
		tsch = function () {},
		scrollableHeader = function() {
			if (supportsTouch && isWebkit) {
				return new tsch();
			} else {
				return new sch();
			}
		};

	sch.prototype.settings = {
		$header : null,
		winHeight : null,
		smallestHeight : null,
		inHeaderLockedOff: false,
		fontSize : null,
		two: 'other',
		
		// non-fixed positioning settings
		referencePointSelector : null, //'#container-liner'

		// section flip settings
		// possibly redundant
		sections: null,	
		horizontal_scroll : null,
		section_flip : null,
		prev_section : 0,
		prev_x : 0,
		prev_y : 0
		
	};
	sch.prototype.getScrollPosition = function (){
		return $(window).scrollTop();
	};
	sch.prototype.assessHeaderCondition = function () {

		var s = this.settings,
			that = this;

		if (s.$header.height() > s.smallestHeight || that.getScrollPosition() < s.winHeight - 200) {

			// resize the header
			that.resizeElement(s.$header);

			// resize any related elements
			for (var i = 0, numberOfExtras = that.extraElements.length; i < numberOfExtras; i += 1){
				that.resizeElement($(that.extraElements[i]));
			}
			 if (s.inHeaderLockedOff){

				// remove the flag locking off the header
				this.settings.inHeaderLockedOff = false;
				
				if (typeof(this.callbacks.onRemoveLockOff) == "function") {
					this.callbacks.onRemoveLockOff();
				}		 
			 }


		}else if (! s.inHeaderLockedOff){
			console.log('locking off header');
			// we only need to lock everything off if it isn't already locked off.
			that.lockOffElement(s.$header);			
			for (var i = 0, numberOfExtras = that.extraElements.length; i < numberOfExtras; i += 1){
				that.lockOffElement($(that.extraElements[i]));
			}
		}

	};
	
	sch.prototype.assessViewPort = function () {

		// if the height hasn't changed, we don't need to do anything
		// this.settings.winHeight == null on first run, so this returns true in that case.
		if (this.settings.winHeight != $(window).height() ) {

			//it has, so lets update our memo
			this.settings.winHeight = $(window).height();

			// and see how it has effected our header			
			this.assessHeaderCondition();

		}	
	};
	
	sch.prototype.resizeElement = function ($element) {
		var s = this.settings;

		var percentage = $(window).scrollTop() > 1 ? 100 - (100 * ($(window).scrollTop() / s.winHeight )) : 100;

		$element.css('height', percentage + "%");
		
		$element.css('font-size', $element.height()/4 + "px").css('line-height', $element.height() + "px");

		if (typeof(this.callbacks.resizeHeader) == "function") {
			this.callbacks.resizeHeader();
		}
	};
	
	sch.prototype.lockOffElement = function ($element) {

		var s = this.settings;
		
		$element.css('height', s.smallestHeight + "px");
		
		$element.css('font-size', s.fontSize + "px").css('line-height', s.smallestHeight + "px");
		
		this.settings.inHeaderLockedOff = true;	
		
		if (typeof(this.callbacks.lockOffElement) == "function") {
			this.callbacks.lockOffElement();
		}
	};
	
	sch.prototype.init = function (options) {

		//setup the settings
		this.settings.$header = options.header || $('header');
		this.settings.smallestHeight = options.smallestHeight || 100;
		this.settings.fontSize = options.fontSize || 24;
		this.callbacks = options.callbacks || {};
		this.extraElements = options.extraElements || [];
		var that = this;
		
		//bind the resize event
		$(window).bind("scroll", function(event){ that.assessHeaderCondition(); });

		$(window).bind("resize",function(event){ that.assessViewPort(); });

		// turn over the engine once to see what's out there.
		this.assessViewPort();
		
	};
	
	// touch events
	tsch.prototype = new sch();
	
	tsch.prototype.resizeElement = function ($element) {
		var s = this.settings,
			that = this,
			myScrollPosition = that.getScrollPosition();
			percentage = (myScrollPosition > 1) ? 100 - (100 * -((-myScrollPosition / s.winHeight ))) : 100,
			$newHeaderHeight = s.$header.height(),
			$newHeaderTitle = s.$header.find('h1').clone( true );

			// doing dom changes to an off line element saves reflows
			$newHeaderTitle
				.css('font-size', $newHeaderHeight/4 + "px")
				.css('line-height', $newHeaderHeight + "px");
			s.$header.css('height', percentage + "%");
			s.$header.find('h1').replaceWith($newHeaderTitle);
	};
	tsch.prototype.getScrollPosition = function (){
		var s = this.settings;
		return -$(s.referencePointSelector).offset().top;
	};
	tsch.prototype.init = function (options) {

		//setup the settings
		this.settings.$header = options.header || $('header');
		this.settings.smallestHeight = options.smallestHeight || 100;
		this.settings.fontSize = options.fontSize || 24;
		
		this.settings.referencePointSelector = options.referencePointSelector || '#container-liner';

		this.callbacks = options.callbacks || {};
		this.extraElements = options.extraElements || [];
		var that = this;
		
		// this is the main section scroller, running from top to bottom
		this.section_flip = new iScroll('container', {
			hScrollbar: false,
			vScrollbar: true,
			snap: 'section',
			momentum: false,
			onScrollMove: function(event){ that.assessHeaderCondition(); },
			onScrollEnd: function(event){that.onScrollEnd();}
		});

		$(window).bind("resize",function(event){ that.assessViewPort(); });

		// turn over the engine once to see what's out there.
		this.assessViewPort();
		
	};
	tsch.prototype.onScrollEndLoop = function(that){

			var heightBeforeChecking = that.settings.$header.height();

			that.assessHeaderCondition();

			if(heightBeforeChecking != that.settings.$header.height() ){
				that.onScrollEnd();
			}	
	};
	tsch.prototype.onScrollEnd = function(){
		var that = this;
		// create a loop to discover if the header has reached it's destination size yet.
		// if the size doesn't change on checking, then it has.
		this.timer = setTimeout(function(){that.onScrollEndLoop(that)}, 10);
		if (typeof(this.callbacks.onScrollEnd) == "function") {
			this.callbacks.onScrollEnd(this);
		}	
	};


	window.scrollableHeader = scrollableHeader;
  
})(window);

(function($){
	$.fn.carousel = function(config) {
		var defaults = {
			slider: '.slider',
			slide: '.slide',
			prevSlide: '.prev',
			nextSlide: '.next',
			speed: 500
		},
		opt = $.extend(defaults, config),
		dStyle = document.body.style,
		transitionSupport = dStyle.webkitTransition !== undefined || 
				    dStyle.mozTransition !== undefined ||
				    dStyle.msTransition !== undefined ||
				    dStyle.oTransition !== undefined ||
				    dStyle.transition !== undefined,
				
		move = function($slider, dir) {
			var leftmargin = $slider.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1),
				$slide = $slider.find(opt.slide),
				constrain = ( dir === 'prev' ? leftmargin != 0 : -leftmargin != ($slide.length - 1) * 100 ),
				$target = $( '[href="#' + $slider.attr('id') + '"]');

			if (!$slider.is(":animated") && constrain ) {
				leftmargin = ( dir === 'prev' ) ? leftmargin + 100 : leftmargin - 100;
				
				if(transitionSupport) {
					$slider.css('marginLeft', leftmargin + "%");
				} else {
					$slider.animate({ marginLeft: leftmargin + "%" }, opt.speed);
				}
				
				$target.removeClass('disabled');
				switch( leftmargin ) {
					case ( -($slide.length - 1) * 100 ):
						$target.filter(opt.nextSlide).addClass('disabled');
						break;
					case 0:
						$target.filter(opt.prevSlide).addClass('disabled');
						break;
				}
			}
		};

		$(opt.nextSlide + ',' + opt.prevSlide).click(function(e) {
			var $el = $(this),
				link = $el.attr('href'),
				dir = ( $el.is(opt.prevSlide) ) ? 'prev' : 'next',
				$slider = $(link);

				if ( $el.is('.disabled') ) { 
					return false;
				}

				move($slider, dir);
				
			e.preventDefault();
		});
		$(opt.prevSlide).addClass('disabled');

		//swipes trigger move left/right
		$(this).live( "swipe", function(e, ui){
			var $slider = $(this).find( opt.slider ),
				dir = ( ui.direction === "left" ) ? 'next' : 'prev';

			move($slider, dir);
		});

		return this.each(function() {
			var $wrap = $(this),
				$slider = $wrap.find(opt.slider),
				$slide = $wrap.find(opt.slide),			
				slidenum = $slide.length,
				speed = opt.speed / 1000;

			$wrap.css({
				overflow: "hidden"
			});
			
			$slider.css({
				marginLeft: "0px",
				float: "left",
				width: 100 * slidenum + "%",
				"-webkit-transition": "margin-left " + speed + "s ease",
				"-moz-transition": "margin-left " + speed + "s ease",
				"-ms-transition": "margin-left " + speed + "s ease",
				"-o-transition": "margin-left " + speed + "s ease",
				"transition": "margin-left " + speed + "s ease"
			});	
				    
			$slide.css({
				float: "left",
				width: (100 / slidenum) + "%"				
			});		
		});
	};
		
	//modified swipe events from jQuery Mobile
	// also handles swipeleft, swiperight
	$.event.special.swipe = {
		setup: function() {
			var $el = $(this);
			
			$el.bind("touchstart", function(e) {
					var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
						start = {
							time: (new Date).getTime(),
							coords: [ data.pageX, data.pageY ],
							origin: $(e.target)
						},
						stop,
						moveHandler = function(e) {
							if(!start) {
								return;
							}
						
							var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
							stop = {
									time: (new Date).getTime(),
									coords: [ data.pageX, data.pageY ]
							};
						
							// prevent scrolling
							if (Math.abs(start.coords[0] - stop.coords[0]) > 10) {
								e.preventDefault();
							}
						};
					
					$el.bind("touchmove", moveHandler)
						.one("touchend", function(e) {
							$el.unbind("touchmove", moveHandler);
							if (start && stop) {
								if (stop.time - start.time < 1000 && 
										Math.abs(start.coords[0] - stop.coords[0]) > 30 &&
										Math.abs(start.coords[1] - stop.coords[1]) < 75) {
										var left = start.coords[0] > stop.coords[0];
									start.origin
										.trigger("swipe", {direction: left ? "left" : "right"})
										.trigger(left ? "swipeleft" : "swiperight" );
								}
							}
							start = stop = undefined;
						});
			});
		}
	};
})(jQuery);
