var Slide = require('../../lib/slide');

var Initializers = {
  VENDOR_NAME: 'name',
  VENDOR_DOMAIN: 'd.d',
  VENDOR_SCHEMA: {
    'phone-number': {
      '_description': 'phone number',
      'extension': {
        '_description': 'extension'
      }
    }
  },
  SMS_TEST_NUMBER: '18575762052',
  USER_PASSWORD: 'test_password_123',
  CONVERSATION_NAME: 'test',

  vendor: function (cb) {
    Slide.Vendor.create(Initializers.VENDOR_NAME,
                  Initializers.VENDOR_DOMAIN,
                  Initializers.VENDOR_SCHEMA,
                  { success: cb });
  },
  user: function (cb) {
    Slide.User.create(new Slide.Identifier.Phone(Initializers.SMS_TEST_NUMBER),
                      Initializers.USER_PASSWORD,
                      { success: cb });
  },
  actor: function (cb) {
    Slide.Actor.create({ success: cb });
  },
  converse: function (a, b, cb) {
    a.createRelationship(b, {
      success: function (rel) {
        rel.createConversation(Initializers.CONVERSATION_NAME,
                               { success: cb });
      }
    });
  }
};

exports = module.exports = Initializers;
