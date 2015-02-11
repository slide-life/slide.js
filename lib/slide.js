var Slide = {
  Actor: require('./models/actor'),
  User: require('./models/user'),
  Vendor: require('./models/vendor'),
  Identifier: require('./models/identifier'),
  Relationship: require('./models/relationship'),
  Card: require('./models/card')
};

exports = module.exports = Slide;
if( env.TARGET == 'browser' ) {
  window.Slide = Slide;
}

