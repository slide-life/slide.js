GLOBAL.window = {location: {search: '', href: '', pathname: ''}};
GLOBAL.$ = require('jquery')(require('jsdom').jsdom().parentWindow);
GLOBAL.forge = require('node-forge');

GLOBAL.btoa = function (string) {
  return new Buffer(string).toString('base64');
};

GLOBAL.atob = function (string) {
  return new Buffer(string, 'base64').toString('ascii');
};

var Slide = require('../build/slide').default;
require('./spec/user')(Slide);
