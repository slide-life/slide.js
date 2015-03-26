var Slide = {
  Actor: require('./models/actor'),
  User: require('./models/user'),
  Vendor: require('./models/vendor'),
  Identifier: require('./models/identifier'),
  Relationship: require('./models/relationship'),
  Conversation: require('./models/conversation'),
  Message: require('./models/message'),
  Card: require('./models/card')
};

exports = module.exports = Slide;
try { env; } catch (e) { env = {} }
if( env.TARGET == 'browser' ) {
  window.Slide = Slide;
}

