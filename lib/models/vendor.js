var API = require('../utils/api');
var Crypto = require('../utils/crypto');

var Actor = require('./actor');
var Card = require('./card');
var Form = require('./form');

function Vendor () {
  this.profile      = this._generateProfile();
  this.keys         = this._generateKeys();
};

Vendor.prototype = Object.create(Actor.prototype);

Vendor.fromObject = function (obj) {
  var vendor = new Vendor();
  vendor.id = obj.id;
  vendor.keys = {};
  vendor.keys.public = obj.key;
  vendor.card = Card.fromObject(obj);
  return vendor;
};

Vendor.prototype.toObject = function () {
  var obj = {};

  [
    'id',
    'keys',
    'profile',
    'relationships',
    'name',
    'domain'
  ].forEach(function (prop) {
    obj[prop] = this[prop];
  });

  obj.schema = this.card.schema;

  return obj;
};

Vendor.create = function (name, domain, schema, cbs) {
  var vendor = new Vendor();
  API.post('/vendors', {
    data: {
      name: name,
      domain: domain,
      schema: schema,
      key: vendor.keys.public
    },
    success: function (v) {
      vendor.id = v.id;
      vendor.name = v.name;
      vendor.domain = v.domain;
      vendor.card = Card.fromObject(v);
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

Vendor.prototype.createForm = function (name, description, fields, cbs) {
  API.post('/vendors/' + this.id + '/forms', {
    data: {
      name: name,
      description: description,
      form_fields: fields
    },
    success: function (f) {
      var form = Form.fromObject(f);
      cbs.success(form);
    },
    failure: cbs.failure
  });
};

Vendor.prototype.getForms = function (cbs) {
  var self = this;

  API.get('/vendors/' + this.id + '/forms', {
    success: function (fs) {
      var forms = fs.map(Form.fromObject);
      forms.forEach(function (f) { f.vendor = self; });
      cbs.success(forms);
    },
    failure: cbs.failure
  });
};

Vendor.prototype.getResponses = function (query, cbs) {
  var self = this;

  API.get('/vendors/' + this.id + '/responses', {
    data: query,
    success: function (encryptedData) {
      var responses = encryptedData.responses;
      var decryptedResponses = responses.map(function (response) {
        var symkey = response.key;
        var decryptedSymkey = self.decryptKey(symkey);
        return Crypto.AES.decryptData(response.data, decryptedSymkey);
      });
      var decryptedData = { fields: encryptedData.fields, responses: decryptedResponses };
      cbs.success(decryptedData);
    },
    failure: cbs.failure
  });
};

Vendor.prototype.getAllResponses = function (cbs) {
  this.getResponses({}, cbs);
};

Vendor.prototype.getResponsesForForm = function (form, cbs) {
  this.getResponses({
    fields: form.fields
  }, cbs);
};

exports = module.exports = Vendor;

