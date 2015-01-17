import Crypto from './slide/crypto';
import Actor from './slide/actor';
import Conversation from './slide/conversation';
import User from './slide/user';

$('body').append('<div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="modal-label" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title text-center" id="modal-label">slide</h4></div><div class="modal-body"></div></div></div></div>');

var Slide = {
  host: 'api-sandbox.slide.life',

  endpoint: function(/* protocol, */ path) {
    if( arguments.length > 1 ) {
      return arguments[0] + Slide.host + arguments[1];
    } else {
      return 'http://' + Slide.host + path;
    }
  },

  crypto: new Crypto(),
  Actor: Actor,
  Conversation: Conversation,
  User: User,

  extractBlocks: function (form) {
    return form.find('*').map(function () {
      return $(this).attr('data-slide');
    }).toArray();
  },

  populateFields: function (form, fields, sec) {
    form.find('*').each(function () {
      var field = $(this).attr('data-slide');
      if (!!field && fields[field]) {
        $(this).val(fields[field]);
      }
    });
  },

  getBlocks: function (cb) {
    $.ajax({
      type: 'GET',
      url: 'http://' + Slide.host + '/blocks',
      contentType: 'application/json',
      success: cb
    });
  }
};

window.Slide = Slide;

