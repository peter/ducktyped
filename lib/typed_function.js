'use strict';

var u = require('./util'),
    types = require('./types'),
    isType = types.isType,
    transformStructure = require('./transform').transformStructure;

var typedFunction = u.curry(function(options, argsSpec, fn) {
  // argsType: [{types: 'types?'}, '(object&type)|(array&typeStructure)', 'function']
  return function() {
    var args = Array.prototype.slice.call(arguments);
    if (u.typeOf(argsSpec) === 'object') {
      var argsType = argsSpec;
    } else if (u.typeOf(argsSpec) === 'array') {
      var argsType = {structure: argsSpec, allowMore: (options.variadic ? true : false)};
    } else {
      throw new Error("The args spec must be an array (typeSpec) or an object (typeDef)");
    }
    if (options.transform && argsType.structure) {
      args = transformStructure({baseTransform: options.baseTransform, types: options.types, structure: argsType.structure, value: args});
    }
    if (!isType({types: options.types, type: argsType, value: args})) {
      throw new Error("Arguments " + JSON.stringify(args) + " do not match type spec " + JSON.stringify(argsSpec));
    }
    return fn.apply(null, args);
  };
});

module.exports = {
  typedFunction: typedFunction
};
