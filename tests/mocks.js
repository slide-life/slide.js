GLOBAL.window = {location: {search: '', href: '', pathname: ''}};
GLOBAL.$ = require('jquery')(require('jsdom').jsdom().parentWindow);
GLOBAL.$.ajax = require('najax');
GLOBAL.forge = require('../bower_components/forge/js/forge.js');
GLOBAL.WebSocket = require('ws');

GLOBAL.btoa = function (string) {
  return new Buffer(string).toString('base64');
};

GLOBAL.atob = function (string) {
  return new Buffer(string, 'base64').toString('utf8');
};

if( module.parent == require.main ) {
  module.parent.setup();
}

