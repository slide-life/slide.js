var API = require('../utils/api');
var Crypto = require('../utils/crypto');
var Form = require('./form');

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
  vendor.keys = obj.keys || {};
  vendor.keys.public = vendor.keys.public || obj.key;
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

Vendor.create = function (name, domain, schema, cbs) {
  var keys = new Vendor().keys;
  API.post('/vendors', {
    data: {
      domain: domain,
      key: keys.public,
      schema: schema,
      name: name
    },
    success: function (v) {
      // vendor.apiKey = apiKey;
      var vendor = Vendor.fromObject(v);
      vendor.keys = keys;
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

Vendor.prototype.getForms = function (cbs) {
  API.get('/vendors/' + this.id + '/forms', cbs);
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

