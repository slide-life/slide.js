var assert = require('assert');
exports = module.exports = function (Slide) {
  describe('Vendor', function () {
    describe('#invite()', function () {
      it('should invite vendors', function (done) {
        var vendorName = "Vendor" + Math.floor(Math.random() * 10000);
        Slide.Vendor.invite(vendorName, function(vendor) {
          assert.equal(vendor.name, vendorName);
          done();
        });
      });
    });

    describe('#register()', function () {
      it('should be able to redeem vendor invites', function (done) {
        var vendorName = "Vendor" + Math.floor(Math.random() * 10000);
        Slide.Vendor.invite(vendorName, function(vendor) {
          vendor.register(function(vendor) {
            assert.equal(vendor.name, vendorName);
            done();
          });
        });
      });
    });

  });
};

