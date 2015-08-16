'use strict';

var u = require('./util');

var basicTypes = ['null', 'undefined', 'string', 'number', 'boolean', 'object', 'array', 'function', 'date', 'regexp'];

var metaTypes = {
  typeStructure: {
    type: 'object|array',
    valueType: 'typeStructure|typeName'
  },
  typeName: {
    type: 'string',
    validate: function(v, options) {
      return validateName(options.types, v);
    }
  },
  type: {
    type: 'object',
    validate: function(v) {
      if (v.attributes && !spec.containsType(v.type, 'object')) {
        return {errors: ['Only object types can have attributes']};
      } else if (v.valueType && !(spec.containsType(v.type, 'object') || spec.containsType(v.type, 'array'))) {
        return {errors: ['Only object and array types can have valueType']};
      } else {
        return true;
      }
    },
    attributes: {
      type: 'typeSpec',
      valueType: 'typeSpec?',
      validate: 'function?',
      default: 'any?',
      attributes: 'object?'
    }
  },
  typeSpec: {
    type: 'typeName|unionTypeSpec|intersectionTypeSpec'
  },
  unionTypeSpec: {
    type: 'string',
    validate: function(v, options) {
      return u.contains('|', v) && !u.contains('&', v) && u.all(v.split('|'), function(typeName) {
        return metaTypes.typeName.validate(typeName, options);
      });
    }
  },
  intersectionTypeSpec: {
    type: 'string',
    validate: function(v, options) {
      return u.contains('&', v) && !u.contains('|', v) && u.all(v.split('&'), function(typeName) {
        return metaTypes.typeName.validate(typeName, options);
      });
    }
  }
};

var validateName = function(types, typeName) {
  return u.contains(typeName, basicTypes) ||
    typeName === 'any' ||
    u.contains(typeName, Object.keys(metaTypes)) ||
    u.contains(typeName, Object.keys(types || {}));
};

var lookup = function(types, typeName) {
  return (types && types[typeName]) || metaTypes[typeName];
};

var spec = {
  parse: function(typeSpec, options) {
    options = options || {};
    if (options.validate === undefined) options.validate = true;
    if (u.typeOf(typeSpec) !== 'string') return null;
    var result = {},
        validTypeName = validateName.bind(null, options.types);
    if (typeSpec.indexOf('?') === (typeSpec.length-1)) {
      result.optional = true;
      typeSpec = typeSpec.substring(0, typeSpec.length-1);
    }
    if (u.contains('|', typeSpec)) {
      result.typeNames = typeSpec.split('|');
      result.operator = 'any';
    } else if (u.contains('&', typeSpec)) {
      result.typeNames = typeSpec.split('&');
      result.operator = 'all';
    } else {
      result.typeNames = [typeSpec];
    }
    if (options.validate && !u.all(result.typeNames, validTypeName)) return null;
    return result;
  },

  containsType: function(typeSpec, typeName) {
    var parsed = spec.parse(typeSpec, {validate: false});
    return parsed && u.contains(typeName, parsed.typeNames);
  }
};

var matchAttributes = function(args) {
  // assertStructure({types: ['type'], attributes: 'object', value: 'any'}, args);
  return (u.typeOf(args.value) === 'object') && u.all(Object.keys(args.attributes), function(attribute) {
    return isType({types: args.types, type: args.attributes[attribute], value: args.value[attribute]});
  });
};

var matchValueType = function(args) {
  // assertStructure({types: ['type'], valueType: 'typeSpec', value: 'any'}, args);
  var arrayMatch = (u.typeOf(args.value) === 'array') && u.all(args.value, function(v) {
    return isType({types: args.types, type: args.valueType, value: v});
  });
  var objectMatch = (u.typeOf(args.value) === 'object') && u.all(u.objectValues(args.value), function(v) {
    return isType({types: args.types, type: args.valueType, value: v});
  });
  return arrayMatch || objectMatch;
};

var isType = function(args) {
  // assertStructure({types: ['type'], type: 'type|typeSpec', value: 'any'}, args);
  var typeDef = null;
  if (u.typeOf(args.type) === 'object') {
    typeDef = args.type;
  } else if (u.typeOf(args.type) === 'string') {
    typeDef = lookup(args.types, args.type);
  } else {
    throw new Error("Please specify a type argument that is either a string (typeSpec) or an object (type)");
  }
  if (args.type === 'any') return true;
  var typeSpec = spec.parse(typeDef ? typeDef.type : args.type);
  if (typeSpec.optional && u.isNil(args.value)) return true;
  if (typeDef) {
    return (typeDef.type == null || isType({types: args.types, type: typeDef.type, value: args.value})) &&
      (typeDef.validate == null || typeDef.validate(args.value, {types: args.types})) &&
      (typeDef.attributes == null || matchAttributes({types: args.types, attributes: typeDef.attributes, value: args.value})) &&
      (typeDef.valueType == null || matchValueType({types: args.types, valueType: typeDef.valueType, value: args.value}));
  } else {
    if (typeSpec && typeSpec.operator === 'any') {
      return u.any(typeSpec.typeNames, function(t) {
        return isType({types: args.types, type: t, value: args.value});
      });
    } else if (typeSpec && typeSpec.operator === 'all') {
      return u.all(typeSpec.typeNames, function(t) {
        return isType({types: args.types, type: t, value: args.value});
      });
    } else {
      return u.typeOf(args.value) === args.type;
    }
  }
};

module.exports = {
  basicTypes: basicTypes,
  metaTypes: metaTypes,
  validateName: validateName,
  lookup: lookup,
  spec: spec,
  isType: isType
};