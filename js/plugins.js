
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
		
		$element.css('font-size', $element.height()/2 + "px").css('line-height', $element.height() + "px");

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
		this.settings.fontSize = options.fontSize || 44;
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
