import Block from './block';

function deepCompare () {
  var i, l, leftChain, rightChain;

  function compare2Objects (x, y) {
    var p;

    // remember that NaN === NaN returns false
    // and isNaN(undefined) returns true
    if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
         return true;
    }

    // Compare primitives and functions.
    // Check if both arguments link to the same object.
    // Especially useful on step when comparing prototypes
    if (x === y) {
        return true;
    }

    // Works in case when functions are created in constructor.
    // Comparing dates is a common scenario. Another built-ins?
    // We can even handle functions passed across iframes
    if ((typeof x === 'function' && typeof y === 'function') ||
       (x instanceof Date && y instanceof Date) ||
       (x instanceof RegExp && y instanceof RegExp) ||
       (x instanceof String && y instanceof String) ||
       (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
    }

    // At last checking prototypes as good a we can
    if (!(x instanceof Object && y instanceof Object)) {
        return false;
    }

    if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
        return false;
    }

    if (x.constructor !== y.constructor) {
        return false;
    }

    if (x.prototype !== y.prototype) {
        return false;
    }

    // Check for infinitive linking loops
    if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
         return false;
    }

    // Quick checking of one object beeing a subset of another.
    // todo: cache the structure of arguments[0] for performance
    for (p in y) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }
    }

    for (p in x) {
        if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
        }
        else if (typeof y[p] !== typeof x[p]) {
            return false;
        }

        switch (typeof (x[p])) {
            case 'object':
            case 'function':

                leftChain.push(x);
                rightChain.push(y);

                if (!compare2Objects (x[p], y[p])) {
                    return false;
                }

                leftChain.pop();
                rightChain.pop();
                break;

            default:
                if (x[p] !== y[p]) {
                    return false;
                }
                break;
        }
    }

    return true;
  }

  if (arguments.length < 1) {
    return true; //Die silently? Don't know how to handle such case, please help...
    // throw "Need two or more arguments to compare";
  }

  for (i = 1, l = arguments.length; i < l; i++) {

      leftChain = []; //Todo: this can be cached
      rightChain = [];

      if (!compare2Objects(arguments[0], arguments[i])) {
          return false;
      }
  }

  return true;
}

var Form = function ($container, fields) {
  this.fields = fields;
  this.$container = $container;
};

Form.CARDS = ['slide.life:bank.card', 'slide.life:name'];

Form.createFromIdentifiers = function ($container, identifiers, cb) {
  Block.getFieldsForIdentifiers(identifiers, function (fields) {
    var form = new Form($container, fields);
    cb(form);
  });
};

Form.prototype.build = function (userData, options) {
  var self = this;

  this.userData = userData;
  this.options = options;
  this.$form = $('<ul></ul>', { 'class': 'slide-form' }).appendTo(this.$container);

  $.each(this.fields, function (identifier, field) {
    if (self._isCard(identifier)) {
      self.$form.append($('<li></li>', { class: 'card-wrapper' }).append(self.createCard(identifier, field)));
    } else {
      self.$form.append($('<li></li>', { class: 'compound-wrapper' }).append(self.createCompound(identifier, field)));
    }
  });

  this.$form.append(this._createSubmitButton());
  this.initializeSliders();
};

Form.prototype._createSubmitButton = function () {
  return $('<li></li>', {
    class: 'send-button'
  }).text('Send').on('click', this.options.onSubmit);
};

Form.prototype.initializeSliders = function () {
  $('.slider').slick({
    slide: 'li',
    arrows: false,
    focusOnSelect: true
  });
};

Form.prototype._isCard = function (identifier) {
  return Form.CARDS.indexOf(identifier) !== -1;
};

Form.prototype._flattenField = function (identifier, field) {
  var children = Block.getChildren(field),
      self = this;

  if (Object.keys(children).length > 0) {
    return Object.keys(children).reduce(function (merged, id) {
      return $.extend(merged, self._flattenField(identifier + '.' + id, field[id]));
    }, {});
  } else {
    var leaf = {};
    leaf[identifier] = field;
    return leaf;
  }
};

Form.prototype._getDataForIdentifier = function (identifier) {
  var path = Block.getPathForIdentifier(identifier);
  return this.userData[path.identifier] || [];
};

Form.prototype._createSlider = function (fields) {
  var slider = $('<ul></ul>', { class: 'slider'});
  return slider.append.apply(slider, fields);
},

