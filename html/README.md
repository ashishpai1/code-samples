HTML Code Sample
================

A HTML example seems a little...weird, but I've added it for completeness. I mean, if you wanted to see what my HTML skills are like then view source on one of my projects ;)

That being said, that markup can often get...modified...by plugins etc. so here lies an example of some example, raw HTML for a blog post

Some notes:

- I often use the HTML5 boilerplate as a starting point.
- Normally, the JS and CSS would be enqueued using WordPress's native functions, I'm just putting them here for clarity
- I'd normally have WordPress actions and filters in the header and footer (i.e. wp_head and wp_footer), but this is simply just a HTML example
- I use Modernizr to allow me to progressively enhance websites based on the user's browser's capabilities
- I concatenate and minify my css into one single file to help reduce the number of network requests to increase performance
- I use CSS Sprites for graphics for which it makes sense to do so
- I concatenate and minify and gzip my javascript into one file. Sometimes this includes jQuery, other times it doesn't. Every project is different and depends on the expected audience of the site.