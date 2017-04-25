"use strict";

var crypto = require('crypto')
var assert = require('assert')
var Keygrip = require('..')

describe('Keygrip(keys)', function() {
  it('should throw if keys are missing or empty', function() {
    assert.throws(function() {
      new Keygrip(/* empty list */)
    }, /must be provided/)
  })
})

describe('Keygrip([key])', function() {
  var keygrip, data

  before(function() {
    keygrip = Keygrip(['abc'])
    data = "abcdeföäå"
  })

  it('should sign a string', function() {
    var signature = keygrip.sign(data)
    assert.ok(keygrip.verify(data, signature), 'should be OK with valid signature')

    signature[2] ^= 1 << 2 // flip a bit
    assert.ok(!keygrip.verify(data, signature), 'should fail with invalid signature')
  })

  it('should encrypt a message', function() {
    var ciphertext = keygrip.encrypt(data)
    assert.deepEqual(keygrip.decrypt(ciphertext)[0].toString('utf8'), data, 'valid ciphertext should decrypt to same plaintext')

    ciphertext[42] ^= 1 << 2 // flip a bit
    assert.deepEqual(keygrip.decrypt(ciphertext), false, 'malformed ciphertext should return false')
    assert.deepEqual(keygrip.decrypt(new Buffer("abc", 'ascii')), false, 'garbage ciphertext should return false')
  })

  it('should create an unique ciphertext every time', function() {
    var one = keygrip.encrypt(data)
    var two = keygrip.encrypt(data)
    assert.notDeepEqual(one, two, 'two ciphertexts should not be the same')
  })

  it('should return the index of signing keys', function() {
    var keygrip = Keygrip(["one"])
    var signature = keygrip.sign("hello")
    assert.deepEqual(keygrip.indexOf("hello", signature), 0, 'key index should be zero')

    keygrip = new Keygrip(["two", "one"])
    assert.deepEqual(keygrip.index("hello", signature), 1, 'key index should be one')

    assert.deepEqual(keygrip.indexOf("invalid", new Buffer(32)), -1, 'key index should be -1')
  })

  it('should return the index of decryption keys', function() {
    var keygrip = Keygrip(["one"])
    var ciphertext = keygrip.encrypt("hello")
    assert.deepEqual(keygrip.decrypt(ciphertext)[1], 0, 'key index should be zero')

    keygrip = Keygrip(["two", "one"])
    assert.deepEqual(keygrip.decrypt(ciphertext)[1], 1, 'key index should be one')
  })
})
