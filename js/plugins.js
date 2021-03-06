/* 
* Plugins
*/
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


/*!
 * jQuery Templates Plugin 1.0.0pre
 * http://github.com/jquery/jquery-tmpl
 * Requires jQuery 1.4.2
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */
(function( jQuery, undefined ){
	var oldManip = jQuery.fn.domManip, tmplItmAtt = "_tmplitem", htmlExpr = /^[^<]*(<[\w\W]+>)[^>]*$|\{\{\! /,
		newTmplItems = {}, wrappedItems = {}, appendToTmplItems, topTmplItem = { key: 0, data: {} }, itemKey = 0, cloneIndex = 0, stack = [];

	function newTmplItem( options, parentItem, fn, data ) {
		// Returns a template item data structure for a new rendered instance of a template (a 'template item').
		// The content field is a hierarchical array of strings and nested items (to be
		// removed and replaced by nodes field of dom elements, once inserted in DOM).
		var newItem = {
			data: data || (data === 0 || data === false) ? data : (parentItem ? parentItem.data : {}),
			_wrap: parentItem ? parentItem._wrap : null,
			tmpl: null,
			parent: parentItem || null,
			nodes: [],
			calls: tiCalls,
			nest: tiNest,
			wrap: tiWrap,
			html: tiHtml,
			update: tiUpdate
		};
		if ( options ) {
			jQuery.extend( newItem, options, { nodes: [], parent: parentItem });
		}
		if ( fn ) {
			// Build the hierarchical content to be used during insertion into DOM
			newItem.tmpl = fn;
			newItem._ctnt = newItem._ctnt || newItem.tmpl( jQuery, newItem );
			newItem.key = ++itemKey;
			// Keep track of new template item, until it is stored as jQuery Data on DOM element
			(stack.length ? wrappedItems : newTmplItems)[itemKey] = newItem;
		}
		return newItem;
	}

	// Override appendTo etc., in order to provide support for targeting multiple elements. (This code would disappear if integrated in jquery core).
	jQuery.each({
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var ret = [], insert = jQuery( selector ), elems, i, l, tmplItems,
				parent = this.length === 1 && this[0].parentNode;

			appendToTmplItems = newTmplItems || {};
			if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
				insert[ original ]( this[0] );
				ret = this;
			} else {
				for ( i = 0, l = insert.length; i < l; i++ ) {
					cloneIndex = i;
					elems = (i > 0 ? this.clone(true) : this).get();
					jQuery( insert[i] )[ original ]( elems );
					ret = ret.concat( elems );
				}
				cloneIndex = 0;
				ret = this.pushStack( ret, name, insert.selector );
			}
			tmplItems = appendToTmplItems;
			appendToTmplItems = null;
			jQuery.tmpl.complete( tmplItems );
			return ret;
		};
	});

	jQuery.fn.extend({
		// Use first wrapped element as template markup.
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( data, options, parentItem ) {
			return jQuery.tmpl( this[0], data, options, parentItem );
		},

		// Find which rendered template item the first wrapped DOM element belongs to
		tmplItem: function() {
			return jQuery.tmplItem( this[0] );
		},

		// Consider the first wrapped element as a template declaration, and get the compiled template or store it as a named template.
		template: function( name ) {
			return jQuery.template( name, this[0] );
		},

		domManip: function( args, table, callback, options ) {
			if ( args[0] && jQuery.isArray( args[0] )) {
				var dmArgs = jQuery.makeArray( arguments ), elems = args[0], elemsLength = elems.length, i = 0, tmplItem;
				while ( i < elemsLength && !(tmplItem = jQuery.data( elems[i++], "tmplItem" ))) {}
				if ( tmplItem && cloneIndex ) {
					dmArgs[2] = function( fragClone ) {
						// Handler called by oldManip when rendered template has been inserted into DOM.
						jQuery.tmpl.afterManip( this, fragClone, callback );
					};
				}
				oldManip.apply( this, dmArgs );
			} else {
				oldManip.apply( this, arguments );
			}
			cloneIndex = 0;
			if ( !appendToTmplItems ) {
				jQuery.tmpl.complete( newTmplItems );
			}
			return this;
		}
	});

	jQuery.extend({
		// Return wrapped set of template items, obtained by rendering template against data.
		tmpl: function( tmpl, data, options, parentItem ) {
			var ret, topLevel = !parentItem;
			if ( topLevel ) {
				// This is a top-level tmpl call (not from a nested template using {{tmpl}})
				parentItem = topTmplItem;
				tmpl = jQuery.template[tmpl] || jQuery.template( null, tmpl );
				wrappedItems = {}; // Any wrapped items will be rebuilt, since this is top level
			} else if ( !tmpl ) {
				// The template item is already associated with DOM - this is a refresh.
				// Re-evaluate rendered template for the parentItem
				tmpl = parentItem.tmpl;
				newTmplItems[parentItem.key] = parentItem;
				parentItem.nodes = [];
				if ( parentItem.wrapped ) {
					updateWrapped( parentItem, parentItem.wrapped );
				}
				// Rebuild, without creating a new template item
				return jQuery( build( parentItem, null, parentItem.tmpl( jQuery, parentItem ) ));
			}
			if ( !tmpl ) {
				return []; // Could throw...
			}
			if ( typeof data === "function" ) {
				data = data.call( parentItem || {} );
			}
			if ( options && options.wrapped ) {
				updateWrapped( options, options.wrapped );
			}
			ret = jQuery.isArray( data ) ?
				jQuery.map( data, function( dataItem ) {
					return dataItem ? newTmplItem( options, parentItem, tmpl, dataItem ) : null;
				}) :
				[ newTmplItem( options, parentItem, tmpl, data ) ];
			return topLevel ? jQuery( build( parentItem, null, ret ) ) : ret;
		},

		// Return rendered template item for an element.
		tmplItem: function( elem ) {
			var tmplItem;
			if ( elem instanceof jQuery ) {
				elem = elem[0];
			}
			while ( elem && elem.nodeType === 1 && !(tmplItem = jQuery.data( elem, "tmplItem" )) && (elem = elem.parentNode) ) {}
			return tmplItem || topTmplItem;
		},

		// Set:
		// Use $.template( name, tmpl ) to cache a named template,
		// where tmpl is a template string, a script element or a jQuery instance wrapping a script element, etc.
		// Use $( "selector" ).template( name ) to provide access by name to a script block template declaration.

		// Get:
		// Use $.template( name ) to access a cached template.
		// Also $( selectorToScriptBlock ).template(), or $.template( null, templateString )
		// will return the compiled template, without adding a name reference.
		// If templateString includes at least one HTML tag, $.template( templateString ) is equivalent
		// to $.template( null, templateString )
		template: function( name, tmpl ) {
			if (tmpl) {
				// Compile template and associate with name
				if ( typeof tmpl === "string" ) {
					// This is an HTML string being passed directly in.
					tmpl = buildTmplFn( tmpl );
				} else if ( tmpl instanceof jQuery ) {
					tmpl = tmpl[0] || {};
				}
				if ( tmpl.nodeType ) {
					// If this is a template block, use cached copy, or generate tmpl function and cache.
					tmpl = jQuery.data( tmpl, "tmpl" ) || jQuery.data( tmpl, "tmpl", buildTmplFn( tmpl.innerHTML ));
					// Issue: In IE, if the container element is not a script block, the innerHTML will remove quotes from attribute values whenever the value does not include white space.
					// This means that foo="${x}" will not work if the value of x includes white space: foo="${x}" -> foo=value of x.
					// To correct this, include space in tag: foo="${ x }" -> foo="value of x"
				}
				return typeof name === "string" ? (jQuery.template[name] = tmpl) : tmpl;
			}
			// Return named compiled template
			return name ? (typeof name !== "string" ? jQuery.template( null, name ):
				(jQuery.template[name] ||
					// If not in map, and not containing at least on HTML tag, treat as a selector.
					// (If integrated with core, use quickExpr.exec)
					jQuery.template( null, htmlExpr.test( name ) ? name : jQuery( name )))) : null;
		},

		encode: function( text ) {
			// Do HTML encoding replacing < > & and ' and " by corresponding entities.
			return ("" + text).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
		}
	});

	jQuery.extend( jQuery.tmpl, {
		tag: {
			"tmpl": {
				_default: { $2: "null" },
				open: "if($notnull_1){__=__.concat($item.nest($1,$2));}"
				// tmpl target parameter can be of type function, so use $1, not $1a (so not auto detection of functions)
				// This means that {{tmpl foo}} treats foo as a template (which IS a function).
				// Explicit parens can be used if foo is a function that returns a template: {{tmpl foo()}}.
			},
			"wrap": {
				_default: { $2: "null" },
				open: "$item.calls(__,$1,$2);__=[];",
				close: "call=$item.calls();__=call._.concat($item.wrap(call,__));"
			},
			"each": {
				_default: { $2: "$index, $value" },
				open: "if($notnull_1){$.each($1a,function($2){with(this){",
				close: "}});}"
			},
			"if": {
				open: "if(($notnull_1) && $1a){",
				close: "}"
			},
			"else": {
				_default: { $1: "true" },
				open: "}else if(($notnull_1) && $1a){"
			},
			"html": {
				// Unecoded expression evaluation.
				open: "if($notnull_1){__.push($1a);}"
			},
			"=": {
				// Encoded expression evaluation. Abbreviated form is ${}.
				_default: { $1: "$data" },
				open: "if($notnull_1){__.push($.encode($1a));}"
			},
			"!": {
				// Comment tag. Skipped by parser
				open: ""
			}
		},

		// This stub can be overridden, e.g. in jquery.tmplPlus for providing rendered events
		complete: function( items ) {
			newTmplItems = {};
		},

		// Call this from code which overrides domManip, or equivalent
		// Manage cloning/storing template items etc.
		afterManip: function afterManip( elem, fragClone, callback ) {
			// Provides cloned fragment ready for fixup prior to and after insertion into DOM
			var content = fragClone.nodeType === 11 ?
				jQuery.makeArray(fragClone.childNodes) :
				fragClone.nodeType === 1 ? [fragClone] : [];

			// Return fragment to original caller (e.g. append) for DOM insertion
			callback.call( elem, fragClone );

			// Fragment has been inserted:- Add inserted nodes to tmplItem data structure. Replace inserted element annotations by jQuery.data.
			storeTmplItems( content );
			cloneIndex++;
		}
	});

	//========================== Private helper functions, used by code above ==========================

	function build( tmplItem, nested, content ) {
		// Convert hierarchical content into flat string array
		// and finally return array of fragments ready for DOM insertion
		var frag, ret = content ? jQuery.map( content, function( item ) {
			return (typeof item === "string") ?
				// Insert template item annotations, to be converted to jQuery.data( "tmplItem" ) when elems are inserted into DOM.
				(tmplItem.key ? item.replace( /(<\w+)(?=[\s>])(?![^>]*_tmplitem)([^>]*)/g, "$1 " + tmplItmAtt + "=\"" + tmplItem.key + "\" $2" ) : item) :
				// This is a child template item. Build nested template.
				build( item, tmplItem, item._ctnt );
		}) :
		// If content is not defined, insert tmplItem directly. Not a template item. May be a string, or a string array, e.g. from {{html $item.html()}}.
		tmplItem;
		if ( nested ) {
			return ret;
		}

		// top-level template
		ret = ret.join("");

		// Support templates which have initial or final text nodes, or consist only of text
		// Also support HTML entities within the HTML markup.
		ret.replace( /^\s*([^<\s][^<]*)?(<[\w\W]+>)([^>]*[^>\s])?\s*$/, function( all, before, middle, after) {
			frag = jQuery( middle ).get();

			storeTmplItems( frag );
			if ( before ) {
				frag = unencode( before ).concat(frag);
			}
			if ( after ) {
				frag = frag.concat(unencode( after ));
			}
		});
		return frag ? frag : unencode( ret );
	}

	function unencode( text ) {
		// Use createElement, since createTextNode will not render HTML entities correctly
		var el = document.createElement( "div" );
		el.innerHTML = text;
		return jQuery.makeArray(el.childNodes);
	}

	// Generate a reusable function that will serve to render a template against data
	function buildTmplFn( markup ) {
		return new Function("jQuery","$item",
			// Use the variable __ to hold a string array while building the compiled template. (See https://github.com/jquery/jquery-tmpl/issues#issue/10).
			"var $=jQuery,call,__=[],$data=$item.data;" +

			// Introduce the data as local variables using with(){}
			"with($data){__.push('" +

			// Convert the template into pure JavaScript
			jQuery.trim(markup)
				.replace( /([\\'])/g, "\\$1" )
				.replace( /[\r\t\n]/g, " " )
				.replace( /\$\{([^\}]*)\}/g, "{{= $1}}" )
				.replace( /\{\{(\/?)(\w+|.)(?:\(((?:[^\}]|\}(?!\}))*?)?\))?(?:\s+(.*?)?)?(\(((?:[^\}]|\}(?!\}))*?)\))?\s*\}\}/g,
				function( all, slash, type, fnargs, target, parens, args ) {
					var tag = jQuery.tmpl.tag[ type ], def, expr, exprAutoFnDetect;
					if ( !tag ) {
						throw "Unknown template tag: " + type;
					}
					def = tag._default || [];
					if ( parens && !/\w$/.test(target)) {
						target += parens;
						parens = "";
					}
					if ( target ) {
						target = unescape( target );
						args = args ? ("," + unescape( args ) + ")") : (parens ? ")" : "");
						// Support for target being things like a.toLowerCase();
						// In that case don't call with template item as 'this' pointer. Just evaluate...
						expr = parens ? (target.indexOf(".") > -1 ? target + unescape( parens ) : ("(" + target + ").call($item" + args)) : target;
						exprAutoFnDetect = parens ? expr : "(typeof(" + target + ")==='function'?(" + target + ").call($item):(" + target + "))";
					} else {
						exprAutoFnDetect = expr = def.$1 || "null";
					}
					fnargs = unescape( fnargs );
					return "');" +
						tag[ slash ? "close" : "open" ]
							.split( "$notnull_1" ).join( target ? "typeof(" + target + ")!=='undefined' && (" + target + ")!=null" : "true" )
							.split( "$1a" ).join( exprAutoFnDetect )
							.split( "$1" ).join( expr )
							.split( "$2" ).join( fnargs || def.$2 || "" ) +
						"__.push('";
				}) +
			"');}return __;"
		);
	}
	function updateWrapped( options, wrapped ) {
		// Build the wrapped content.
		options._wrap = build( options, true,
			// Suport imperative scenario in which options.wrapped can be set to a selector or an HTML string.
			jQuery.isArray( wrapped ) ? wrapped : [htmlExpr.test( wrapped ) ? wrapped : jQuery( wrapped ).html()]
		).join("");
	}

	function unescape( args ) {
		return args ? args.replace( /\\'/g, "'").replace(/\\\\/g, "\\" ) : null;
	}
	function outerHtml( elem ) {
		var div = document.createElement("div");
		div.appendChild( elem.cloneNode(true) );
		return div.innerHTML;
	}

	// Store template items in jQuery.data(), ensuring a unique tmplItem data data structure for each rendered template instance.
	function storeTmplItems( content ) {
		var keySuffix = "_" + cloneIndex, elem, elems, newClonedItems = {}, i, l, m;
		for ( i = 0, l = content.length; i < l; i++ ) {
			if ( (elem = content[i]).nodeType !== 1 ) {
				continue;
			}
			elems = elem.getElementsByTagName("*");
			for ( m = elems.length - 1; m >= 0; m-- ) {
				processItemKey( elems[m] );
			}
			processItemKey( elem );
		}
		function processItemKey( el ) {
			var pntKey, pntNode = el, pntItem, tmplItem, key;
			// Ensure that each rendered template inserted into the DOM has its own template item,
			if ( (key = el.getAttribute( tmplItmAtt ))) {
				while ( pntNode.parentNode && (pntNode = pntNode.parentNode).nodeType === 1 && !(pntKey = pntNode.getAttribute( tmplItmAtt ))) { }
				if ( pntKey !== key ) {
					// The next ancestor with a _tmplitem expando is on a different key than this one.
					// So this is a top-level element within this template item
					// Set pntNode to the key of the parentNode, or to 0 if pntNode.parentNode is null, or pntNode is a fragment.
					pntNode = pntNode.parentNode ? (pntNode.nodeType === 11 ? 0 : (pntNode.getAttribute( tmplItmAtt ) || 0)) : 0;
					if ( !(tmplItem = newTmplItems[key]) ) {
						// The item is for wrapped content, and was copied from the temporary parent wrappedItem.
						tmplItem = wrappedItems[key];
						tmplItem = newTmplItem( tmplItem, newTmplItems[pntNode]||wrappedItems[pntNode] );
						tmplItem.key = ++itemKey;
						newTmplItems[itemKey] = tmplItem;
					}
					if ( cloneIndex ) {
						cloneTmplItem( key );
					}
				}
				el.removeAttribute( tmplItmAtt );
			} else if ( cloneIndex && (tmplItem = jQuery.data( el, "tmplItem" )) ) {
				// This was a rendered element, cloned during append or appendTo etc.
				// TmplItem stored in jQuery data has already been cloned in cloneCopyEvent. We must replace it with a fresh cloned tmplItem.
				cloneTmplItem( tmplItem.key );
				newTmplItems[tmplItem.key] = tmplItem;
				pntNode = jQuery.data( el.parentNode, "tmplItem" );
				pntNode = pntNode ? pntNode.key : 0;
			}
			if ( tmplItem ) {
				pntItem = tmplItem;
				// Find the template item of the parent element.
				// (Using !=, not !==, since pntItem.key is number, and pntNode may be a string)
				while ( pntItem && pntItem.key != pntNode ) {
					// Add this element as a top-level node for this rendered template item, as well as for any
					// ancestor items between this item and the item of its parent element
					pntItem.nodes.push( el );
					pntItem = pntItem.parent;
				}
				// Delete content built during rendering - reduce API surface area and memory use, and avoid exposing of stale data after rendering...
				delete tmplItem._ctnt;
				delete tmplItem._wrap;
				// Store template item as jQuery data on the element
				jQuery.data( el, "tmplItem", tmplItem );
			}
			function cloneTmplItem( key ) {
				key = key + keySuffix;
				tmplItem = newClonedItems[key] =
					(newClonedItems[key] || newTmplItem( tmplItem, newTmplItems[tmplItem.parent.key + keySuffix] || tmplItem.parent ));
			}
		}
	}

	//---- Helper functions for template item ----

	function tiCalls( content, tmpl, data, options ) {
		if ( !content ) {
			return stack.pop();
		}
		stack.push({ _: content, tmpl: tmpl, item:this, data: data, options: options });
	}

	function tiNest( tmpl, data, options ) {
		// nested template, using {{tmpl}} tag
		return jQuery.tmpl( jQuery.template( tmpl ), data, options, this );
	}

	function tiWrap( call, wrapped ) {
		// nested template, using {{wrap}} tag
		var options = call.options || {};
		options.wrapped = wrapped;
		// Apply the template, which may incorporate wrapped content,
		return jQuery.tmpl( jQuery.template( call.tmpl ), call.data, options, call.item );
	}

	function tiHtml( filter, textOnly ) {
		var wrapped = this._wrap;
		return jQuery.map(
			jQuery( jQuery.isArray( wrapped ) ? wrapped.join("") : wrapped ).filter( filter || "*" ),
			function(e) {
				return textOnly ?
					e.innerText || e.textContent :
					e.outerHTML || outerHtml(e);
			});
	}

	function tiUpdate() {
		var coll = this.nodes;
		jQuery.tmpl( null, null, null, this).insertBefore( coll[0] );
		jQuery( coll ).remove();
	}
})( jQuery );



