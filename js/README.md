Javascript Code Sample
========================

I tend to write my javascript in a similar way to my PHP - with an action based approach where actions/events are set in an initializer (similar to a __construct) and then the event handlers below.

If jQuery is available for a project (and I'm finding it is more and more likely that it is, mainly thanks to the fact that it's weight is, err, outweighed by the browser-incompatibilities that it deals with as well as making the low level JS API easier to use), I'm more inclined to use it than to write vanilla javascript. I've included two examples here, one which is vanilla and the other is the event-based approach for jQuery.

I'm slowly migrating towards Backbone JS as it not only makes more sense from an OOP perspective (with it's MV* approach) but it's also a lot easier to see where the data is at any given moment. It's also now extensively used throughout the WordPress dashboard.