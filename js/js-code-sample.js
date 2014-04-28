( function( window, document, undefined ){


	if( window.Feedback !== undefined ){

		return;

	}


	/**
	 * function to remove elements, input as arrays
	 *
	 * @author Richard Tape <@richardtape>
	 * @package BugTracker
	 * @since 1.0
	 * @param (array) remove - what to remove
	 * @return 
	 */
	
	removeElements = function( remove ){

		for( var i = 0, len = remove.length; i < len; i++ ){

			var item = Array.prototype.pop.call( remove );

			if( item !== undefined ){

				if(item.parentNode !== null ){ // check that the item was actually added to DOM
					item.parentNode.removeChild( item );
				}

			}

		}

	},

	/**
	 * Create the feeback loader
	 *
	 * @author Richard Tape <@richardtape>
	 * @package BugTracker
	 * @since 1.0
	 * @param (object) options - the options passed to this plugin
	 * @return (object) a htmlObject of a dic
	 */
	
	loader = function( options ){

		var div = document.createElement("div");
		div.className = "feedback-loader";

		var valueText = element( 'span', options.loadingText );

		div.appendChild( valueText );

		return div;

	},

	/**
	 * The returned value is a TextRectangle object which is the union of the 
	 * rectangles returned by getClientRects() for the element, i.e., the 
	 * CSS border-boxes associated with the element.
	 *
	 * @author Richard Tape <@richardtape>
	 * @package BugTracker
	 * @since 1.0
	 * @param (object) el - the element to get the bounded rectangles
	 * @return (object) TextRectangle object which is the union of the rectangles
	 */
	
	getBounds = function( el ){

		return el.getBoundingClientRect();

	},


	/**
	 * Empty an element of it's children
	 *
	 * @author Richard Tape <@richardtape>
	 * @package BugTracker
	 * @since 1.0
	 * @param (object) el - the element to empty
	 * @return (object) - the emptied element
	 */
	
	emptyElements = function( el ){

		var item;
		while( ( ( item = el.firstChild ) !== null ? el.removeChild( item ) : false) ){}

	},


	/**
	 * A method to help create an element and append it to the dom
	 *
	 * @author Richard Tape <@richardtape>
	 * @package BugTracker
	 * @since 1.0
	 * @param (string) name - the name of this element (i.e. div)
	 * @param (string) text - the text to add
	 * @return (object) el - the created object
	 */
	
	element = function( name, text ){

		var el = document.createElement( name );
		el.appendChild( document.createTextNode( text ) );
		return el;

	},

	/**
	 * script onload function to provide support for IE as well
	 *
	 * @author Richard Tape <@richardtape>
	 * @package BugTracker
	 * @since 1.0
	 * @param (object) script - the script to load
	 * @param (object) func - the callback to run after loading
	 * @return 
	 */
	
	scriptLoader = function( script, func ){

		if( script.onload === undefined ){

			// IE lack of support for script onload
			if( script.onreadystatechange !== undefined ){

				var intervalFunc = function(){

					if( script.readyState !== "loaded" && script.readyState !== "complete" ){

						window.setTimeout( intervalFunc, 250 );

					}else{

						func(); // it is loaded

					}

				};

				window.setTimeout( intervalFunc, 250 );

			}else{

				log( "ERROR: We can't track when script is loaded" );

			}

		}else{

			return func;

		}

	},

	//
	// <snip> Quite a bit of other code here
	//

	/**
	 * Create a canvas element for which we can use our screenshot taker
	 *
	 * @author Richard Tape <@richardtape>
	 * @package BugTracker
	 * @since 1.0
	 * @param null
	 * @return null
	 */
	
	window.Feedback.Screenshot.prototype.data = function(){

		if( this._data !== undefined ){

			return this._data;

		}

		if( this.h2cCanvas !== undefined ){

			var ctx 		= this.h2cCanvas.getContext( "2d" ),
			canvasCopy,
			copyCtx,
			radius 			= 5;
			ctx.fillStyle 	= "#000";

			// draw blackouts
			Array.prototype.slice.call( document.getElementsByClassName( 'feedback-blackedout' ), 0 ).forEach( function( item ){

				var bounds = getBounds( item );
				ctx.fillRect( bounds.left, bounds.top, bounds.width, bounds.height );

			});

			// draw highlights
			var items = Array.prototype.slice.call( document.getElementsByClassName( 'feedback-highlighted' ), 0 );

			if( items.length > 0 ){

				// copy canvas
				canvasCopy 			= document.createElement( "canvas" );
				copyCtx 			= canvasCopy.getContext( '2d' );
				canvasCopy.width 	= this.h2cCanvas.width;
				canvasCopy.height 	= this.h2cCanvas.height;

				// Add this canvas to the dom
				copyCtx.drawImage( this.h2cCanvas, 0, 0 );

				// Make it grey by default with some semi transparency
				ctx.fillStyle 		= "#777";
				ctx.globalAlpha 	= 0.5;
				ctx.fillRect( 0, 0, this.h2cCanvas.width, this.h2cCanvas.height );

				ctx.beginPath();

				// Now add our screenshot
				items.forEach( function( item ){

					var x 	= parseInt( item.style.left, 10 ),
					y 		= parseInt( item.style.top, 10 ),
					width 	= parseInt( item.style.width, 10 ),
					height 	= parseInt( item.style.height, 10 );

					ctx.moveTo( x + radius, y );
					ctx.lineTo( x + width - radius, y );
					ctx.quadraticCurveTo( x + width, y, x + width, y + radius );
					ctx.lineTo( x + width, y + height - radius );
					ctx.quadraticCurveTo( x + width, y + height, x + width - radius, y + height );
					ctx.lineTo( x + radius, y + height );
					ctx.quadraticCurveTo( x, y + height, x, y + height - radius );
					ctx.lineTo( x, y + radius );
					ctx.quadraticCurveTo( x, y, x + radius, y );

				});

				ctx.closePath();
				ctx.clip();

				ctx.globalAlpha = 1;

				// And add it!
				ctx.drawImage( canvasCopy, 0,0 );

			}

			// to avoid security error break for tainted canvas
			try {

				return ( this._data = this.h2cCanvas.toDataURL() ); // cache and return data

			}catch( e ){

			}

		}

	}/* window.Feedback.Screenshot.prototype.data() */;


	/**
	 * A standard XHR object to enable us to send via AJAX
	 *
	 * @author Richard Tape <@richardtape>
	 * @package BugTracker
	 * @since 1.0
	 * @param (string) url - the url of the AJAX handler
	 * @return nu;;
	 */
	
	window.Feedback.XHR = function( url ){

		this.xhr = new XMLHttpRequest();
		this.url = url;

	};


	window.Feedback.XHR.prototype = new window.Feedback.Send();

	/**
	 * 
	 *
	 * @author Richard Tape <@richardtape>
	 * @package BugTracker
	 * @since 1.0
	 * @param (object) data - the data we're sending via AJAX
	 * @param (function) callback - what to do after sending
	 * @return null
	 */
	
	window.Feedback.XHR.prototype.send = function( data, callback ){

		var xhr = this.xhr;

		jQuery.ajax( {

			type 		: "post",
			dataType 	: "json",
			url 		: this.url,
			data 		: { action: "send_feedback", fullData: data, viewportSize: viewportSize() },

			success: function(response){

				callback( ( response.type === 'success' ), xhr );

			},

			complete: function( jqXHR, textStatus ){

				console.log( [jqXHR, textStatus] );

			},

			error: function( jqXHR, textStatus, errorThrown ){

				console.log( [jqXHR, textStatus, errorThrown] );

			}

		} );

	}/* window.Feedback.XHR.prototype.send() */;

} )( window, document );