require('../monkey-patches');
var assert = require('assert');
var Slide = require('../../build/slide').default;

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

  describe('checksum tests', function () {
    var vendor;

    before(function (done) {
      var vendorName = "Vendor" + Math.floor(Math.random() * 10000);
      Slide.Vendor.invite(vendorName, function(v) {
        v.register(function(v) {
          vendor = v;
          done();
        });
      });
    });

    describe('.getProfile()', function () {
      it('should get profile for valid checksum', function (done) {
        vendor.getProfile(function (profile) {
          assert.equal(profile.error, undefined);
          done();
        });
      });

      describe("login", function(done) {
        var vendor2;
        before(function (done) {
          var vendorName = "Vendor" + Math.floor(Math.random() * 10000);
          Slide.Vendor.invite(vendorName, function(v) {
            v.register(function(v) {
              vendor2 = v;
              done();
            });
          });
        });

        it('should not get profile for invalid checksum', function (done) {
          delete vendor2.checksum;
          vendor2.getProfile(function (profile) {
            assert.equal(profile.error, undefined);
            done();
          });
        });
      });
    });

    describe('.getUsers()', function () {
      it.skip('should display users for valid checksum', function (done) {
      });

      it.skip('should not display users for invalid checksum', function (done) {
      });
    });
  });

});

