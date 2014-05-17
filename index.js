
var crypto = require("crypto")
var constantTimeCompare = require('scmp')

module.exports = Keygrip

function Keygrip(keys, algorithm, encoding) {
  if (!Array.isArray(keys) || !keys.length) throw new Error("Keys must be provided.")
  if (!(this instanceof Keygrip)) return new Keygrip(keys, algorithm, encoding)

  this.keys = keys
  this.algorithm = algorithm || 'sha1'
  this.encoding = encoding || 'base64'
}

Keygrip.prototype.sign = function Keygrip$_sign(data, key) {
  // default to the first key
  key = key || this.keys[0]

  return crypto
    .createHmac(this.algorithm, key)
    .update(data)
    .digest(this.encoding)
    .replace(/\/|\+|=/g, _sign_replace)
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
