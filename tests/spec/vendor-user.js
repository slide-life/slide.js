var Crypto = require('../../build/slide/crypto.js').default;

var assert = require('assert');
exports = module.exports = function (Slide) {
  describe('User', function () {

    function user(cb) {
      var number = "" + Math.floor(Math.random() * 1e7);
      Slide.User.register(number, cb);
    }

    function vendor(cb) {
      var vendorName = "Vendor" + Math.floor(Math.random() * 10000);
      Slide.Vendor.invite(vendorName, function(vendor) {
        vendor.register(cb);
      });
    }

    describe('.createRelationship(user, vendor)', function () {
      it('the encryption mechanism of a relationship should be derivable by vendor', function (done) {
        user(function(user) {
          vendor(function(vendor) {
            Slide.VendorUser.createRelationship(user, vendor, function(vendorUser) {
              var retry = Crypto.AES.decryptKey(Crypto.AES.encryptKey(
                vendorUser.generatedKey, vendor.publicKey), vendor.privateKey);
              var vendorDerivedKey = Crypto.AES.decryptKey(
                vendorUser.vendor_key, vendor.privateKey);
              assert.equal(vendorDerivedKey, retry);
              // NB: .generatedKey is not transmitted
              var key = vendorUser.generatedKey;
              done();
            });
          });
        });
      });
    });

  });
};