Form.prototype._createField = function (identifier, field, data, options /* = {} */) {
  options = options || {};

  var listItem = $('<li></li>', { class: 'field' }),
      $labelWrapper = $('<div></div>', { 'class': 'field-label-wrapper' }),
      $inputWrapper = $('<div></div>', { 'class': 'field-input-wrapper' });

  var input = $('<input>', $.extend({
    type: 'text',
    class: 'field-input',
    value: data,
    autocorrect: 'off',
    autocapitalize: 'off',
    'data-slide-identifier': identifier
  }, options));

  $inputWrapper.append(input);
  $labelWrapper.append($('<label></label>').text(field._description));
  return listItem.append($labelWrapper, $inputWrapper);
};

Form.prototype._parseRepresentation = function (identifier, field, card) {
  var self = this,
      data;

  if (field._representation) {
    data = [field._representation.replace(/\$\{([^}]+)\}/g, function ($0, $1) {
      return card[identifier + '.' + $1];
    })];
  }

  return data;
};

Form.prototype.createCard = function (identifier, field) {
  var self = this;
  var cards = this._getDataForIdentifier(identifier).map(function (card) {
    var $cardHeader = self.createCardHeader(identifier, field, card);
    var $cardSubfields = self.createCardSubfields(identifier, field, card);
    var $card = $('<li></li>', { class: 'card' }).append($cardHeader, $cardSubfields);

    $card.on('click', '.card-header', function (e) {
      $card.parent().find('.card-subfields').slideToggle();
    });

    return $card;
  });

  return this._createSlider(cards);
};

Form.prototype.createCardHeader = function (identifier, field, card) {
  var representation = this._parseRepresentation(identifier, field, card);
  var $header = $('<ul></ul>', { class: 'field-group card-header' });
  return $header.append(this._createField(identifier, field, representation, { readonly: true }));
};

Form.prototype.createCardSubfields = function (identifier, field, card) {
  var fields = this._flattenField(identifier, field);
  var compound = [], self = this;

  $.each(fields, function (i, f) {
    var path = Block.getPathForIdentifier(i);
    compound.push(self._createField(i, f, card[i]));
  });

  var $subfields = $('<ul></ul>', { class: 'field-group card-subfields' });
  return $subfields.append.apply($subfields, compound);
};

Form.prototype.createCompound = function (identifier, field) {
  var fields = this._flattenField(identifier, field);
  var compound = [], self = this;

  $.each(fields, function (i, f) {
    var data = self._getDataForIdentifier(i);
    var fs;

    if (data.length > 0) {
      fs = data.map(function (d) {
        return self._createField(i, f, d);
      });
    } else {
      fs = [self._createField(i, f, '')];
    }

    var slider = self._createSlider(fs);
    compound.push($('<li></li>').append(slider));
  });

  var $fieldGroup = $('<ul></ul>', { class: 'field-group' });
  return $fieldGroup.append.apply($fieldGroup, compound);
};

Form.prototype._getFieldsInElement = function ($element, multi /* = false */) {
  multi = multi !== undefined;

  var $fields = $element.find('.field-input'),
      keystore = {};

  $fields.each(function () {
    var key = $(this).data('slide-identifier'),
        value = $(this).val();

    if (multi) {
      keystore[key] = keystore[key] || [];
      keystore[key].push(value);
    } else {
      keystore[key] = value;
    }
  });

  return keystore;
};

Form.prototype._getFieldsForSelector = function (selector, multi /* = false */) {
  return this._getFieldsInElement(this.$form.find(selector), multi);
};

Form.prototype.serialize = function () {
  var cardFieldsSelector = '.card.slick-active .card-subfields';
  var compoundFieldsSelector = '.compound-wrapper .slick-active';

  var keystore = this._getFieldsForSelector([cardFieldsSelector, compoundFieldsSelector].join(', '));

  return JSON.stringify(keystore);
};

Form.prototype.getUserData = function () {
  var compoundData = this._getFieldsForSelector('.compound-wrapper .field:not(.slick-cloned)', true);
  var cardData = {},
      self = this;

  this.$form.find('.card-wrapper').each(function (card) {
    var key = $(this).find('.card .card-header .field-input').data('slide-identifier');
    cardData[key] = [];
    $(this).find('.card:not(.slick-cloned) .card-subfields').each(function () {
      cardData[key].push(self._getFieldsInElement($(this)));
    });
  });

  return $.extend(cardData, compoundData);
};

Form.prototype.getPatchedUserData = function () {
  var profile = this.userData;
  var updated = this.getUserData();
  var patch = {};

  $.each(profile, function (identifier, key) {
    if (!deepCompare(profile[identifier], updated[identifier])) {
      patch[identifier] = updated[identifier];
    }
  });

  return patch;
};

export default Form;