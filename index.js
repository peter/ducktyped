'use strict';

var types = require('./lib/types'),
    typedFunction = require('./lib/typed_function').typedFunction;

module.exports = {
  types: types,
  typedFunction: typedFunction,
  isType: types.isType,
  isStructure: types.isStructure
};
