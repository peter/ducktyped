'use strict';

var u = require('./util'),
    TypeSpec = require('./type_spec'),
    TypeName = require('./type_name'),
    containsType = TypeSpec.containsType;

var metaTypes = {
  typeStructure: {
    type: 'object|array',
    valueType: 'typeStructure|typeName'
  },
  typeName: {
    type: 'string',
    validate: function(v, options) {
      return TypeName.validate(options.types, v);
    }
  },
  type: {
    type: 'object',
    validate: function(v) {
      if (v.attributes && !containsType(v.type, 'object')) {
        return {errors: ['Only object types can have attributes']};
      } else if (v.valueType && !(containsType(v.type, 'object') || containsType(v.type, 'array'))) {
        return {errors: ['Only object and array types can have valueType']};
      } else {
        return true;
      }
    },
    attributes: {
      type: 'typeSpec',
      valueType: 'typeSpec',
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
  } else if (args.types && u.typeOf(args.type) === 'string') {
    typeDef = args.types[args.type];
  }
  var typeSpec = TypeSpec.parse(typeDef ? typeDef.type : args.type);
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
  metaTypes: metaTypes,
  isType: isType
};
