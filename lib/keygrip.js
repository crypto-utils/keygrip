crypto = require( "crypto" )
defaults = require( "./defaultKeys" )

function KeyGrip( keys ) {
  if ( !( this instanceof KeyGrip ) ) return new KeyGrip( keys )
  
  if ( !keys || !( 0 in keys ) ) {
    console.warn( "No keys specified, using defaults instead." )
    keys = defaults
  }
  
  function sign( data, key ) {
    return crypto
      .createHmac( "sha1", key )
      .update( data ).digest( "base64" )
      .replace( /\/|\+|=/g, function( x ) {
        return ({ "/": "_", "+": "-", "=": "" })[ x ]  
      })
  }

  this.sign = function( data ){ return sign( data, keys[ 0 ] ) }

  this.verify = function( data, key ) {
    for ( var i = 0, l = keys.length; i < l; i++ ) {
      if ( key === sign( data, keys[ i ] ) ) return i
    }
    
    return -1
  }
}

KeyGrip.sign = KeyGrip.verify = function() {
  throw "Usage: require( 'keygrip' )( <array-of-keys> )"
}

module.exports = KeyGrip