const crypto = require('node:crypto');

if (typeof crypto.hash !== 'function') {
  crypto.hash = (algorithm, data, outputEncoding = 'hex') =>
    crypto.createHash(algorithm).update(data).digest(outputEncoding);
}
