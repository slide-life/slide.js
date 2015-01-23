require('../monkey-patches');
var assert = require('assert');
var Crypto = require('../../build/slide/crypto.js').default;
var Slide = require('../../build/slide').default;

describe('VendorUser', function () {
  var _user, _vendor;
  function user(cb) {
    var number = "" + Math.floor(Math.random() * 1e7);
    if( !_user ) {
      Slide.User.register(number, function(user) {
        _user = user;
        cb && cb(user);
      });
    } else {
      cb(_user);
    }
  }

  function vendor(cb) {
    var vendorName = "Vendor" + Math.floor(Math.random() * 10000);
    if( !_vendor ) {
      Slide.Vendor.invite(vendorName, function(vendor) {
        vendor.register(function(vendor) {
          _vendor = vendor;
          cb && cb(vendor);
        });
      });
    } else {
      cb(_vendor);
    }
  }

  describe('user and vendor auth', function() {
    user();
    vendor();
  });

  describe('.createRelationship(user, vendor)', function () {
    it('the encryption mechanism of a relationship should be derivable by vendor', function (done) {
      user(function(user) {
        vendor(function(vendor) {
          Slide.VendorUser.createRelationship(user, vendor, function(vendorUser) {
            // NB: .generatedKey is not transmitted
            var retry = Crypto.AES.decryptKey(Crypto.AES.encryptKey(
              vendorUser.generatedKey, vendor.publicKey), vendor.privateKey);
            var pk = Crypto.AES.prettyKey(vendorUser.vendorKey);
            var vendorDerivedKey = Crypto.AES.decryptKey(
              vendorUser.vendorKey, vendor.privateKey);
            assert.equal(vendorDerivedKey, retry);
            done();
          });
        });
      });
    });
  });

});

