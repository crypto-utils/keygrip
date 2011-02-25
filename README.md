keygrip
=======

keygrip is a [node.js](http://nodejs.org/) module for signing and verifying data, based on a rotating credential system. It can be used to detect tampering for signed URLs or cookies.

## Requirements

* [nodejs](http://nodejs.org/), tested with 0.4.1

## Install

    $ npm install keygrip
    
## Usage

    secrets = [ "SEKRIT3", "SEKRIT2", "SEKRIT1" ]
    keys = require( "./" )( secrets )
    
    hash = keys.sign( "bieberschnitzel" )   // => tGdm98qasPSCUpW9ksobxcIjW1E
    
    keys.verify( "bieberschnitzel", hash )  // => 0 (1st key matched)
    keys.verify( "bieberschnitzel", "o_O" ) // => -1 (not matched)
    
    secrets.unshift( "SEKRIT4" )            // rotate a new key in
    secrets.pop()                           // rotate the oldest key out
    
    keys.verify( "bieberschnitzel", hash )  // => 1 (2nd key matched, time to re-sign)
    
Copyright
---------

Copyright (c) 2011 Jed Schmidt. See LICENSE.txt for details.

Send any questions or comments [here](http://twitter.com/jedschmidt).