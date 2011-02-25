cookie-node.js
============

`cookie-node` is a cookie module for [node.js](http://nodejs.org/), based
loosely on Tornado's approach to [signed cookies](http://www.tornadoweb.org/documentation#cookies-and-secure-cookies).

To start, require the library in your app:

    var cookie = require( "./cookie-node" );

This extends the `ServerRequest` and `ServerResponse` objects, allowing you to
get cookies on requests and set them on responses for server calls:

    function( req, res ) {
      var name = req.getCookie( "name" ),
          length = name.length;

      res.setCookie( "name_length", length );

      res.writeHead(200, {"Content-Type": "text/html"});	
      res.write( "Your name has " + length + " characters." );	
      res.close();
    }

You can also set a cookie secret to enable signed cookies, and prevent forged
cookies:

    cookie.secret = "myRandomSecretThatNoOneWillGuess";

so that the above becomes:

    function( req, res ) {
      var name = req.getSecureCookie( "name" ),
          length = name.length;

      res.setSecureCookie( "name_length", length );

      res.writeHead(200, {"Content-Type": "text/html"});	
      res.write( "Your name has " + length + " characters." );	
      res.close();
    }
    
(You don't need to set the secret, but your cookies will end up being
invalidated when the server restarts, and you will be yelled at.)
    
When you set a secure cookie, the value is stored alongside its expiration
date, as well as an HMAC SHA-1 digest of the two values with your secret. If a
cookie's signature does not match that calculated on the server, the
`getSecureCookie` method throws.

If you'd like to clear a cookie, just use `res.clearCookie( name )`.

That's about it. Send any questions or comments [here](http://twitter.com/jedschmidt).
