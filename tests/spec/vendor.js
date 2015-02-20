var assert = require('assert');
var Slide = require('../../lib/slide');
var Initializers = require('./_initializers');

describe('Vendor', function () {
  var vendor;

  before(function (done) {
    Initializers.vendor(function (v) {
      vendor = v;
      done();
    });
  });

  describe('#create()', function () {
    it('should create a vendor', function (done) {
      Initializers.vendor(function (v) {
        assert.equal(v.name, Initializers.VENDOR_NAME);
        done();
      });
    });
  });

  describe('.createForm()', function () {
    it('should create a form', function (done) {
      vendor.createForm('test', 'test', ['d.d:phone-number'], {
        success: function (form) {
          assert(form.id);
          done();
        }
      });
    });
  });

  describe('.getForms()', function () {
    it('should get forms', function (done) {
      vendor.createForm('test', 'test', ['d.d:phone-number'], {
        success: function (form) {
          vendor.getForms({
            success: function (forms) {
              assert.notEqual(forms.length, 0);
              done();
            }
          });
        }
      });
    });
  });

  describe('.getResponses()', function () {
    it('should get responses to forms', function (done) {
      Initializers.user(function (user) {
        Initializers.converse(user, vendor, function (conversation) {
          conversation.request(user, ['d.d:phone-number'], {
            success: function (request) {
              conversation.respond(request, {
                'd.d:phone-number': 'test'
              }, {
                success: function (response) {
                  vendor.getAllResponses({
                    success: function (data) {
                      var responses = data.responses[0];
                      assert.equal(responses['d.d:phone-number'], 'test');
                      done();
                    }
                  });
                }
              });
            }
          });
        });
      });
    });
  });
});

describe('Card', function () {
  before(function (done) {
    pathsToTest = {
      phoneNumber: 'a.a:phone-number',
      address: 'a.a:base.address.line',
      personalAddress: 'a.a:personal.address.line',
      personalPhone: 'a.a:personal.phone-number.extension',
      personalRefPhone: 'a.a:personal-ref.phone-number.extension',
      foreignPhone: 'a.a:personal-bb.phone-number.extension',
      idCard: 'a.a:id-card',
      driversLicense: 'a.a:drivers-license',
      slideLifeDriversLicense: 'slide.life:drivers-license'
    };
    for (var key in pathsToTest) {
      pathsToTest[key] = Slide.Card.getPathForField(pathsToTest[key]);
    }

    Slide.Card.CACHED_CARDS['a.a'] = {
      schema: {
        'base': {
          'address': {
            '_description': 'address',
            'line': {
              '_description': 'test'
            }
          },
          'phone-number': {
            '_description': 'phone number',
            'extension': {
              '_description': 'extension'
            }
          }
        },
        'personal': {
          '_components': ['a.a:base.phone-number'],
          'address': {
            '_inherits': 'a.a:base.address'
          }
        },
        'personal-bb': {
          '_inherits': 'b.b:base'
        },
        'personal-ref': {
          '_inherits': 'a.a:personal'
        }
      }
    };
    Slide.Card.CACHED_CARDS['b.b'] = {
      schema: {
        'base': {
          'address': {
            '_description': 'test',
            'line': {
              '_description': 'test'
            }
          },
          'phone-number': {
            '_description': 'phone number',
            'extension': {
              '_description': 'extension'
            }
          }
        }
      }
    };

    done();
  });

  describe('Slide.Card', function () {
    it('should resolve a type', function (done) {
      Slide.Card._resolve(Slide.Card.getPathForField('slide.life:bank.card'), function(hierarchy, card) {
        assert.equal(hierarchy[0], 'bank');
        assert.equal(hierarchy[1], 'card');
        done();
      });
    });
  });

  describe('#_retrieveField()', function () {
    it('should fetch block when not cached', function (done) {
      Slide.Card._retrieveField(pathsToTest.slideLifeDriversLicense, function (block) {
        assert.equal(block._description, 'Drivers license');
        done();
      });
    });
  });

  describe('#_resolve()', function () {
    it('should resolve a simple field', function (done) {
      Slide.Card._resolve(pathsToTest.address, function (hierarchy, block) {
        assert.equal(JSON.stringify(hierarchy), JSON.stringify(['base', 'address', 'line']));
        assert.equal(JSON.stringify(block), JSON.stringify(Slide.Card.CACHED_CARDS['a.a']));
        done();
      });
    });

    it('should resolve an inherited field', function (done) {
      Slide.Card._resolve(pathsToTest.personalAddress, function (hierarchy, block) {
        assert.equal(JSON.stringify(hierarchy), JSON.stringify(['base', 'address', 'line']));
        assert.equal(JSON.stringify(block), JSON.stringify(Slide.Card.CACHED_CARDS['a.a']));
        done();
      });
    });

    it('should resolve a component', function (done) {
      Slide.Card._resolve(pathsToTest.personalPhone, function (hierarchy, block) {
        assert.equal(JSON.stringify(hierarchy), JSON.stringify(['base', 'phone-number', 'extension']));
        assert.equal(JSON.stringify(block), JSON.stringify(Slide.Card.CACHED_CARDS['a.a']));
        done();
      });
    });

    it('should resolve a component/inherits chain', function (done) {
      Slide.Card._resolve(pathsToTest.personalRefPhone, function (hierarchy, block) {
        assert.equal(JSON.stringify(hierarchy), JSON.stringify(['base', 'phone-number', 'extension']));
        assert.equal(JSON.stringify(block), JSON.stringify(Slide.Card.CACHED_CARDS['a.a']));
        done();
      });
    });

    it('should resolve a foreign inherited field', function (done) {
      Slide.Card._resolve(pathsToTest.foreignPhone, function (hierarchy, block) {
        assert.equal(JSON.stringify(hierarchy), JSON.stringify(['base', 'phone-number', 'extension']));
        assert.equal(JSON.stringify(block), JSON.stringify(Slide.Card.CACHED_CARDS['b.b']));
        done();
      });
    });
  });

  describe('#_retrieveField()', function () {
    it('should retrieve a simple field', function (done) {
      Slide.Card._retrieveField(pathsToTest.address, function (field) {
        assert.equal(field._description, Slide.Card.CACHED_CARDS['a.a'].schema['base']['address']['line']._description);
        done();
      });
    });

    it('should retrieve a component', function (done) {
      Slide.Card._retrieveField(pathsToTest.personalPhone, function (field) {
        assert.equal(field._description, Slide.Card.CACHED_CARDS['a.a'].schema['base']['phone-number']['extension']._description);
        done();
      });
    });

    it('should retrieve an inherited field', function (done) {
      Slide.Card._retrieveField(pathsToTest.personalAddress, function (field) {
        assert.equal(field._description, Slide.Card.CACHED_CARDS['a.a'].schema['base']['address']['line']._description);
        done();
      });
    });
  });

  describe('#getFieldsForIdentifiers()', function () {
    it('should retrieve all fields', function (done) {
      identifiers = [pathsToTest.personalPhone, pathsToTest.personalRefPhone, pathsToTest.foreignPhone].map(function (x) { return x.field; });
      Slide.Card.getSchemasForFields(identifiers, function (fields) {
        identifiers.forEach(function (identifier) {
          assert.equal(fields[identifier]._description, 'extension');
        });
        done();
      });
    });
  });
});
