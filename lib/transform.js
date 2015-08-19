'use strict';

var u = require('./util'),
    _baseType = require('./types').baseType,
    parseSpec = require('./types').spec.parse;

var conversions = {
  'string-integer': parseInt,
  'string-number': parseFloat,
  'string-date': function(v) { return new Date(v); }
};

var setDefaultValue = u.curry(function(defaultValue, value) {
  if (defaultValue !== undefined && u.isNil(value)) {
    return defaultValue;
  } else {
    return value;
  }
});

var typeConvert = u.curry(function(baseType, typeDef, value) {
  var key = [u.typeOf(value), baseType].join('-'),
      conversion = conversions[key];
  if (conversion && !u.empty(value)) {
    return conversion(value);
  } else {
    return value;
  }
});

var defaultBaseTransform = function(value, options) {
  // argsType: ['any', {types: 'typeDefs?', type: 'typeDef|typeName'}]
  var typeDef = (u.typeOf(options.type) === 'string' ? options.types[options.type] : options.type);
  if (!typeDef) return value;
  var transform = u.compose(
    setDefaultValue(typeDef.default),
    typeConvert(_baseType(options.types, typeDef), typeDef),
    u.nullifyEmpty
  );
  return transform(value);
};

var transformType = function(args) {
  // argsType: {baseTransform: 'function?', types: 'typeDefs?', typeSpec: 'typeSpec?', value: 'any'}
  var typeNames = parseSpec(args.typeSpec, {validate: false}).typeNames;
  var typeName = u.find(typeNames, function(name) {
    return args.types && args.types[name];
  });
  var typeDef = typeName && args.types[typeName];
  if (typeDef) {
    var _baseTransform = args.baseTransform || defaultBaseTransform;
    var transform = u.pipe(u.compact([typeDef.transform, _baseTransform]));
    return transform(args.value, {types: args.types, type: typeDef});
  } else {
    return args.value;
  }
};

var _mapStructure = function(path, structure, fn) {
  if (u.typeOf(structure) === 'object') {
    var result = {};
    Object.keys(structure).forEach(function(key) {
      var value = structure[key],
          newPath = path.concat([key]);
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
  // argsType: {baseTransform: 'function?', types: 'typeDefs?', structure: 'typeStructure', value: 'any'}
  return mapStructure(args.structure, function(path, typeSpec) {
    return transformType({baseTransform: args.baseTransform, types: args.types, typeSpec: typeSpec, value: u.getPath(path, args.value)});
  });
};

module.exports = {
  setDefaultValue: setDefaultValue,
  typeConvert: typeConvert,
  defaultBaseTransform: defaultBaseTransform,
  transformType: transformType,
  mapStructure: mapStructure,
  transformStructure: transformStructure
};
