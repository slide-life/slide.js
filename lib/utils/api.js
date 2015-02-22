var API;
if (env.TARGET == 'browser') {
  API = require('./api/browser.js');
} else {
  API = require('./api/node.js');
}

exports = module.exports = new API();
