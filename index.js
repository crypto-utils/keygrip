var crypto = require("crypto")
  , path   = require("path")
  , fs     = require("fs")

  , existsSync = fs.existsSync || path.existsSync

  , keysPath = path.join(__dirname, "defaultKeys.json")
  , defaults = existsSync(keysPath)
      ? JSON.parse(fs.readFileSync(keysPath))
      : undefined

function Keygrip(keys) {
  if (!(this instanceof Keygrip)) return new Keygrip(keys)

  if (!keys || !(0 in keys)) {
    if (keys = defaults) console.warn("No keys specified, using defaults instead.")

    else throw "Keys must be provided or default keys must exist."
  }

  function sign(data, key) {
    return crypto
      .createHmac("sha1", key)
      .update(data).digest("base64")
      .replace(/\/|\+|=/g, function(x) {
        return ({ "/": "_", "+": "-", "=": "" })[x]
      })
  }

  this.sign = function(data){ return sign(data, keys[0]) }

  this.verify = function(data, digest) {
    return this.index(data, digest) > -1
  }

  this.index = function(data, digest) {
    for (var i = 0, l = keys.length; i < l; i++) {
      if (digest === sign(data, keys[i])) return i
    }

    return -1
  }
}

Keygrip.sign = Keygrip.verify = Keygrip.index = function() {
  throw "Usage: require('keygrip')(<array-of-keys>)"
}

module.exports = Keygrip
