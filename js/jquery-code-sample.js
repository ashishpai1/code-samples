( function( window, document, $, undefined ){

	// this is set to the jQ namespace at the bottom of this file, but allows us to just
	// call plugin.methodName() internally
	var plugin = function(){};

	// Used for versioning this file for older browsers
	var version = "1.0.0";

	// Allow us to only call map data once
	plugin.googlemap = null;

	
	/**
	 * Bind event handlers
	 *
	 * @author Richard Tape <@richardtape>
	 * @package ProjectName
	 * @since 1.0
	 * @param (object) event - the event which fired this (will be null, but put here for completeness)
	 * @return null
	 */

	plugin.init = function( event )
	{

		// Determine if we are on a touch device
		var tapClick = framework.touch.get( 'tapClickEvent' );


		// Events for mouseenter, tap or the result from our tapClick method
		$( document ).on( 'mouseenter tap', '.selector a', plugin.doSomething );
		$( document ).on( tapClick, '.some-item .unit a', plugin.doSomethingElse );

		// adjust screen when keyboard is on - mobile
		$( document ).on( 'focus', '.mobile input', plugin.mobileInputFocus );
		$( document ).on( 'blur', '.mobile input', plugin.mobileInputBlur );

	}/* plugin.init() */;

	/**
	 * Initialize our custom google maps with custom styles, map markers and pins
	 *
	 * @author Richard Tape <@richardtape>
	 * @package ProjectName
	 * @since 1.0
	 * @param null
	 * @return null, calls addMarkers()
	 */
	
	plugin.initGoogleMaps = function () {

		// check if map exists on page. Bail early if it doesn't
		var $map = $( '#map' );
		if( $map.length == 0 )
			return;

		// define map style id
		var mapStyleName = 'project_name_map_name';

		// define map options
		var mapOptions = {
			scrollwheel: 	false,
			minZoom: 		8,
			zoom: 			12,
			maxZoom: 		14,
			center: 		new google.maps.LatLng( -33.92, 151.25 ),
			mapTypeId: 		mapStyleName,
		};

		// create the actual google map object
		plugin.googlemap = new google.maps.Map( $map[0], mapOptions );


		// define custom map style options as per the design
		var styledMapOptions = {
			name: 'Custom Style'
		};

		var featureOpts = [{

			"stylers": [
			 	{ "lightness": 		12 },
			 	{ "saturation": 	-22 },
			 	{ "hue": 			"#ff1144" }
			]
		},{
			"featureType": 			"road",
			"stylers": [
				{ "weight": 		1.1 }
			]
		},{
			"featureType": 			"road.highway",
			"stylers": [
				{ "weight": 		1.2 },
				{ "lightness": 		-13 }
			]
		},{
			"featureType": "water",
			"stylers": [
				{ "saturation": 	-90 },
				{ "lightness": 		-2 },
				{ "gamma": 			0.90 }
			]
		}];

		// create custom map style
		var customMapType = new google.maps.StyledMapType( featureOpts, styledMapOptions );

		// set custom map style
		plugin.googlemap.mapTypes.set( mapStyleName, customMapType );

		// create global info window object
		plugin.openInfoWindow = new google.maps.openInfoWindow();

		// collect markers info
		var markers = plugin.collectMarkersInfo();

		// add markers
		plugin.addMarkers( markers );

	}/* plugin.initGoogleMaps() */;

	/**
	 * Collect information about the markers which are received from geolocation in browser
	 * if available
	 *
	 * @author Richard Tape <@richardtape>
	 * @package ProjectName
	 * @since 1.0
	 * @param null
	 * @return (object) markers - an object of all of the markers we need for the map
	 */
	
	plugin.collectMarkersInfo = function()
	{

		var markers = [];

		// Get the markers to show from geoLocation
		var geoLocationResults = $( '.geolocation-results li' );

		// Iterate over each one and get the data attributes and create an object to add to the Markers array
		geoLocationResults.each( function(){

			var id 					= $( this ).data( 'id' );
			var thisTitle 			= $( this ).data( 'title' );
			var thisDescription 	= $( this ).data( 'description' );
			var thisLat 			= $( this ).data( 'latitude' );
			var thisLong 			= $( this ).data( 'longitude' );

			markers.push( {
				'id' 			: id,
				'title' 		: thisTitle,
				'description' 	: thisDescription,
				'lat' 			: thisLat,
				'lon' 			: thisLong
			} );

		} );

		return markers;

	}/* plugin.collectMarkersInfo() */;


	/**
	 * When someone clicks on a map pin or a drawer, we open or close the relevant pin
	 *
	 * @author Richard Tape <@richardtape>
	 * @package ProjectName
	 * @since 1.0
	 * @param (int) id - the ID of the pin to show
	 * @return null
	 */
	
	plugin.openInfoWindow = function( id ){

		var marker 		= plugin.markers['id_' + id];
		var description = $( '.search[data-id="' + id + '"]' ).data( 'description' );

		// Set the content for the window
		plugin.openInfoWindow.setContent( description );

		// Open the window
		plugin.openInfoWindow.open( plugin.googlemap, marker );

	},/* plugin.openInfoWindow() */


	/**
	 * When someone clicks on a search result we should open the info window
	 * in the google map for that result
	 *
	 * @author Richard Tape <@richardtape>
	 * @package ProjectName
	 * @since 1.0
	 * @param null
	 * @return null, calls openInfoWindow
	 */
	

	plugin.openInfoWindowForResultClicked = function()
	{

		// This doesn't load on mobile
		if( $('body').hasClass( 'mobile' ) )
			return;

		// Grab the ID from the data attribute
		var this_id = $( this ).data( 'id' );

		// Open this info window
		plugin.openInfoWindow( this_id );

	};/* plugin.openInfoWindowForResultClicked() */


	//
	// There's much more code to the google maps example
	// But this is only a code sample ;)
	//


	// Set this up to the jQuery namespace so we can call it from outside
	$.projectName = plugin;

}( window, document, jQuery ) );