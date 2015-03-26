function API () {}

HOST = env.HOST || 'localhost:9292';

API.prototype = {
  endpoint: function (/* protocol, */ path) {
    if (arguments.length > 1) {
      return arguments[0] + HOST + arguments[1];
    } else {
      return 'http://' + HOST + path;
    }
  },

  _escapeQueryString: function (qs) {
    if (qs) {
      for (var k in qs) {
        qs[k] = (qs[k].toString() || '').replace(/=/g, '*');
      }
    }
  }
};

exports = module.exports = API;