/*! 
 * CSS hook -- transitions
 * Copyright (c) 2010 Burin Asavesna (http://helloburin.com)
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
* Experimental header scroller
* Someday to be made more generic and opensourced
* Author: Nick Evans 2011
*/
(function (window) {
	var ua = navigator.userAgent.toLowerCase(),
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
		scaleFactor: null,
		
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
	sch.prototype.getScrollPosition = function () {
		return $(window).scrollTop();
	};
	sch.prototype.assessHeaderCondition = function () {

		var s = this.settings,
			that = this;
		
		if (s.$header.height() > s.smallestHeight && that.getScrollPosition() < s.winHeight - 200 || that.getScrollPosition() < s.winHeight - 200) {

			// resize the header
			that.resizeElement(s.$header);

			// resize any related elements
			for (var i = 0, numberOfExtras = that.extraElements.length; i < numberOfExtras; i += 1){
				that.resizeElement($(that.extraElements[i]));
			}
			 if (s.inHeaderLockedOff) {

				// remove the flag locking off the header
				this.settings.inHeaderLockedOff = false;
				$('body').removeClass('scroll-locked-off');
				s.$header.parent().parent().removeClass('locked-off');
				if (typeof(this.callbacks.onRemoveLockOff) == "function") {
					this.callbacks.onRemoveLockOff();
				}		 
			 }

		} else if (! s.inHeaderLockedOff) { // we only need to lock everything off if it isn't already locked off.

			that.lockOffElement(s.$header);			
			for (var i = 0, numberOfExtras = that.extraElements.length; i < numberOfExtras; i += 1) {
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
	/*! yup, we could be using scale here, and I'm experimenting with it */
	sch.prototype.resizeElement = function ($element) {
		var s = this.settings,
			percentage = $(window).scrollTop() > 1 ? 100 - (100 * ($(window).scrollTop() / s.winHeight )) : 100;
			

		/* TODO
		* css transforms currently not working
		* the header sizes need to be set on load, and then reset on reszie
		* then the scale can be a percentage of the original style.
		*/
/*
		if (Modernizr.csstransforms) {
			percentage = percentage > 99 ? 1 : "0." + percentage;
			$element.css(s.tStyle, "scale(" + percentage +")");
			console.log('doin it with transforms');
		} else {
*/		
			$element // doing dom changes to an off line seems to actually be counter productive here.
				.css({
					'height': percentage + "%",
					'font-size': $element.height() / s.scaleFactor + "px",
					'line-height': $element.height() + "px"
					})
				.find('h1') // this seems to be required in OS, I don't like it either.
				.css({
					'height': "100%",
					'font-size': "100%",
					'line-height': "100%"});
//		} // end of css transforms 
			
		if (typeof(this.callbacks.resizeHeader) == "function") {
			this.callbacks.resizeHeader();
		}
	};
	
	sch.prototype.lockOffElement = function ($element) {

		var s = this.settings,
			$newElement = $element.clone( true );
		// doing dom changes to an off line element saves reflows
		$newElement
			.css({
				'height': s.smallestHeight + "px",
				'font-size': s.fontSize + "px",
				'line-height': s.smallestHeight + "px"})
			.find('h1') // this seems to be required in OS, I don't like it either.
			.css({
				'height': s.smallestHeight + "px",
				'font-size': s.fontSize + "px",
				'line-height': s.smallestHeight + "px"})
			.addClass('locked-off');
			
		if (s.$header === $element) { // TODO: is there a need for a distinction between the header, and tracking elements?
			this.settings.$header = $newElement;
		}
		$element.replaceWith($newElement);
		this.settings.inHeaderLockedOff = true;	
		$('body').addClass('scroll-locked-off');
		if (typeof(this.callbacks.lockOffElement) == "function") {
			this.callbacks.lockOffElement();
		}
	};
	
	sch.prototype.init = function (options) {
		var tStyle = document.body.style;
		
		//setup the settings
		// perhaps I could just use $.extend here
		this.settings.$header = options.header || $('header');
		this.settings.smallestHeight = options.smallestHeight || 100;
		this.settings.fontSize = options.fontSize || 44;
		this.callbacks = options.callbacks || {};
		this.extraElements = options.extraElements || [];
		this.settings.scaleFactor = options.scaleFactor || 2;
		var that = this;

		this.settings.tStyle = (tStyle.WebkitTransform !== undefined)  ? "-webkit-transform":
				(tStyle.MozTransform !== undefined)  ? "-moz-transform":
				(tStyle.msTransition !== undefined)  ? "-ms-transform":
				(tStyle.OTransform !== undefined)  ? "-o-transform":
				(tStyle.transform !== undefined)  ? "transform":
											null; // nothing doing? then we'll use jQuery css properties the hard way
		//bind the resize event
		$(window).bind("scroll", function(event){ that.assessHeaderCondition(); });

		$(window).bind("resize",function(event){ that.assessViewPort(); });

		// turn over the engine once to see what's out there.
		this.assessViewPort();
		
	};
	
	// touch events
	tsch.prototype = new sch();
	
	tsch.prototype.resizeElement = function () {
		var s = this.settings,
			that = this,
			myScrollPosition = that.getScrollPosition(),
			percentage = (myScrollPosition > 1) ? 100 - (100 * -((-myScrollPosition / s.winHeight ))) : 100,
			$newHeaderHeight = s.$header.height(),
			$newHeaderTitle = s.$header.find('h1').clone( true );

			// doing dom changes to an off line element saves reflows
			$newHeaderTitle
				.css({
					'font-size': parseInt($newHeaderHeight / s.scaleFactor, 10) + "px",
					'line-height': $newHeaderHeight + "px"});
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
		this.settings.fontSize = options.fontSize || 44;
		this.settings.scaleFactor = options.scaleFactor || 2;
		
		this.settings.referencePointSelector = options.referencePointSelector || '#container-liner';

		this.callbacks = options.callbacks || {};
		this.extraElements = options.extraElements || [];
		var that = this;
		
		// this is the main section scroller, running from top to bottom
		this.section_flip = new iScroll('container', {
			hScrollbar: false,
			vScrollbar: true,
			snap: '.touch-div',
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
		this.timer = setTimeout(function(){that.onScrollEndLoop(that);}, 100);
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
			pagination: false,
			prevSlide: '.prev',
			nextSlide: '.next',
			speed: 500
		},
		opt = $.extend(defaults, config);
		
		carousel = {
			roundDown : function(leftmargin) {
				var leftmargin = parseInt(leftmargin, 10);
				
				return Math.ceil( (leftmargin - (leftmargin % 100 ) ) / 100) * 100;
			},
			transitionSupport : function() {
				var dStyle = document.body.style;
				
				return dStyle.webkitTransition !== undefined || 
						dStyle.mozTransition !== undefined ||
						dStyle.msTransition !== undefined ||
						dStyle.oTransition !== undefined ||
						dStyle.transition !== undefined;
			},
			transitionSwap : function($el, tog) {
				var speed = opt.speed / 1000,
					transition = ( tog ) ? "margin-left " + speed + "s ease" : 'none';

				$el.css({
					"-webkit-transition": transition,
					"-moz-transition": transition,
					"-ms-transition": transition,
					"-o-transition": transition,
					"transition": transition
				});
			},
			snapBack : function($el, left) {
				var currentPos = ( $el.attr('style') !== undefined ) ? $el.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1) : 0,
					leftmargin = (left === false) ? carousel.roundDown(currentPos) - 100 : carousel.roundDown(currentPos);

				carousel.transitionSwap($el, true);
				carousel.move($el, leftmargin);	
			},
			nextPrev : function($slider, dir) {
				var leftmargin = ( $slider ) ? $slider.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1) : 0,
					$slide = $slider.find(opt.slide),
					constrain = dir === 'prev' ? leftmargin != 0 : -leftmargin < ($slide.length - 1) * 100,
					$target = $( '[href="#' + $slider.attr('id') + '"]');
									
				if (!$slider.is(":animated") && constrain ) {
					if ( dir === 'prev' ) {
						leftmargin = ( leftmargin % 100 != 0 ) ? carousel.roundDown(leftmargin) : leftmargin + 100;
					} else {
						leftmargin = ( ( leftmargin % 100 ) != 0 ) ? carousel.roundDown(leftmargin) - 100 : leftmargin - 100;
					}
				} else {
					var leftmargin = carousel.roundDown(leftmargin);
				}
				carousel.move($slider, leftmargin);
			},
			createPagination : function($slider) {
				$slider.each(function(i) {
					var $oEl = $(this),
						$pagination = $('<ol class="carousel-tabs" role="tablist" />'),
						slides = $oEl.find(opt.slide).length,
						current = $oEl.index() + 1;

					while( slides-- ) {
						var i = slides + 1;

						$pagination.prepend('<li><a href="#carousel' + current + '-slide' + i +'" id="carousel' 
						+ current + '-tab' + i + '" role="tab" tabindex="-1" aria-selected="false">Page ' + i + '</a></li>');

/* 
	I don�t like that the above links don�t contain meaningful text. I�m thinking about introducing
	a data- attribute or user-controllable selector that could be used to pull in a heading�s text�even if that heading 
	is hidden in a screen-reader accessible kind of way, something like:

	.a11y-only {
		position: absolute;
		left: -9999px;
	}

	<h1 class="panel-hed a11y-only">A Meaningful Tabpanel Heading</h1>

	And then grab the contents of .panel-hed and use it to populate the link accordingly.
*/
					}

					$pagination.find("li").keydown(function(e) {
						var $el = $(this),
							$prevTab = $el.prev().find('a'),
							$nextTab = $el.next().find('a');
						
						switch (e.which) {
							case 37:
							case 38:		
								$prevTab.length && $prevTab.trigger('click').focus();

								e.preventDefault();
								break;
							case 39: 
							case 40:
								$nextTab.length && $nextTab.trigger('click').focus();

								e.preventDefault();
								break;
						}
					}).find('a').click(function(e) {
						var $el = $(this),
							current = $el.parent().index(),
							move = -(100 * (current)),
							$slider = $oEl.find(opt.slider);
								
						carousel.move($slider, move);

						e.preventDefault();
					});

					$oEl.append($pagination);
				});
			},
			move : function($slider, moveTo) {
				if( carousel.transitionSupport() ) {
					$slider.css('marginLeft', moveTo + "%");
				} else {
					$slider.animate({ marginLeft: moveTo + "%" }, opt.speed);
				}
				carousel.navState($slider, moveTo);
			},
			activeSlide : function($slider, current) {

				var $slides = $slider.find(opt.slide),
					$activeSlide = $($slides[current]);
					
				$activeSlide
					.addClass("active")
					.attr('aria-hidden', false)
						.find('*') // Until aria-activedescendant support is better, here we are. I know�it makes me nauseous too.
						.removeAttr('tabindex')
					.end()
					.siblings()	
						.removeClass("active")
						.attr('aria-hidden', true)
							.find('*')
							.attr('tabindex', -1);
			},
			navState : function($slider, moveTo) {
				var $target = $( '[href="#' + $slider.attr('id') + '"]'),
					$slides = $slider.find(opt.slide),
					current = -(moveTo / 100),
					$pagination = $slider.parent().find('.carousel-tabs');

				$target.removeClass('disabled');

				carousel.activeSlide($slider, current);

				if( $pagination.length ) {
					$pagination
						.find('li:nth-child(' + (current + 1 ) + ')')
						.addClass('current')
							.find('a')
							.attr({
								'tabindex' : 0,
								'aria-selected' : true
							})
						.end()
						.siblings()
							.removeClass('current')
							.find('a')
							.attr({
								'tabindex' : -1,
								'aria-selected' : false
							})
				}

				switch( moveTo ) {
					case ( -($slides.length - 1) * 100 ):
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

				carousel.nextPrev($slider, dir);
				
			e.preventDefault();
		})
		.keydown(function(e) {
			var $el = $(this),
				link = $el.attr('href');

			switch (e.which) {
				case 37:
				case 38:
					$(opt.prevSlide).filter('[href="' + link + '"]').trigger('click').focus();
					break;
				case 39:
				case 40:
					$(opt.nextSlide).filter('[href="' + link + '"]').trigger('click').focus();
					break;
			}
		});

		$(opt.prevSlide).addClass('disabled');

		//swipes trigger move left/right
		this.live( "dragSnap", function(e, ui){
			var $slider = $(this).find( opt.slider ),
				dir = ( ui.direction === "left" ) ? 'next' : 'prev';
				
			carousel.nextPrev($slider, dir);
		});
		
		if( opt.pagination ) {
			carousel.createPagination(this);
		}

		return this.each(function(carInt) {
			var $wrap = $(this),
				$slider = $wrap.find(opt.slider),
				$slide = $wrap.find(opt.slide),			
				slidenum = $slide.length,
				speed = opt.speed / 1000;
			$wrap.css({
				overflow: "hidden",
				width: "100%"
			});
			
			$slider.css({
				marginLeft: "0px",
				width: 100 * slidenum + "%"
			});
				    
			$slide.css({
					width: (100 / slidenum) + "%"
				})
				.each(function(i) {
					var $el = $(this),
						tmp = 'carousel' + ( carInt + 1 ),
						i = i + 1;

					$el.attr({
						role : "tabpanel",
						id : tmp + '-slide' + i
					});
					
					if( opt.pagination ) {
						$el.attr('aria-labelledby', tmp + '-tab' + i);
					}
				});

			carousel.navState($slider, 0);
			carousel.transitionSwap($slider, true);
		});

	};
		
	$.event.special.dragSnap = {
		setup: function() {
			var $el = $(this);

			$el
				.bind("touchstart", function(e) {
					var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
						start = {
							time: (new Date).getTime(),
							coords: [ data.pageX, data.pageY ],
							origin: $(e.target).closest('.slidewrap')
						},
						stop,
						$tEl = $(e.target).closest('.slider'),
						currentPos = ( $tEl.attr('style') != undefined ) ? $tEl.attr('style').match(/margin\-left:(.*[0-9])/i) && parseInt(RegExp.$1) : 0;

					carousel.transitionSwap($tEl, false);

					function moveHandler(e) {
						var data = e.originalEvent.touches ? e.originalEvent.touches[0] : e;
						stop = {
								time: (new Date).getTime(),
								coords: [ data.pageX, data.pageY ]
						};

						if(!start || Math.abs(start.coords[0] - stop.coords[0]) < Math.abs(start.coords[1] - stop.coords[1]) ) {
							return;
						}

						$tEl.css({"margin-left": currentPos + ( ( (stop.coords[0] - start.coords[0]) / start.origin.width() ) * 100 ) + '%' });						

						// prevent scrolling
						if (Math.abs(start.coords[0] - stop.coords[0]) > 10) {
							e.preventDefault();
						}

					};

					$el
						.bind("gesturestart", function(e) {
							$el
								.unbind("touchmove", moveHandler)
								.unbind("touchend", moveHandler);
						})
						.bind("touchmove", moveHandler)
						.one("touchend", function(e) {

							$el.unbind("touchmove", moveHandler);
							carousel.transitionSwap($tEl, true);

							if (start && stop ) {

								if (Math.abs(start.coords[0] - stop.coords[0]) > 10
									&& Math.abs(start.coords[0] - stop.coords[0]) > Math.abs(start.coords[1] - stop.coords[1])) {
									e.preventDefault();
								} else {
									carousel.snapBack($tEl, true);
									return;
								}

								if (Math.abs(start.coords[0] - stop.coords[0]) > 1 && Math.abs(start.coords[1] - stop.coords[1]) < 75) {
									var left = start.coords[0] > stop.coords[0];

								if( -( stop.coords[0] - start.coords[0]) > ( start.origin.width() / 4 ) || ( stop.coords[0] - start.coords[0]) > ( start.origin.width() / 4 ) ) {

									start.origin.css("marginLeft", 0).trigger("dragSnap", {direction: left ? "left" : "right"});

									} else {								
										carousel.snapBack($tEl, left);
									}

								}
							}
							start = stop = undefined;
						});
				});
		}
	};
})(jQuery);