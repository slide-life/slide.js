var Form = function ($container, fields) {
  this.fields = fields;
  this.$container = $container;
};

Form.CARDS = ['slide.life:bank.card', 'slide.life:name'];

Form.createFromIdentifiers = function ($container, identifiers, cb) {
  Slide.Block.getFieldsForIdentifiers(identifiers, function (fields) {
    var form = new Form($container, fields);
    cb(form);
  });
};

Form.prototype.build = function (userData, onSubmit) {
  var self = this;

  this.userData = userData;
  this.$form = $('<ul></ul>', { 'class': 'slide-form' }).appendTo(this.$container);

  $.each(this.fields, function (identifier, field) {
    if (self._isCard(identifier)) {
      self.$form.append($('<li></li>', { class: 'card-wrapper' }).append(self.createCard(identifier, field)));
    } else {
      self.$form.append($('<li></li>', { class: 'compound-wrapper' }).append(self.createCompound(identifier, field)));
    }
  });

  this.$form.append(this._createSubmitButton(onSubmit));
  this.initializeSliders();
};

Form.prototype._createSubmitButton = function (onSubmit) {
  return $('<li></li>', {
    class: 'send-button'
  }).text('Send').on('click', onSubmit);
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
  var children = Slide.Block.getChildren(field),
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
  var path = Slide.Block.getPathForIdentifier(identifier);
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
    var path = Slide.Block.getPathForIdentifier(i);
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

export default Form;

