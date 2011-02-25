var assert = require( "assert" )
  , secrets = [ "SEKRIT3", "SEKRIT2", "SEKRIT1" ]
  , keys = require( "./" )( secrets )
  , hash, index

// .sign returns the hash for the first key
// all hashes are SHA1 HMACs in url-safe base64
hash = keys.sign( "bieberschnitzel" )
assert.equal( hash, "4O9Lm0qQPd7_pViJBPKA_8jYwb8" )

// .verify returns the index of the first matching key
index = keys.verify( "bieberschnitzel", hash )
assert.equal( index, 0 )

index = keys.verify( "bieberschnitzel", "o_O" )
assert.equal( index, -1 )

// rotate a new key in, and an old key out
secrets.unshift( "SEKRIT4" )
secrets.pop()

// if index > 0, it's time to re-sign
index = keys.verify( "bieberschnitzel", hash )
assert.equal( index, 1 )
hash = keys.sign( "bieberschnitzel" )