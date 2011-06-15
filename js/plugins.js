
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

/*!
*	
*				Grouped Cross Fader jQuery Plugin
*				github.com/nwe44/jquery-groupedCrossFader
*
*	Author: 	Nick Evans
*				www.nick-evans.com
*	Version:	0.11
*	
*	This plugin takes an item, groups it's children into slugs that have a smaller 
*	width than the parent and then fades between them. Unlike many carousels, it 
*	does not need to know the width of any of the child items which can be of 
*	arbitrary and differing sizes and does not require any external css to function. 
*	It only adds css classes and values it requires to function.
*	
*	Methods:
*
*		init()		:	initializes the object
*						returns this
*
*		startAuto()	:	begins the auto fading between slugs
*						returns this
*		
*		pauseAuto()	:	temporarily pauses the auto fading
*						returns this
*
*		next()		:	advances to the next slug, or loops to the first
*						returns this
*
*************************************************************************************
*
*	To come in later versions:
*	
*	Ability to add items after initialization
*	Proper destroy function
*	A demo
*
*
*************************************************************************************	
*	Please use and edit as you wish, but a credit would be nice. Thanks.
*	
*/

;(function( $ ){
    var options 
    
	var methods = {
		init : function( options ) { 
			var opts = $.extend({}, $.fn.groupedCrossFader.defaults, options);
			// count the total number of elements
			return this.each(function() {
				var $this = $(this);

	             data = $this.data('groupedCrossFader');
				if ( ! data ) {
					 // If the plugin hasn't been initialized yet
					// get the width of the container
					var cw = $this.width();
					
					// put all elements in to an array, with a separate array item for their width
					var $children = $this.children(),
						slugWidth = 0,
						slugNo = 0,
						noOfSlugs = 0,
						maxHeight = 0;
					
					for(var i = 0; i < $children.length; i++) {
						var $slugItem = $children.eq(i);
						
						// find the current item's width
						var slugItemWidth =  parseInt($slugItem.width());
						var slugItemHeight =  parseInt($slugItem.outerHeight(true));
						if(slugItemHeight > maxHeight)
							maxHeight = slugItemHeight;
							
						// Check to see if this item has a width, if not, we can't use it
						if(!slugItemWidth)
							continue;

						// if adding the new slugItem will push us over then create a new slug
						if(slugWidth + slugItemWidth > cw){

							if(!slugNo){
								$children.slice(slugNo,i).addClass("slug-" + noOfSlugs);
							}else{
								$children.slice(slugNo,i).addClass("slug-" + noOfSlugs).css('opacity', '0');//.hide();
							}
							
							//reset the slug width ready for the new slug
							slugWidth = 0;
							
							// set current slug
							slugNo = i;

							//Create a new slug
							noOfSlugs++;
						}
						
						if(Modernizr.csstransitions){
							var convertedSpeed = opts.transitionSpeed / 1000;
							$slugItem.css('transition', 'opacity ' + convertedSpeed+'s ease-out');
						}
						// add the current item's width to the slug width
						slugWidth += slugItemWidth;	
								
					}
					if(!slugNo){
						$children.slice(slugNo,$children.length).addClass("slug-" + noOfSlugs);
					}else{
						$children.slice(slugNo,$children.length).addClass("slug-" + noOfSlugs).css('opacity', '0').hide();
					}					

					$(this).data('groupedCrossFader', {
					   currentSlugNo : 0,
					   noOfSlugs : noOfSlugs,
					   opts: opts,
					   css3: Modernizr.csstransitions
					});

		          }

		          if(noOfSlugs){ // don't attempt to animate a slide of one.
		          
					methods.startAuto.apply(this);

					if(opts.hoverPause){
						$(this).mouseover(function(){
							methods.pauseAuto.apply(this);
						});

						$(this).mouseout(function(){
							methods.startAuto.apply(this);
						});

					}

		          }
			      
			          
			        
			});
		},
		
		 /**
         * Moves the carousel forwards.
         */
        next: function() {
	       return $(this).each(function(){
				
				var $this = $(this),
					data = $this.data('groupedCrossFader');
					
				// get the current slug
				var currentSlug = $this.find('.slug-' +data.currentSlugNo);
				
				// get the next slug
				var nextSlugNo = (data.currentSlugNo < data.noOfSlugs) ? data.currentSlugNo + 1 : 0;
				var nextSlug = $this.find('.slug-' + nextSlugNo);
				
				// hide the current slug
				currentSlug.each(function(i){
					var that = this;
					if(data.css3){
//						this.timeout = setTimeout( function (i) { console.log(i);}, i * 1000);
						$(this).delay(i * 100).queue(function(){
							$(this).css("opacity", "0").delay(data.opts.transitionSpeed).queue(function(){
								$(this).css('display', 'none');
							});
						});
					}else{
						$(this).delay(i * 100).fadeOut(data.opts.transitionSpeed);
					}
				});
				
				// show the next slug
				nextSlug.delay(currentSlug.length * 100).each(function(i){
					if(data.css3){
						$(this).delay((i *100)+200).css("display", 'block').css("opacity", "1");
					}else{
						$(this).delay(i * 100).fadeIn(data.opts.transitionSpeed);
					}
					
				});
				
				// reset the current Slug
				data.currentSlugNo = nextSlugNo;
				$this.data('groupedCrossFader', data);
				
				//loop
				methods.startAuto.apply(this );
	       });
        },
		/**
         * Starts autoscrolling.
         */
        startAuto: function() {
			return $(this).each(function(){
				var $this = $(this),
					data = $this.data('groupedCrossFader');
				var self = this;
				this.timer = window.setTimeout(function() { methods.next.apply(self); }, data.opts.time);
	       });
        },

        /**
         * Pauses autoscrolling.
         */
        pauseAuto: function() {
	       return $(this).each(function(){
				var $this = $(this),
					data = $this.data('groupedCrossFader');
	            if (this.timer === null) {
	                return;
	            }
	            window.clearTimeout(this.timer);
	            this.timer = null;
            });
        }
	}

  $.fn.groupedCrossFader = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.groupedCrossFader' );
    }
  };

	$.fn.groupedCrossFader.defaults = {
		time: 6000,
		transitionSpeed: 500,
		hoverPause:true
	};
})(jQuery);



(function (window) {
	var sch = function () {},
		scrollableHeader = function () {
        return new sch();
    };

	sch.prototype.settings = {
		$header : null,
		winHeight : null,
		smallestHeight : null,
		inHeaderLockedOff: false,
		fontSize : null,
		one: 1,
		two: 'other'
	};

	sch.prototype.assessHeaderCondition = function () {

		var s = this.settings,
			that = this;

		if (s.$header.height() > s.smallestHeight || $(window).scrollTop() < s.winHeight - 200) {

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
		
			// we only need to lock everything off if it isn't already locked off.
			that.lockOffElement(s.$header);			
			for (var i = 0, numberOfExtras = that.extraElements.length; i < numberOfExtras; i += 1){
				that.lockOffElement($(that.extraElements[i]));
			}
		}

	};
	
	sch.prototype.assessViewPort = function () {

		// if the height hasn't changes, we don't need to do anything
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
		// here's where touch logic would go.
		// maybe
		
		//bind the resize event
		$(window).bind("scroll", function(event){ that.assessHeaderCondition(); });

		$(window).bind("resize",function(event){ that.assessViewPort(); });

		// turn over the engine once to see what's out there.
		this.assessViewPort();
		
	};

	window.scrollableHeader = scrollableHeader;
  
})(window);


