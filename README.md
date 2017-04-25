# keygrip

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Keygrip is a [node.js](http://nodejs.org/) module for signing and verifying data through a rotating credential system, in which new server keys can be added and old ones removed regularly, without invalidating client credentials.

## Install

    $ npm install keygrip

## API

### keys = Keygrip(keylist)

This creates a new Keygrip based on the provided `keylist`.

```javascript
var Keygrip = require('keygrip')
keys = Keygrip(["SEKRIT2", "SEKRIT1"])
```

The key list is an array of all valid keys for signing and encryption, in descending order of freshness. The tradeoff here is that adding more keys allows for more granular freshness for key validation, at the cost of a more expensive worst-case scenario for old or invalid payloads.

A key can be any arbitrary string or buffer, but it must be cryptographically secure. A secure random key can be generated using a command like `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Keygrip derives its own internal keys from the string inputs.

### var buf = keys.sign(data)

Creates a cryptographic signature for the provided `data` based on the _first_ key in the keylist.

### var bool = keys.verify(data, signature)

Verifies that the provided `signature` is valid for the `data` using any of the keys. Returns `true` or `false`.

### var index = keys.indexOf(data, signature)

This loops through all of the keys currently in the keylist until the digest of the current key matches the given digest, at which point the current index is returned. If no key is matched, `-1` is returned.

The idea is that if the index returned is greater than `0`, the data should be re-signed to prevent premature credential invalidation, and to enable better performance for subsequent challenges.

### var buf = keys.encrypt(message)

Creates an encrypted message as a buffer based on the _first_ key in the keylist.

### var [buf, i] = keys.decrypt(message)

Decrypts the message. If the message is valid, returns a buffer as `buf`. Also returns `i`, the index of the `key` used. Likewise, if `i !== 0`, you may want to re-encrypt the message to use the latest key.

If the message is invalid, `false` is returned.

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/keygrip.svg
[npm-url]: https://npmjs.org/package/keygrip
[node-version-image]: https://img.shields.io/node/v/keygrip.svg
[node-version-url]: http://nodejs.org/download/
[travis-image]: https://img.shields.io/travis/crypto-utils/keygrip/master.svg
[travis-url]: https://travis-ci.org/crypto-utils/keygrip
[coveralls-image]: https://img.shields.io/coveralls/crypto-utils/keygrip/master.svg
[coveralls-url]: https://coveralls.io/r/crypto-utils/keygrip?branch=master
[downloads-image]: https://img.shields.io/npm/dm/keygrip.svg
[downloads-url]: https://npmjs.org/package/keygrip
