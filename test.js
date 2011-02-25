// ./test.js
var assert = require( "assert" )
  , keygrip = require( "keygrip" )
  , keylist = require( "keygrip/lib/defaultKeys" )
  , keys, hash, index

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