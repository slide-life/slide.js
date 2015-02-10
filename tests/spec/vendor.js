//TODO: everything

require('../mocks');
var assert = require('assert');
var Slide = require('../../build/slide').default;

describe('Vendor', function () {
  before(function (done) {
  });
});

describe('Card', function () {
  before(function (done) {
    pathsToTest = {
      phoneNumber: 'a.a:home-phone',
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

  describe('#_retrieveBlock()', function () {
    it('should get a cached block', function (done) {
      Slide.Block._retrieveBlock(pathsToTest.phoneNumber, function (block) {
        assert.equal(block.organization, pathsToTest.phoneNumber.organization);
        done();
      });
    });

    it('should fetch block when not cached', function (done) {
      Slide.Block._retrieveBlock(pathsToTest.slideLifeDriversLicense, function (block) {
        assert.equal(block.organization, pathsToTest.slideLifeDriversLicense.organization);
        done();
      });
    });
  });

  describe('#_resolve()', function () {
    it('should resolve a simple field', function (done) {
      Slide.Block._resolve(pathsToTest.address, function (hierarchy, block) {
        assert.equal(JSON.stringify(hierarchy), JSON.stringify(['base', 'address', 'line']));
        assert.equal(JSON.stringify(block), JSON.stringify(Slide.Block.CACHED_BLOCKS['a.a']));
        done();
      });
    });

    it('should resolve an inherited field', function (done) {
      Slide.Block._resolve(pathsToTest.personalAddress, function (hierarchy, block) {
        assert.equal(JSON.stringify(hierarchy), JSON.stringify(['base', 'address', 'line']));
        assert.equal(JSON.stringify(block), JSON.stringify(Slide.Block.CACHED_BLOCKS['a.a']));
        done();
      });
    });

    it('should resolve a component', function (done) {
      Slide.Block._resolve(pathsToTest.personalPhone, function (hierarchy, block) {
        assert.equal(JSON.stringify(hierarchy), JSON.stringify(['base', 'phone-number', 'extension']));
        assert.equal(JSON.stringify(block), JSON.stringify(Slide.Block.CACHED_BLOCKS['a.a']));
        done();
      });
    });

    it('should resolve a component/inherits chain', function (done) {
      Slide.Block._resolve(pathsToTest.personalRefPhone, function (hierarchy, block) {
        assert.equal(JSON.stringify(hierarchy), JSON.stringify(['base', 'phone-number', 'extension']));
        assert.equal(JSON.stringify(block), JSON.stringify(Slide.Block.CACHED_BLOCKS['a.a']));
        done();
      });
    });

    it('should resolve a foreign inherited field', function (done) {
      Slide.Block._resolve(pathsToTest.foreignPhone, function (hierarchy, block) {
        assert.equal(JSON.stringify(hierarchy), JSON.stringify(['base', 'phone-number', 'extension']));
        assert.equal(JSON.stringify(block), JSON.stringify(Slide.Block.CACHED_BLOCKS['b.b']));
        done();
      });
    });
  });

  describe('#_resolveField()', function () {
    it('should resolve a field', function (done) {
      Slide.Block._resolveField(pathsToTest.personalRefPhone, function (field) {
        assert.equal(JSON.stringify(field), JSON.stringify(Slide.Block.CACHED_BLOCKS['a.a'].schema['base']['phone-number']['extension']));
        done();
      });
    });
  });

  describe('#_retrieveField()', function () {
    it('should retrieve a simple field', function (done) {
      Slide.Block._retrieveField(pathsToTest.address, function (field) {
        assert.equal(field._description, Slide.Block.CACHED_BLOCKS['a.a'].schema['base']['address']['line']._description);
        done();
      });
    });

    it('should retrieve a component', function (done) {
      Slide.Block._retrieveField(pathsToTest.personalPhone, function (field) {
        assert.equal(field._description, Slide.Block.CACHED_BLOCKS['a.a'].schema['base']['phone-number']['extension']._description);
        done();
      });
    });

    it('should retrieve an inherited field', function (done) {
      Slide.Block._retrieveField(pathsToTest.personalAddress, function (field) {
        assert.equal(field._description, Slide.Block.CACHED_BLOCKS['a.a'].schema['base']['address']['line']._description);
        done();
      });
    });
  });

  describe('#getFieldsForIdentifiers()', function () {
    it('should retrieve all fields', function (done) {
      identifiers = [pathsToTest.personalPhone, pathsToTest.personalRefPhone, pathsToTest.foreignPhone].map(function (x) { return x.identifier; });
      Slide.Block.getFieldsForIdentifiers(identifiers, function (fields) {
        identifiers.forEach(function (identifier) {
          assert.equal(fields[identifier]._description, 'extension');
        });
        done();
      });
    });
  });
});
