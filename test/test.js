"use strict";

// ./test.js
var crypto = require('crypto')
var assert = require("assert")
  , Keygrip = require("..")
  , keylist, keys, hash, index

describe('keygrip(keys)', function () {
  it('should throw if keys are missing or empty', function () {
    // keygrip takes an array of keys. If missing or empty, it will throw.
    assert.throws(function() {
      keys = new Keygrip(/* empty list */);
    }, /must be provided/);
  })

  it('should throw when setting an invalid hash algorithm', function () {
    var keys = new Keygrip(['a', 'b'])
    assert.throws(function () {
      keys.hash = 'asdf'
    }, /unsupported/)
  })

  it('should throw when setting an invalid cipher', function () {
    var keys = new Keygrip(['a', 'b'])
    assert.throws(function () {
      keys.cipher = 'asdf'
    }, /unsupported/)
  })
})

describe('keygrip([key])', function () {
  it('should sign a string', function () {
    // Randomly generated key - don't use this for something real. Don't be that person.
    keys = new Keygrip(['06ae66fdc6c2faf5a401b70e0bf885cb']);

    // .sign returns the hash for the first key
    // all hashes are SHA1 HMACs in url-safe base64
    hash = keys.sign("bieberschnitzel")
    assert.ok(/^[\w\+=]{44}$/.test(hash.toString('base64')))
  })

  it('should encrypt a message', function () {
    hash = keys.encrypt('lol')
    assert.equal('lol', keys.decrypt(hash)[0].toString('utf8'))
  })

  it('should return false on bad decryptions', function () {
    var keys2 = new Keygrip(['lkjasdf'])
    assert.equal(false, keys2.decrypt(hash))
  })

  it('should return false on bad inputs', function () {
    assert.equal(false, keys.decrypt(hash + 'asdf'))
  })
})

describe('keygrip([keys...])', function () {
  it('should sign a string', function () {
    // but we're going to use our list.
    // (note that the 'new' operator is optional)
    keylist = ["SEKRIT3", "SEKRIT2", "SEKRIT1"] // keylist will be modified in place, so don't reuse
    keys = Keygrip(keylist)
    testKeygripInstance(keys);
  })

  it('should sign a string with a different algorithm and encoding', function () {
    // now pass in a different hmac algorithm and encoding
    keylist = ["Newest", "AnotherKey", "Oldest"]
    keys = Keygrip(keylist)
    testKeygripInstance(keys);
  })
})

describe('Message encryption', function () {
  var length = 16
  var key = crypto.randomBytes(32)
  var keygrip = new Keygrip([key])

  describe('with iv', function () {
    var iv = crypto.randomBytes(length)
    var message = keygrip.encrypt('lol, have Σπ', iv)

    it('should encrypt and decrypt', function () {
      assert.equal('lol, have Σπ', keygrip.decrypt(message, iv)[0].toString('utf8'))
    })

    it('should return false on invalid key', function () {
      assert.equal(false, new Keygrip([crypto.randomBytes(32)])
        .decrypt(message, iv))
    })

    it('should return false on missing iv', function () {
      assert.equal(false, keygrip.decrypt(message))
    })

    it('should return false on invalid iv', function () {
      assert.equal(false, keygrip.decrypt(message, crypto.randomBytes(length)))
    })
  })

  describe('without iv', function () {
    var message = keygrip.encrypt('lol, have Σπ')

    it('should encrypt and decrypt', function () {
      assert.equal('lol, have Σπ', keygrip.decrypt(message)[0].toString('utf8'))
    })

    it('should return false on invalid key', function () {
      assert.equal(false, new Keygrip([crypto.randomBytes(32)])
        .decrypt(message))
    })

    it('should work on really long strings', function () {
      var string = ''
      for (var i = 0; i < 10000; i++) {
        string += 'a'
      }
      var msg = keygrip.encrypt(new Buffer(string))
      assert.equal(string, keygrip.decrypt(msg)[0].toString('utf8'))
    })
  })
})

function testKeygripInstance(keys) {
	hash = keys.sign("bieberschnitzel")

	// .index returns the index of the first matching key
	index = keys.indexOf("bieberschnitzel", hash)
	assert.equal(index, 0)

	// .verify returns the a boolean indicating a matched key
	var matched = keys.verify("bieberschnitzel", hash)
	assert.ok(matched)

	index = keys.indexOf("bieberschnitzel", "o_O")
	assert.equal(index, -1)

	// rotate a new key in, and an old key out
	keylist.unshift("SEKRIT4")
	keylist.pop()

	// if index > 0, it's time to re-sign
	index = keys.indexOf("bieberschnitzel", hash)
	assert.equal(index, 1)
	hash = keys.sign("bieberschnitzel")
}
