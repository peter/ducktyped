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
        return false;
      } else if (v.valueType && !(spec.containsType(v.type, 'object') || spec.containsType(v.type, 'array'))) {
        return false;
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
    if (spec.isOptional(typeSpec)) {
      result.optional = true;
      typeSpec = spec.typeName(typeSpec);
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
  },

  isOptional: function(typeSpec) {
    return typeSpec.indexOf('?') === (typeSpec.length-1);
  },

  typeName: function(typeOrSpec) {
    var typeSpec = (u.typeOf(typeOrSpec) === 'object' ? typeOrSpec.type : typeOrSpec);
    if (spec.isOptional(typeSpec)) {
      return typeSpec.substring(0, typeSpec.length-1);
    } else {
      return typeSpec;
    }
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
  var optional = false;
  if (u.typeOf(args.type) === 'object') {
    typeDef = args.type;
  } else if (u.typeOf(args.type) === 'string') {
    optional = spec.isOptional(args.type);
    typeDef = lookup(args.types, spec.typeName(args.type));
  } else {
    throw new Error("Please specify a type argument that is either a string (typeSpec) or an object (type)");
  }
  if (typeDef && !typeDef.type) typeDef.type = 'any';
  if (u.typeOf(args.type) === 'string' && spec.typeName(args.type) === 'any') return true;
  var typeSpec = spec.parse((typeDef ? typeDef.type : args.type), {types: args.types});
  if (optional && u.isNil(args.value)) return true;
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
      return u.typeOf(args.value) === spec.typeName(args.type);
    }
  }
};

var isStructure = function(args) {
  // assertStructure({types: ['type'], structure: 'typeStructure', value: 'any'}, args);
  if (u.typeOf(args.structure) === 'object') {
    var keys = Object.keys(args.structure);
    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i],
          v = args.value[key];
      if (u.typeOf(args.structure[key]) === 'string') {
        if (!isType({types: args.types, type: args.structure[key], value: v})) {
          return false;
        }
      } else {
        if (!isStructure({types: args.types, structure: args.structure[key], value: v})) {
          return false;
        }
      }
    }
    return true;
  } else if (u.typeOf(args.structure) === 'array') {
    if (u.typeOf(args.value) === 'array') {
      for (var i = 0; i < args.value.length; ++i) {
        var v = args.value[i];
        if (u.typeOf(args.structure[0]) === 'string') {
          if (!isType({types: args.types, type: args.structure[0], value: v})) {
            return false;
          }
        } else {
          if (!isStructure({types: args.types, structure: args.structure[0], value: v})) {
            return false;
          }
        }
      }
      return true;
    } else {
      return false;
    }
  } else {
    throw new Error("The structure argument needs to be an object or an array containing type specs (strings)");
  }
};

module.exports = {
  basicTypes: basicTypes,
  metaTypes: metaTypes,
  validateName: validateName,
  lookup: lookup,
  spec: spec,
  isType: isType,
  isStructure: isStructure
};
