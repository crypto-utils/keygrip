require( "fs" ).writeFileSync( "./lib/defaultKeys.js",
  "module.exports = " + JSON.stringify([
    Array( 33 ).join( "x" ).replace( /x/g, function() {
      return ( Math.random()*16|0 ).toString(16)
    })
  ])
)