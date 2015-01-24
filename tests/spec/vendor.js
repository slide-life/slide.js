require('../mocks');
var assert = require('assert');
var Slide = require('../../build/slide').default;

describe('Vendor', function () {
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
    var vendor, vendor2;

    before(function (done) {
      var vendorName = "Vendor" + Math.floor(Math.random() * 10000);
      Slide.Vendor.invite(vendorName, function(v) {
        v.register(function(v) {
          vendor = v;

          var vendorName = "Vendor" + Math.floor(Math.random() * 10000);
          Slide.Vendor.invite(vendorName, function(v) {
            v.register(function(v) {
              vendor2 = v;
              done();
            });
          });
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
    });

    describe('.getUsers()', function () {
      it('should display users for valid checksum', function (done) {
        vendor.getUsers(function (users) {
          assert.notEqual(users, undefined);
          done();
        });
      });

      it.skip('should not display users for invalid checksum', function (done) {
      });
    });

    describe('.createForm()', function () {
      it.skip('should create a form', function (done) {
      });
    });

    describe('.loadForms()', function () {
      it.skip('should load its vendor forms', function (done) {
      });
    });
  });

  describe('model tests', function () {
    var v, uuid;

    before(function (done) {
      vendor(function (vendor) {
        v = vendor;
        user(function (user) {
          Slide.VendorUser.createRelationship(user, vendor, function (vendorUser) {
            uuid = vendorUser.uuid;
            done();
          });
        });
      });
    });

    describe('.getUsers()', function () {
      it('should display the correct users', function (done) {
        v.getUsers(function (users) {
          assert.notEqual(users.map(function (x) { return x.uuid; }).indexOf(uuid), -1);
          done();
        });
      });
    });
  });

});

