Keygrip
=======

Keygrip is a [node.js](http://nodejs.org/) module for signing and verifying data (such as cookies or URLs) through a rotating credential system, in which new server keys can be added and old ones removed regularly, without invalidating client credentials.

## Requirements

* [node.js](http://nodejs.org/), tested with 0.4.1

## Install

    $ npm install keygrip
    
## API

### keys = new Keygrip([ keylist ])

This creates a new Keygrip based on the provided keylist, an array of secret keys used for SHA1 HMAC digests. Keygrip keeps a reference to this array to automatically reflect any changes. If no list is given, or the list is empty, Keygrip uses the default key created during `npm` installation, and will issue a warning to the console.

Note that the `new` operator is also optional, so all of the following will work when `Keygrip = require( "keygrip" )`:

    keys = new Keygrip
    keys = new Keygrip([ "SEKRIT2", "SEKRIT1" ])
    keys = Keygrip()
    keys = Keygrip([ "SEKRIT2", "SEKRIT1" ])
    keys = require( "keygrip" )()
    
The keylist is an array of all valid keys for signing, in descending order of freshness; new keys should be `unshift`ed into the array and old keys should be `pop`ped.

The tradeoff here is that adding more keys to the keylist allows for more granular freshness for key validation, at the cost of a more expensive worst-case scenario for old or invalid hashes.

### keys.sign( data )

This creates a SHA1 HMAC based on the _first_ key in the keylist, and outputs it as a 27-byte url-safe base64 digest (base64 without padding, replacing `+` with `-` and `/` with `_`).

### keys.verify( data, digest )

This loops through all of the keys currently in the keylist until the digest of the current key matches the given digest, at which point the current index is returned. If no key is matched, `-1` is returned.

The idea is that if the index returned is greater than `0`, the data should be re-signed to prevent premature credential invalidation, and enable better performance for subsequent challenges.

## Example

    // ./test.js
    var assert = require( "assert" )
      , keygrip = require( "keygrip" )
      , keylist, keys, hash, index
    
    // keygrip takes an array of keys, but if none exist,
    // it uses the defaults created during npm installation.
    // (but it'll will warn you)
    console.log( "Ignore this message:" )
    keys = keygrip( /* empty list */ )
    
    // .sign returns the hash for the first key
    // all hashes are SHA1 HMACs in url-safe base64
    hash = keys.sign( "bieberschnitzel" )
    assert.ok( /^[\w\-]{27}$/.test( hash ) )
    
    // but we're going to use our list.
    // (note that the 'new' operator is optional)
    keylist = [ "SEKRIT3", "SEKRIT2", "SEKRIT1" ]
    keys = keygrip( keylist )
    hash = keys.sign( "bieberschnitzel" )
    
    // .verify returns the index of the first matching key
    index = keys.verify( "bieberschnitzel", hash )
    assert.equal( index, 0 )
    
    index = keys.verify( "bieberschnitzel", "o_O" )
    assert.equal( index, -1 )
    
    // rotate a new key in, and an old key out
    keylist.unshift( "SEKRIT4" )
    keylist.pop()
    
    // if index > 0, it's time to re-sign
    index = keys.verify( "bieberschnitzel", hash )
    assert.equal( index, 1 )
    hash = keys.sign( "bieberschnitzel" )
    
## TODO

* Rewrite the `cookie` library to use `Keygrip`
* Write a library for URL signing

Copyright
---------

Copyright (c) 2011 Jed Schmidt. See LICENSE.txt for details.

Send any questions or comments [here](http://twitter.com/jedschmidt).