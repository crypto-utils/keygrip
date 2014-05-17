
var crypto = require("crypto")
var constantTimeCompare = require('scmp')

module.exports = Keygrip

function Keygrip(keys, algorithm, encoding) {
  if (!Array.isArray(keys) || !keys.length) throw new Error("Keys must be provided.")
  if (!(this instanceof Keygrip)) return new Keygrip(keys, algorithm, encoding)

  this.keys = keys
  if (algorithm) this.algorithm = algorithm
  if (encoding) this.encoding = encoding
}

/**
 * Allow setting `keygrip.algorithm = 'sha1'`
 * or `keygrip.cipher = 'aes256'`
 * with validation instead of always doing `keygrip([], alg, enc)`.
 * This also allows for easier defaults.
 */

Keygrip.prototype = {
  get algorithm() {
    return this._algorithm
  },

  set algorithm(val) {
    if (!~crypto.getHashes().indexOf(val))
      throw new Error('unsupported hash algorithm: ' + val)
    this._algorithm = val
  },

  get cipher() {
    return this._cipher
  },

  set cipher(val) {
    if (!~crypto.getCiphers().indexOf(val))
      throw new Error('unsupported cipher: ' + val)
    this._cipher = val
  },

  // defaults
  _algorithm: 'sha1',
  _cipher: 'aes256',
  encoding: 'base64',
}

// encrypt a message
Keygrip.prototype.encrypt = function Keygrip$_encrypt(data, key, encoding) {
  key = key || this.keys[0]

  var cipher = crypto.createCipher(this.cipher, key)
  cipher.update(data, encoding)
  return cipher
    .final(this.encoding)
    .replace(/\/|\+|=/g, _sign_replace)
}

// decrypt a single message
// returns false on bad decrypts
Keygrip.prototype._decrypt = function Keygrip$__decrypt(data, key, encoding) {
  try {
    var cipher = crypto.createDecipher(this.cipher, key)
    cipher.update(data, this.encoding)
    return cipher.final(encoding)
  } catch (err) {
    if (/bad decrypt/.test(err.message)) return false
    throw err
  }
}

// decrypt every key
Keygrip.prototype.decrypt = function Keygrip$_decrypt(data, encoding) {
  var keys = this.keys
  for (var i = 0, l = keys.length; i < l; i++) {
    var message = this._decrypt(data, keys[i], encoding)
    if (message !== false) return message
  }

  return false
}

// message signing
Keygrip.prototype.sign = function Keygrip$_sign(data, key) {
  // default to the first key
  key = key || this.keys[0]

  return crypto
    .createHmac(this.algorithm, key)
    .update(data)
    .digest(this.encoding)
    .replace(/\/|\+|=/g, _sign_replace)
}

Keygrip.prototype.verify = function Keygrip$_verify(data, digest) {
  return this.index(data, digest) > -1
}

Keygrip.prototype.index = function Keygrip$_index(data, digest) {
  var keys = this.keys
  for (var i = 0, l = keys.length; i < l; i++) {
    if (constantTimeCompare(digest, this.sign(data, keys[i]))) return i
  }

  return -1
}

Keygrip.sign = Keygrip.verify = Keygrip.index = function() {
  throw new Error("Usage: require('keygrip')(<array-of-keys>)")
}

// replace base64 characters with more friendly ones
var _sign_replacements = {
  "/": "_",
  "+": "-",
  "=": ""
}

function _sign_replace(x) {
  return _sign_replacements[x]
}
