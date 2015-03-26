try { env; } catch (e) { env = {}; }
if( env.TARGET != 'browser' ) {
  forge = require('node-forge');
}

exports = module.exports = {
  RSA: require('./crypto/rsa')(forge),
  AES: require('./crypto/aes')(forge)
};
