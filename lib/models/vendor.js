var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Actor = require('./actor');
var Card = require('./card');

function Vendor (id) {
  this.profile      = this._generateProfile();
  this.keys         = this._generateKeys();
  this.id           = id;
};

Vendor.prototype = Object.create(Actor.prototype);

Vendor.fromObject = function (obj) {
  var vendor = new Vendor(obj.id);
  vendor.keys = {};
  vendor.keys.public = obj.key;
  vendor.card = Card.fromObject(obj);
  return vendor;
};

Vendor.invite = function (name, domain, cbs) {
  API.post('/admin/vendors', {
    data: {
      name: name,
      domain: domain
    },
    success: cbs.success,
    failure: cbs.failure
  });
};

Vendor.create = function (id, apiKey, schema, cbs) {
  var vendor = new Vendor(id);
  API.put('/vendors/' + id, {
    data: {
      api_key: apiKey,
      key: vendor.keys.public,
      schema: schema
    },
    success: function (v) {
      vendor.apiKey = apiKey;
      vendor.card   = Card.fromObject(v.card);
      cbs.success(vendor);
    },
    failure: cbs.failure
  });
};

Vendor.getByDomain = function (domain, cbs) {
  API.get('/vendors', {
    data: {
      domain: domain
    },
    success: function (v) {
      cbs.success(Vendor.fromObject(v));
    },
    failure: cbs.failure
  });
};

exports = module.exports = Vendor;

