"use strict";

/*!
 * keygrip
 * Copyright(c) 2011-2014 Jed Schmidt
 * Copyright(c) 2014 Jonathan Ong
 * MIT Licensed
 */

var crypto = require('crypto')
var scmp = require('scmp')
var debug = require('debug')('keygrip')

module.exports = Keygrip

var KEY_SIZE = 32
var KDF_SALT = 'Keygrip'
var KDF_ITERATIONS = 100
var HASH = 'sha256'
var CIPHER = 'aes-256-cbc'

function Keygrip(keys) {
  if (arguments.length > 1) {
    console.warn('as of v2, keygrip() only accepts a single argument.')
    console.warn('keygrip() also now only supports buffers.')
  }

  if (!Array.isArray(keys) || !keys.length) throw new Error("Keys must be provided.")
  if (!(this instanceof Keygrip)) return new Keygrip(keys)

  this._keys = keys.map(function(key) {
    // Derive context-specific keys out of raw key inputs. The user is expected to provide
    // cryptographically secure keys, so a static salt and low iteration count are
    // sufficient.
    var raw = crypto.pbkdf2Sync(key, KDF_SALT, KDF_ITERATIONS, KEY_SIZE * 3, 'sha512')
    return {
      sign: raw.slice(0, KEY_SIZE),
      encrypt: raw.slice(KEY_SIZE, KEY_SIZE * 2),
      hmac: raw.slice(KEY_SIZE * 2, KEY_SIZE * 3),
    }
  })
}

Keygrip.prototype.sign = function sign(message, key) {
  // default to the first key
  var key = this._keys[key || 0]

  return crypto
    .createHmac(HASH, key.sign)
    .update(message)
    .digest()
}

Keygrip.prototype.verify = function verify(data, signature) {
  return this.indexOf(data, signature) > -1
}

Keygrip.prototype.encrypt = function encrypt(data, key) {
  var key = this._keys[key || 0]

  var iv = crypto.randomBytes(16)
  var cipher = crypto.createCipheriv(CIPHER, key.encrypt, iv)
  var ciphertext = Buffer.concat([cipher.update(data), cipher.final()])

  var mac = crypto
    .createHmac(HASH, key.hmac)
    .update(iv)
    .update(ciphertext)
    .digest()

  return Buffer.concat([mac, iv, ciphertext])
}

Keygrip.prototype.decrypt = function decrypt(data, key) {
  if (key === undefined) {
    for (var i = 0, l = this._keys.length; i < l; i++) {
      var message = this.decrypt(data, i)
      if (message !== false) return [message, i]
    }

    return false
  }

  // default to the first key
  key = this._keys[key || 0]

  // 32 byte hmac + 16 iv + at least one 16 block
  if (data.length < (32 + 16 + 16))
    return false

  var mac = data.slice(0, 32)
  var iv = data.slice(32, 32 + 16)
  var ciphertext = data.slice(32 + 16, data.length)

  var actualMac = crypto
    .createHmac(HASH, key.hmac)
    .update(iv)
    .update(ciphertext)
    .digest()

  if (!scmp(mac, actualMac))
    return false

  var cipher = crypto.createDecipheriv(CIPHER, key.encrypt, iv)
  return Buffer.concat([cipher.update(ciphertext), cipher.final()])
}

Keygrip.prototype.index =
Keygrip.prototype.indexOf = function Keygrip$_index(data, signature) {
  for (var i = 0, l = this._keys.length; i < l; i++) {
    if (scmp(signature, this.sign(data, i))) return i
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
