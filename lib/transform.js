'use strict';

var u = require('./util');

var defaultConversions = {
  'integer': parseInt,
  'number': parseFloat
};

// var baseType = function(type) {
//   var typeName = (typeOf(type) === 'string') ? type : type.type;
//   if (TYPES[typeName]) {
//     return baseType(TYPES[typeName])
//   } else {
//     return typeName;
//   }
// };

var defaultTransform = function(args) {
  // argsType: {conversions: 'conversions?', types: 'typeDefs?', type: 'typeDef', value: 'any'}
  // TODO COMPOSE:
  // nullifyEmpty
  // apply relevant conversions
  // set default value
};

var transformType = function(args) {
  // argsType: {defaultTransform: 'function?', types: 'typeSpec?', type: 'typeDef', value: 'any'}
  // TODO
  // apply typeDef.transform
  // or invoke defaultTransform
  return args;
};

var _mapStructure = function(path, structure, fn) {
  if (u.typeOf(structure) === 'object') {
    var result = {};
    Object.keys(structure).forEach(function(key) {
      var value = structure[key],
          newPath = path.concat([key]);
      // console.log("pm debug _mapStructure object ", i, key, value, newPath);
      if (u.isStructure(value)) {
        result[key] = _mapStructure(newPath, value, fn);
      } else {
        result[key] = fn(newPath, value);
      }
    });
    return result;
  } else if (u.typeOf(structure) === 'array') {
    var result = [];
    for (var i = 0; i < structure.length; ++i) {
      var value = structure[i],
          newPath = path.concat([i]);
      // console.log("pm debug _mapStructure array ", i, value, newPath);
      if (u.isStructure(value)) {
        result[i] = _mapStructure(newPath, value, fn);
      } else {
        result[i] = fn(newPath, value);
      }
    }
    return result;
  } else {
    throw new Error("The structure argument needs to be an object or an array");
  }
};

var mapStructure = function(structure, fn) {
  return _mapStructure([], structure, fn);
};

var transformStructure = function(args) {
  // argsType: {defaultTransform: 'function?', types: 'typeDefs?', structure: 'typeStructure', value: 'any'}
  return mapStructure(args.structure, function(path, typeSpec) {
    return transformType({defaultTransform: args.defaultTransform, types: args.types, type: typeSpec, value: u.getPath(path, args.value)});
  });
};

module.exports = {
  mapStructure: mapStructure,
  transformType: transformType,
  transformStructure: transformStructure
};
