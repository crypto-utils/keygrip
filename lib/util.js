
var crypto = require('crypto')

exports.crypt = function crypt(cipher, data) {
  var text = cipher.update(data, 'utf8')
  var pad  = cipher.final()

  if (typeof text === 'string') {
    // cipher output binary strings (Node.js <= 0.8)
    text = new Buffer(text, 'binary')
    pad  = new Buffer(pad, 'binary')
  }

  return Buffer.concat([text, pad])
}

exports.supportedCipher = (function () {
  if (!crypto.getCiphers) {
    return canCreateCipher
  }

  var cryptoCiphers = crypto.getCiphers()

  return function supportedCipher(val) {
    return cryptoCiphers.indexOf(val) !== -1
  }
}())

exports.supportedHash = (function () {
  if (!crypto.getCiphers) {
    return canCreateHash
  }

  var cryptoHashes = crypto.getHashes()

  return function supportedHash(val) {
    return cryptoHashes.indexOf(val) !== -1
  }
}())

function canCreateCipher(val) {
  try {
    crypto.createCipher(val, '')
  } catch (err) {
    return false
  }

  return true
}

function canCreateHash(val) {
  try {
    crypto.createHash(val)
  } catch (err) {
    return false
  }

  return true
}
