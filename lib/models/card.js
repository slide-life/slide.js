var API = require('../utils/api');
var extend = require('util')._extend;
var Q = require('q');

var DEFAULT_ORGANIZATION = 'slide.life';

function Card (vendorId) {
  this.vendorId = vendorId;
}

Card.CACHED_CARDS = {};

Card.fromObject = function (obj) {
  var card = new Card(obj.id);
  card.schema = obj.schema;
  return card;
};

Card.get = function (vendorDomain, cbs) {
  if (Card.CACHED_CARDS[vendorDomain]) {
    cbs.success(Card.CACHED_CARDS[vendorDomain]);
  } else {
    require('./vendor').getByDomain(vendorDomain, {
      //this require() avoids circular dependency and is completely necessary.
      success: function (vendor) {
        Card.CACHED_CARDS[vendorDomain] = vendor.card;
        cbs.success(Card.CACHED_CARDS[vendorDomain]);
      },
      failure: cbs.failure
    });
  }
};

Card._inherits = function (fieldSchema) {
  if ('_inherits' in fieldSchema) {
    return [fieldSchema._inherits];
  } else {
    return [];
  }
};

Card._components = function (fieldSchema) {
  if ('_components' in fieldSchema) {
    return fieldSchema._components;
  } else {
    return [];
  }
};

Card._pathOf = function (fieldName) {
  if (fieldName.indexOf(':') > -1) {
    return fieldName.split(':')[1];
  } else {
    return fieldName;
  }
};

Card._separatePath = function (pathString) {
  return pathString.split('.');
};

Card._componentName = function (fieldName) {
  return Card._separatePath(Card._pathOf(fieldName)).pop();
};

Card._isRoot = function (inheritance) {
  return inheritance[inheritance.length - 1] === ':';
};

Card._resolveForField = function (field, cb) {
  Card._resolve(Card.getPathForField(field), cb);
};

Card._resolve = function (path, cb) {
  Card.get(path.organization, {
    failure: function(err) {
      console.log('err', err);
    },
    success: function (card) {
      var hierarchy = path.hierarchy;
      var remainingPath = hierarchy.slice(0);
      var fieldSchema = card.schema;

      while (remainingPath[0] in fieldSchema) {
        fieldSchema = fieldSchema[remainingPath[0]];
        remainingPath = remainingPath.slice(1);
      }

      if (remainingPath.length === 0) {
        cb(hierarchy, card);
      } else {
        var nexts = Card._inherits(fieldSchema).concat(Card._components(fieldSchema));
        Card._inherits(fieldSchema).forEach(function (inheritance) {
          var inheritanceField;
          if (Card._isRoot(inheritance)) {
            inheritanceField = inheritance + remainingPath.join('.');
          } else {
            inheritanceField = [inheritance].concat(remainingPath).join('.');
          }

          Card._resolveForField(inheritanceField, cb);
        });

        Card._components(fieldSchema).filter(function (component) {
          return Card._componentName(component) === remainingPath[0];
        }).forEach(function (component) {
          var inheritanceField =
            [component].concat(remainingPath.slice(1)).join('.');
          Card._resolveForField(inheritanceField, cb);
        });
      }
    }
  });
};

Card._resolveFieldSchema = function (path, cb) {
  Card._resolve(path, function (resultHierarchy, resultCard) {
    cb(resultHierarchy.reduce(function (obj, key) { return obj[key]; },
                              resultCard.schema));
  });
};

Card._retrieveField = function (path, cb) {
  Card._resolveFieldSchema(path, function (fieldSchema) {
    var deferreds = [];

    if (fieldSchema._components) {
      fieldSchema._components.map(Card.getPathForField).forEach(function (componentPath) {
        var deferred = Q.defer();
        deferreds.push(deferred);

        Card._retrieveField(componentPath, function (f) {
          fieldSchema[componentPath.hierarchy.pop()] = f;
          deferred.resolve();
        });
      });
    }

    if (fieldSchema._inherits) {
      var inheritPath = Card.getPathForField(fieldSchema._inherits);

      var deferred = Q.defer();
      deferreds.push(deferred);

      Card._retrieveField(inheritPath, function (f) {
        fieldSchema = extend(extend({}, f), fieldSchema);
        deferred.resolve();
      });
    }

    Q.all(deferreds).done(function () {
      delete fieldSchema._components;
      delete fieldSchema._inherits;
      cb(fieldSchema);
    });
  });
};

Card.getPathForField = function (field) {
  field = (field.indexOf(':') < 0) ? DEFAULT_ORGANIZATION + ':' + field : field;
  var deconstructed = field.split(':');
  return {
    organization: deconstructed[0],
    hierarchy: deconstructed[1].split('.'),
    field: field
  };
};

Card.deconstructField = function (fieldSchema) {
  var children = {},
  annotations = {};

  for (var key in fieldSchema) {
    if (fieldSchema.hasOwnProperty(key)) {
      if (key[0] === '_') {
        annotations[key] = fieldSchema[key];
      } else {
        children[key] = fieldSchema[key];
      }
    }
  }

  return { children: children, annotations: annotations };
};

Card.normalizeField = function (field) {
  var path = Card.getPathForField(field);
  var scope = path.organization.split('.').reverse();
  return scope.concat(path.hierarchy).join('.');
};

Card.getChildren = function (fieldSchema) {
  return Card.deconstructField(fieldSchema).children;
};

Card.getAnnotations = function (fieldSchema) {
  return Card.deconstructField(fieldSchema).annotations;
};

Card.flattenField = function (field, fieldSchema) {
  var children = Card.getChildren(fieldSchema);
  if (Object.keys(children).length > 0) {
    return Object.keys(children).reduce(function (merged, id) {
      return $.extend(merged, Card.flattenField(field + '.' + id, fieldSchema[id]));
    }, {});
  } else {
    var leaf = {};
    leaf[field] = fieldSchema;
    return leaf;
  }
};

Card.getFlattenedSchemasForFields = function (fields, cb) {
  Card.getSchemasForFields(fields, function (unflattenedSchemas) {
    var fields = {};
    $.each(unflattenedSchemas, function (field, fieldSchema) {
      $.extend(fields, Card.flattenField(field, fieldSchema));
    });
    cb(fields);
  });
};

Card.getSchemasForFields = function (fields, cb) {
  var schemas = {},
    deferreds = [],
    paths     = fields.map(Card.getPathForField);

  paths.forEach(function (path) {
    Card._retrieveField(path, function (fieldSchema) {
      schemas[path.field] = fieldSchema;
      if( Object.keys(schemas).length == paths.length ) {
        cb(schemas);
      }
    });
  });
};

exports = module.exports = Card;
