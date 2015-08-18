'use strict';

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
  // argsType: {conversions: 'conversions?', types: 'typeDefs?', type: 'typeDef', value: 'any'}
  // TODO
  // apply typeDef.transform
  // or invoke defaultTransform
};

var transformStructure = function(args) {
  // argsType: {conversions: 'conversions?', types: 'typeDefs?', structe: 'typeStructure', value: 'any'}
  // TODO: traverse structure and invoke tranformType
};

module.exports = {
  transformType: transformType,
  transformStructure: transformStructure
};
