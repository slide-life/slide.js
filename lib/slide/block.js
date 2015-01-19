var Block = {
  _retrieveField: function (path, block, cb) {
    var field = path.hierarchy.reduce(function (obj, key) {
      // TODO: check that key is set on object
      return obj[key];
    }, block.schema);

    var deferreds = [];

    if (field._components) {
      field._components.map(Block.getPathForIdentifier).forEach(function (componentPath) {
        var deferred = new $.Deferred();
        deferreds.push(deferred);

        Block._retrieveFieldFromPath(componentPath, function (f) {
          field[componentPath.hierarchy.pop()] = f;
          deferred.resolve();
        });
      });
    }

    if (field._inherits) {
      var componentPath = Block.getPathForIdentifier(field._inherits);
      field._inherits = componentPath.identifier;

      var deferred = new $.Deferred();
      deferreds.push(deferred);

      Block._retrieveFieldFromPath(componentPath, function (f) {
        field = $.extend(f, field);

        f._assigns = f._assigns || [];
        f._assigns.push(path.identifier);

        deferred.resolve();
      });
    }

    $.when.apply($, deferreds).done(function () {
      delete field._components;
      cb(field);
    });
  },

  getPathForIdentifier: function (identifier) {
    identifier = (identifier.indexOf(':') < 0) ? Slide.DEFAULT_ORGANIZATION + ':' + identifier : identifier;
    var deconstructed = identifier.split(':');
    return {
      organization: deconstructed[0],
      hierarchy: deconstructed[1].split('.'),
      identifier: identifier
    };
  },

  _retrieveBlock: function (path, cb) {
    if (Slide.CACHED_BLOCKS[path.organization]) {
      cb(Slide.CACHED_BLOCKS[path.organization]);
    } else {
      $.get(Slide.endpoint('/blocks?organization=' + path.organization), function (block) {
        cb(block);
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

  getAnnotations: function (field) {
    return Block.deconstructField(field).annotations;
  },

  _retrieveFieldFromPath: function (path, cb) {
    Block._retrieveBlock(path, function (block) {
      Block._retrieveField(path, block, function (field) {
        cb(field);
      });
    });
  },

  getFieldsForIdentifiers: function (identifiers, cb) {
    var fields = {},
        deferreds = [],
        paths = identifiers.map(Block.getPathForIdentifier);

    paths.map(function (path) {
      var deferred = new $.Deferred();
      deferreds.push(deferred);
      Block._retrieveFieldFromPath(path, function (field) {
        fields[path.identifier] = field;
        deferred.resolve();
      });
    });

    $.when.apply($, deferreds).done(function () {
      cb(fields);
    });
  }
};

export default Block;
