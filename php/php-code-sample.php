<?php

	// NOTE: 	Normally I would namespace this sort of thing, but for the
	// use in this example where I have multiple classes which would
	// span several files, I'll just leave it here for reference

	// namespace ProjectName;

	/**
	 * An abstract class to allow us to integrate several different
	 * version control repositories without our updater (i.e. to allow
	 * us to easily add bitbucket integreation in the future)
	 *
	 * This class collects all of the required data we need to allow
	 * us to update our themes or plugins from an external source
	 *
	 * @author Richard Tape <@richardtape>
	 * @package ProjectName
	 * @since 1.0
	 * @todo Update this to conform to WordPress's new requirement to always have braces on conditionals
	 */

	abstract class Updater
	{

		// (object) Configuration storage 
		protected $configuration;

		// (array) Any transient IDs that we need to access
		protected static $transients = array();

		// (int) Transient expiry
		protected static $transientTime;


		/**
		 * We need to add extra headers to the extra_plugin_headers filter to
		 * allow us to specify these within our plugin
		 *
		 * We may add more to these in our actual integrations
		 *
		 * The filter should be set up within the integration
		 *
		 * NOTE: My naming convention is; if I'm using a WordPress filter or action
		 * then I prefix the name of my method with that action or filter's name
		 * followed by a double underscore. This does lead to a mixture of camelCase
		 * and snake_case but I think it allows for easier reading and quicker 
		 * comprehension of what this method is doing and when
		 *
		 * @author Richard Tape <@richardtape>
		 * @package ProjectName
		 * @since 1.0
		 * @param (array) 	$extraHeaders - the currently set headers for plugins
		 * @return (array) 	$extraHeaders - plugin extra headers with our additions
		 */
		
		public function extra_plugin_headers__addHeadersForPlugin( $extraHeaders )
		{

			// These are used by all integrations
			$updaterPluginExtraHeaders = array(
				'Branch',
				'Plugin URI',
				'Access Token'
			);

			// Combine these with the existing ones, cast to ensure
			$extraHeaders = array_merge( (array) $extraHeaders, (array) $updaterPluginExtraHeaders );

			// Ship
			return $extraHeaders;

		}/* extra_plugin_headers__addHeadersForPlugin() */


		/**
		 * Fetch a transient and store it in the object's array. Uses get_site_transient()
		 * to ensure multisite compatibility.
		 *
		 * @author Richard Tape <@richardtape>
		 * @package ProjectName
		 * @since 1.0
		 * @param (string) $transientID - the ID of the transient to fetch
		 * @return (mixed) $transientData - the return of get_site_transient()
		 */
		
		public function getTransient( $transientID = false )
		{

			// Ensure that we have a transient ID
			if( !$transientID )
				return new \WP_Error( 'noTransientID', __( 'You did not provide a valid $transientID for getTransient()', PROJECTNAME_TEXTDOMAIN ), $transientID );

			// Form the full transient name. WP imposes a string limit on the name, so we use md5 to ensure we're small enough
			$transientName = self::formTransientNameFromID( $transientID );

			// Do we already have this transient in our object? Check the types (3rd param of in_array())
			if( !in_array( $transientName, self::$transients, true ) )
				self::$transients[] = $transientName;

			// Fetch the data
			$transientData = get_site_transient( $transientName );

			// Ship it
			return $transientData;

		}/* getTransient() */


		/**
		 * Form the transient name which is the prefix and then an 
		 * md5'd string of the transient ID
		 *
		 * @author Richard Tape <@richardtape>
		 * @package 
		 * @since 1.0
		 * @param (string) 	$transientID - the ID of the transient to fetch
		 * @return (string) $transientName - the name of the transient
		 */
		
		private function formTransientNameFromID( $transientID = false )
		{

			// Ensure that we have a transient ID
			if( !$transientID )
				return new \WP_Error( 'noTransientID', __( 'You did not provide a valid $transientID for formTransientNameFromID()', PROJECTNAME_TEXTDOMAIN ), $transientID );

			// All of our transients have a prefix. We run it through a filter in case we wish to externally alter this
			$transientPrefix = apply_filters( 'project_name_transient_prefix', 'updater-' );

			// Form the full transient name. WP imposes a string limit on the name, so we use md5 to ensure we're small enough
			$transientName = $transientPrefix . md5( $id );

			// Ship it
			return $transientName;

		}/* formTransientNameFromID() */
		

	}/* class Updater */


	/**
	 * An extension of the Updater class to add github updating for plugins
	 *
	 * Note
	 * This is merely an example of me being able to use and understand inheritance within classes for
	 * PHP as well as showing uses of WordPress actions and filters. It doesn't actually
	 * do anything as an awful lot of code has been stripped for the example.
	 * 
	 * @author Richard Tape <@richardtape>
	 * @package ProjectName
	 * @since 1.0
	 */
	
	class GitHub_Updater extends Updater
	{

		/**
		 * Add our actions and filters which set up the necessary requests for WP
		 *
		 * @author Richard Tape <@richardtape>
		 * @package ProjectName
		 * @since 1.0
		 * @param null
		 * @return null
		 */
		
		public function __construct()
		{

			// Fetch our plugin headers
			add_filter( 'extra_plugin_headers', array( $this, 'extra_plugin_headers__addHeadersForPlugin' ) );

			// Ensure we have a full set of configuration data
			if( empty( $this->configuration ) )
				return false;

			add_filter( 'plugins_api', array( $this, 'plugins_api__setDataForPluginsAPI' ), 99, 3 );

		}/* __construct() */
		

		/**
		 * Set our data for the plugins api when called via the plugins_api filter
		 *
		 * @author Richard Tape <@richardtape>
		 * @package ProjectName
		 * @since 1.0
		 * @param (bool|object) $result 	- The result object. Default false.
	 	 * @param (string)      $action 	- The type of information being requested from the Plugin Install API.
	 	 * @param (object)      $args 		- Plugin API arguments.
		 * @return (object)		$response 	- Modified response object
		 */
		
		public function plugins_api__setDataForPluginsAPI( $result, $action, $response )
		{

			// Ensure that we're requesting for plugin information, otherwise bail
			if( !( 'plugin_information' === $action ) )
				return $result;

			// Try and fetch this plugins data from our transient
			$WPRepoData = get_site_transient( $this->formTransientNameFromID( $response->slug ) ) );

			// If we don't have anything in our transient, it must be a normal WP plugin
			// If we get some data from the WP api, set a transient to be kept for a day
			if( !$WPRepoData )
			{

				$WPRepoData = wp_remote_get( 'http://api.wordpress.org/plugins/info/1.0/' . $response->slug . '.php' );
				if( is_wp_error( $WPRepoData ) )
					return $result;

				set_site_transient( $this->formTransientNameFromID( $response->slug ), $WPRepoData, ( DAY_IN_SECONDS ) );
		
			}

			// If we have something in the body of the response, let's unserialize and set it to our method variable for the filter
			if( !empty( $WPRepoData['body'] ) )
			{

				$WPRepoBody = unserialize( $WPRepoData['body'] );
			
				if( is_object( $WPRepoBody ) )
					$response = $WPRepoBody;

			}

			// Note: This is where we'd actually have the logic to set the response vars, but they're
			// pretty long-winded and not needed for this example

			return $response;

		}/* plugins_api__setDataForPluginsAPI() */
		

	}/* class GitHub_Updater */
	

?>