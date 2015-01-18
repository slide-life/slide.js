function flatMap (xs, fn) {
  return xs.reduce(function(a, b) {
    return a.concat(fn(b));
  }, []);
}

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

  _retrieveBlocks: function (identifier, cb) {
    if (identifier.indexOf(':') === -1) {
      identifier = Slide.DEFAULT_ORGANIZATION + ':' + identifier;
    }

    var i = identifier.split(':'),
        wrapper = { organization: i[0], path: i[1].split('.'), identifier: identifier };

    if (Slide.CACHED_BLOCKS[wrapper.organization]) {
      cb(wrapper, Slide.CACHED_BLOCKS[wrapper.organization]);
    } else {
      $.get(Slide.endpoint('/blocks?organization=' + wrapper.organization), function (block) {
        cb(wrapper, block);
      });
    }
  },

  _flattenField: function (field) {
    var children = [],
        annotations = {};

    for (var key in field) {
      if (field.hasOwnProperty(key)) {
        if (key[0] === '_') {
          annotations[key] = field[key];
        } else {
          children.push(field[key]);
        }
      }
    }

    if (children.length > 0) {
      return flatMap(children, Block._flattenField); // Ignore the parent
    } else {
      return [annotations]; // On a leaf
    }
  },

  _retrieveFieldFromIdentifier: function (identifier, cb) {
    Block._retrieveBlocks(identifier, function (wrapper, blocks) {
      Block._retrieveField(wrapper, blocks, function (field) {
        cb(field);
      });
    });
  },

  getFieldsForIdentifiers: function (identifiers, cb) {
    var fields = [],
        deferreds = [];

    identifiers.map(function (identifier) {
      var deferred = new $.Deferred();
      deferreds.push(deferred);
      Block._retrieveFieldFromIdentifier(identifier, function (field) {
        fields.push(field);
        deferred.resolve();
      });
    });

    $.when.apply($, deferreds).done(function () {
      cb(fields);
    });
  },

  getFlattenedFieldsForIdentifiers: function (identifiers, cb) {
    Block.getFieldsForIdentifiers(identifiers, function (fields) {
      cb(flatMap(fields, Block._flattenField));
    });
  }
};

export default Block;
