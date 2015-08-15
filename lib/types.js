'use strict';

var u = require('lib/util'),
    toString = Object.prototype.toString;

var basicTypes = ['null', 'undefined', 'string', 'number', 'boolean', 'object', 'array', 'function', 'date', 'regexp'];

var typeList = function(typeSpec) {
  if (typeSpec.indexOf('|') > -1) {
    return typeSpec.split('|');
  } else if (typeSpec.indexOf('&') > -1) {
    return typeSpec.split('&');
  } else {
    return [typeSpec];
  }
};

var containsType = function(typeSpec, typeName) {
  return u.contains(typeList(typeSpec), typeName);
};

var internalTypes = {
  typeStructure: {
    type: 'object|array',
    valueType: 'typeStructure|typeName'
  },
  typeName: {
    type: 'string',
    validate: function(v, options) {
      return u.contains(v, basicTypes) || u.contains(v, Object.keys(options.types || {}));
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
        return internalTypes.typeName.validate(typeName, options);
      });
    }
  },
  intersectionTypeSpec: {
    type: 'string',
    validate: function(v, options) {
      return u.contains('&', v) && !u.contains('|', v) && u.all(v.split('&'), function(typeName) {
        return internalTypes.typeName.validate(typeName, options);
      });
    }
  }
};

var typeOf = function(value) {
  var type = typeof value;
  if (type === 'object') {
    if (value === null) {
      type = 'null';
    } else if (value === undefined) {
      type = 'undefined';
    } else if ((typeof value.length === 'number') && toString.call(value) === '[object Array]') {
      type = 'array';
    } else if (toString.call(value) === '[object Date]') {
      type = 'date';
    } else if (toString.call(value) === '[object RegExp]') {
      type = 'regexp';
    }
  }
  return type;
};

var matchAttributes = function(args) {
  // assertStructure({types: ['type'], attributes: 'object', value: 'any'}, args);
  return (typeOf(args.value) === 'object') && u.all(Object.keys(args.attributes), function(attribute) {
    return isType({types: args.types, type: args.attributes[attribute], value: args.value[attribute]});
  });
};

var matchValueType = function(args) {
  // assertStructure({types: ['type'], valueType: 'typeSpec', value: 'any'}, args);
  var arrayMatch = (typeOf(args.value) === 'array') && u.all(args.value, function(v) {
    return isType({types: args.types, type: args.valueType, value: v});
  });
  var objectMatch = (typeOf(args.value) === 'object') && u.all(u.objectValues(args.value), function(v) {
    return isType({types: args.types, type: args.valueType, value: v});
  });
  return arrayMatch || objectMatch;
};

var isType = function(args) {
  // assertStructure({types: ['type'], type: 'type|typeSpec', value: 'any'}, args);
  var typeDef = null;
  if (typeOf(args.type) === 'object') {
    typeDef = args.type;
  } else if (args.types && typeOf(args.type) === 'string') {
    typeDef = args.types[args.type];
  }
  if (typeDef) {
    return (typeDef.type == null || isType({types: args.types, type: typeDef.type, value: args.value})) &&
      (typeDef.validate == null || typeDef.validate(args.value, {types: args.types})) &&
      (typeDef.attributes == null || matchAttributes({types: args.types, attributes: typeDef.attributes, value: args.value})) &&
      (typeDef.valueType == null || matchValueType({types: args.types, valueType: typeDef.valueType, value: args.value}));
  } else if (u.contains('|', args.type)) {
    return u.any(typeList(args.type), function(t) {
      return isType({types: args.types, type: t, value: args.value});
    });
  } else if (u.contains('&', args.type)) {
    return u.all(typeList(args.type), function(t) {
      return isType({types: args.types, type: t, value: args.value});
    });
  } else {
    return typeOf(args.value) === args.type;
  }
};

module.exports = {
  basicTypes: basicTypes,
  internalTypes: internalTypes,
  typeOf: typeOf,
  isType: isType
};
