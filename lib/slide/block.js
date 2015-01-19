var Block = {
  _retrieveField: function (wrapper, block, cb) {
    var field = wrapper.path.reduce(function (obj, key) {
      // TODO: check that key is set on object
      return obj[key];
    }, block.schema);

    var deferreds = [];

    if (field._components) {
      field._components.forEach(function (identifier) {
        var deferred = new $.Deferred();
        deferreds.push(deferred);
        Block._retrieveFieldFromIdentifier(identifier, function (f) {
          field[identifier.split('.').pop()] = f;
          deferred.resolve();
        });
      });
    }

    if (field._inherits) {
      var deferred = new $.Deferred();
      deferreds.push(deferred);
      Block._retrieveFieldFromIdentifier(field._inherits, function (f) {
        field = $.extend({}, f, field);

        f._assigns = f._assigns || [];
        f._assigns.push(wrapper.identifier);

        deferred.resolve();
      });
    }

    $.when.apply($, deferreds).done(function () {
      delete field._components;
      cb(field);
    });
  },

  getWrapperForIdentifier: function (identifier) {
    identifier = (identifier.indexOf(':') < 0) ? Slide.DEFAULT_ORGANIZATION + ':' + identifier : identifier;
    var deconstructed = identifier.split(':');
    return {
      organization: deconstructed[0],
      path: deconstructed[1].split('.'),
      identifier: identifier
    };
  },

  _retrieveBlocks: function (identifier, cb) {
    var wrapper = Block.getWrapperForIdentifier(identifier);
    if (Slide.CACHED_BLOCKS[wrapper.organization]) {
      cb(wrapper, Slide.CACHED_BLOCKS[wrapper.organization]);
    } else {
      $.get(Slide.endpoint('/blocks?organization=' + wrapper.organization), function (block) {
        cb(wrapper, block);
      });
    }
  },

  deconstructField: function (field) {
    var children = {},
        annotations = {};

    for (var key in field) {
      if (field.hasOwnProperty(key)) {
        if (key[0] === '_') {
          annotations[key] = field[key];
        } else {
          children[key] = field[key];
        }
      }
    }

    return { children: children, annotations: annotations };
  },

  getChildren: function (field) {
    return Block.deconstructField(field).children;
  },

  getAnnotations: function () {
    return Block.deconstructField(field).annotations;
  },

  _retrieveFieldFromIdentifier: function (identifier, cb) {
    Block._retrieveBlocks(identifier, function (wrapper, blocks) {
      Block._retrieveField(wrapper, blocks, function (field) {
        cb(field);
      });
    });
  },

  getFieldsForIdentifiers: function (identifiers, cb) {
    var fields = {},
        deferreds = [];

    identifiers.map(function (identifier) {
      var deferred = new $.Deferred();
      deferreds.push(deferred);
      Block._retrieveFieldFromIdentifier(identifier, function (field) {
        fields[identifier] = field;
        deferred.resolve();
      });
    });

    $.when.apply($, deferreds).done(function () {
      cb(fields);
    });
  }
};

export default Block;
