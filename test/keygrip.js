"use strict";

var assert = require("assert")
var Keygrip = require('..')

describe('Keygrip', function () {
  describe('constructor', function () {
    it('should construct new instance', function () {
      var keys = new Keygrip(['SEKRIT1'])

      assert.ok(keys)
      assert.ok(keys instanceof Keygrip)
    })

    it('should work without new keyword', function () {
      var keys = Keygrip(['SEKRIT1'])

      assert.ok(keys)
      assert.ok(keys instanceof Keygrip)
    })
  })

  describe('"keys" argument', function () {
    describe('when undefined', function () {
      it('should throw an Error', function () {
        var keys

        assert.throws(function () { keys = new Keygrip() },
          /Keys must be provided/)
        assert.ok(!keys)
      })
    })

    describe('when empty array', function () {
      it('should throw an Error', function () {
        var keys

        assert.throws(function () { keys = new Keygrip([]) },
          /Keys must be provided/)
        assert.ok(!keys)
      })
    })

    describe('when array of strings', function () {
      it('should construct object', function () {
        var keys = new Keygrip(['SEKRIT1'])

        assert.ok(keys)
        assert.ok(keys instanceof Keygrip)
      })
    })
  })

  describe('.index(data)', function () {
    it('should return key index that signed data', function () {
      var keys = new Keygrip(['SEKRIT2', 'SEKRIT1'])
      var data = 'Keyboard Cat has a hat.'

      assert.strictEqual(keys.index(data, '_jl9qXYgk5AgBiKFOPYK073FMEQ'), 0)
      assert.strictEqual(keys.index(data, '34Sr3OIsheUYWKL5_w--zJsdSNk'), 1)
    })

    it('should return -1 when no key matches', function () {
      var keys = new Keygrip(['SEKRIT2', 'SEKRIT1'])
      var data = 'Keyboard Cat has a hat.'

      assert.strictEqual(keys.index(data, 'xmM8HQl2eBtPP9nmZ7BK_wpqoxQ'), -1)
    })

    describe('with "algorithm"', function () {
      it('should return key index using algorithm', function () {
        var keys = new Keygrip(['SEKRIT1'], 'sha256')
        var data = 'Keyboard Cat has a hat.'

        assert.strictEqual(keys.index(data, 'pu97aPRZRLKi3-eANtIlTG_CwSc39mAcIZ1c6FxsGCk'), 0)
      })
    })

    describe('with "encoding"', function () {
      it('should return key index using encoding', function () {
        var keys = new Keygrip(['SEKRIT1'], null, 'hex')
        var data = 'Keyboard Cat has a hat.'

        assert.strictEqual(keys.index(data, 'df84abdce22c85e51858a2f9ff0fbecc9b1d48d9'), 0)
      })
    })
  })

  describe('.sign(data)', function () {
    it('should sign a string', function () {
      var keys = new Keygrip(['SEKRIT1'])
      var hash = keys.sign('Keyboard Cat has a hat.')

      assert.strictEqual(hash, '34Sr3OIsheUYWKL5_w--zJsdSNk')
    })

    it('should sign with first secret', function () {
      var keys = new Keygrip(['SEKRIT2', 'SEKRIT1'])
      var hash = keys.sign('Keyboard Cat has a hat.')

      assert.strictEqual(hash, '_jl9qXYgk5AgBiKFOPYK073FMEQ')
    })

    describe('with "algorithm"', function () {
      it('should return signature using algorithm', function () {
        var keys = new Keygrip(['SEKRIT1'], 'sha256')
        var hash = keys.sign('Keyboard Cat has a hat.')

        assert.strictEqual(hash, 'pu97aPRZRLKi3-eANtIlTG_CwSc39mAcIZ1c6FxsGCk')
      })
    })

    describe('with "encoding"', function () {
      it('should return signature in encoding', function () {
        var keys = new Keygrip(['SEKRIT1'], null, 'hex')
        var hash = keys.sign('Keyboard Cat has a hat.')

        assert.strictEqual(hash, 'df84abdce22c85e51858a2f9ff0fbecc9b1d48d9')
      })
    })
  })

  describe('.verify(data)', function () {
    it('should validate against any key', function () {
      var keys = new Keygrip(['SEKRIT2', 'SEKRIT1'])
      var data = 'Keyboard Cat has a hat.'

      assert.ok(keys.verify(data, '_jl9qXYgk5AgBiKFOPYK073FMEQ'))
      assert.ok(keys.verify(data, '34Sr3OIsheUYWKL5_w--zJsdSNk'))
    })

    it('should fail with bogus data', function () {
      var keys = new Keygrip(['SEKRIT2', 'SEKRIT1'])
      var data = 'Keyboard Cat has a hat.'

      assert.ok(!keys.verify(data, 'bogus data'))
    })

    it('should fail when key not present', function () {
      var keys = new Keygrip(['SEKRIT2', 'SEKRIT1'])
      var data = 'Keyboard Cat has a hat.'

      assert.ok(!keys.verify(data, 'xmM8HQl2eBtPP9nmZ7BK_wpqoxQ'))
    })

    describe('with "algorithm"', function () {
      it('should validate using algorithm', function () {
        var keys = new Keygrip(['SEKRIT1'], 'sha256')
        var data = 'Keyboard Cat has a hat.'

        assert.ok(keys.verify(data, 'pu97aPRZRLKi3-eANtIlTG_CwSc39mAcIZ1c6FxsGCk'))
      })
    })

    describe('with "encoding"', function () {
      it('should validate using encoding', function () {
        var keys = new Keygrip(['SEKRIT1'], null, 'hex')
        var data = 'Keyboard Cat has a hat.'

        assert.ok(keys.verify(data, 'df84abdce22c85e51858a2f9ff0fbecc9b1d48d9'))
      })
    })
  })
})
