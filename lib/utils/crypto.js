if( env.TARGET == 'node' ) {
  forge = require('node-forge');
}

exports = module.exports = {
  RSA: require('./crypto/rsa')(forge),
  AES: require('./crypto/aes')(forge)
};
