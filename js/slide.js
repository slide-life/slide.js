import Crypto from './slide/crypto';
import Actor from './slide/actor';
import Conversation from './slide/conversation';
import User from './slide/user';
import Block from './slide/block';
import Vendor from './slide/vendor';
import Form from './slide/form';

var Slide = {
  HOST: 'api-sandbox.slide.life',
  DEFAULT_ORGANIZATION: 'slide.life',
  CACHED_BLOCKS: {},

  crypto: new Crypto(),
  Actor: Actor,
  Conversation: Conversation,
  User: User,
  Block: Block,
  Vendor: Vendor,
  Form: Form,

  endpoint: function(/* protocol, */ path) {
    if( arguments.length > 1 ) {
      return arguments[0] + Slide.HOST + arguments[1];
    } else {
      return 'http://' + Slide.HOST + path;
    }
  },

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

  presentModalFormFromIdentifiers: function (identifiers, userData) {
    if (!this._modal) {
      this._modal = $('<div class="slide-modal"></div>');
      var header = $('<div class="slide-modal-header"></div>').append('<h2>Fill with slide</h2>');
      this._modal.append(header, '<div class="slide-modal-body"></div>');
      this._modal.appendTo($('body'));
    }

    var modal = this._modal;
    this.Form.createFromIdentifiers(modal.find('.slide-modal-body'), identifiers, function (form) {
      form.build(userData, {
        onSubmit: function () {
          console.log(form.serialize());
          console.log(form.getUserData());
        }
      });
      modal.show();
      $(window).trigger('resize');
    });
  }
};

window.Slide = Slide;

