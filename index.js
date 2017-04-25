/*!
 * keygrip
 * Copyright(c) 2011-2014 Jed Schmidt
 * Copyright(c) 2014 Jonathan Ong
 * MIT Licensed
 */

var crypto = require("crypto")
var constantTimeCompare = require('scmp')
var debug = require('debug')('keygrip')
var util = require('./lib/util')

module.exports = Keygrip

function Keygrip(keys) {
  if (arguments.length > 1) {
    console.warn('as of v2, keygrip() only accepts a single argument.')
    console.warn('set keygrip().hash= instead.')
    console.warn('keygrip() also now only supports buffers.')
  }

  if (!Array.isArray(keys) || !keys.length) throw new Error("Keys must be provided.")
  if (!(this instanceof Keygrip)) return new Keygrip(keys)

  this.keys = keys
}

/**
 * Allow setting `keygrip.hash = 'sha1'`
 * or `keygrip.cipher = 'aes256'`
 * with validation instead of always doing `keygrip([], alg, enc)`.
 * This also allows for easier defaults.
 */

Keygrip.prototype = {
  constructor: Keygrip,

  get hash() {
    return this._hash
  },

  set hash(val) {
    if (!util.supportedHash(val))
      throw new Error('unsupported hash algorithm: ' + val)
    this._hash = val
  },

  get cipher() {
    return this._cipher
  },

  set cipher(val) {
    if (!util.supportedCipher(val))
      throw new Error('unsupported cipher: ' + val)
    this._cipher = val
  },

  // defaults
  _hash: 'sha256',
  _cipher: 'aes-256-cbc',
}

// encrypt a message
Keygrip.prototype.encrypt = function encrypt(data, iv, key) {
  key = key || this.keys[0]

  var cipher = iv
    ? crypto.createCipheriv(this.cipher, key, iv)
    : crypto.createCipher(this.cipher, key)

  return util.crypt(cipher, data)
}

// decrypt a single message
// returns false on bad decrypts
Keygrip.prototype.decrypt = function decrypt(data, iv, key) {
  if (!key) {
    // decrypt every key
    var keys = this.keys
    for (var i = 0, l = keys.length; i < l; i++) {
      var message = this.decrypt(data, iv, keys[i])
      if (message !== false) return [message, i]
    }

    return false
  }

  try {
    var cipher = iv
      ? crypto.createDecipheriv(this.cipher, key, iv)
      : crypto.createDecipher(this.cipher, key)
    return util.crypt(cipher, data)
  } catch (err) {
    debug(err.stack)
    return false
  }
}

// message signing
Keygrip.prototype.sign = function sign(data, key) {
  // default to the first key
  key = key || this.keys[0]

  var digest = crypto
    .createHmac(this.hash, key)
    .update(data)
    .digest()

  return typeof digest === 'string'
    ? new Buffer(digest, 'binary')
    : digest
}

Keygrip.prototype.verify = function verify(data, digest) {
  return this.indexOf(data, digest) > -1
}

Keygrip.prototype.index =
Keygrip.prototype.indexOf = function Keygrip$_index(data, digest) {
  var keys = this.keys
  for (var i = 0, l = keys.length; i < l; i++) {
    if (constantTimeCompare(digest, this.sign(data, keys[i]))) return i
  }

  return -1
}

Keygrip.encrypt =
Keygrip.decrypt =
Keygrip.sign =
Keygrip.verify =
Keygrip.index =
Keygrip.indexOf = function() {
  throw new Error("Usage: require(\'keygrip\')(<array-of-keys>)")
}
