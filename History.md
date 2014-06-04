
2.0.0 / 2014-06-
==================

 * remove the `[algorithm]` option, use `.hash=` instead
 * remove the `[encoding]` option, `Buffer`s are now always returned
 * no longer returns any URL-safe hashes
 * add `.encrypt()`, `.decrypt()`, and `.cipher=`
 * default hash algorithm is now `sha256`
 * changed `.index()` to `.indexOf()`
