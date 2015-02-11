var API;
if( typeof module === 'undefined' ) {
  API = require('./api/browser.js');
} else {
  API = require('./api/node.js');
}

exports = module.exports = new API();
