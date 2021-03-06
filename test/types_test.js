'use strict';

var u = require('lib/util'),
    testHelper = require('test/test_helper'),
    assert = testHelper.assert,
    types = require('lib/types'),
    baseType = types.baseType,
    spec = types.spec,
    basicTypes = types.basicTypes,
    metaTypes = types.metaTypes,
    validateName = types.validateName,
    lookup = types.lookup,
    isType = types.isType,
    isStructure = types.isStructure,
    metaTypes = types.metaTypes;

var TYPES = {
  evenNumber: {
    type: 'number',
    validate: function(v) { return v % 2 === 0; }
  },
  posNumber: {
    type: 'number',
    validate: function(v) { return v >= 0; }
  }
};

describe('types', function() {
  describe('baseType', function() {
    it('returns the base type for a custom type', function() {
      var types = {
        yieldFactor: {
          validate: function(v) { return v > 1.0; },
          type: 'number'
        },
        interest: {
          type: 'yieldFactor',
          default: 1.03
        }
      };
      assert.equal(baseType(types, types.interest), 'number');
      assert.equal(baseType(types, types.yieldFactor), 'number');
      assert.equal(baseType(types, types.yieldFactor), 'number');
      assert.equal(baseType(types, {type: 'boolean'}), 'boolean');
      assert.equal(baseType(types, {}), 'any');
    });
  });

  describe('validateName', function() {
    it('works with a basic type name', function() {
      basicTypes.forEach(function(typeName) {
        assert(validateName(null, typeName));
      });
      assert(!validateName(null, 'foooobar'));
    });

    it('works with meta type names', function() {
      Object.keys(metaTypes).forEach(function(typeName) {
        assert(validateName(null, typeName));
      });
      assert(!validateName(null, 'foooobar'));
    });

    it('works with custom type names', function() {
      var types = {recipe: {type: 'object', structure: {name: 'string'}}};
      assert(validateName(types, 'recipe'));
      assert(validateName(types, 'number'));
      assert(!validateName(types, 'foooobar'));
    });
  });

  describe('lookup', function() {
    it('works with meta type names', function() {
      assert.equal(lookup(null, 'typeName'), metaTypes.typeName);
      assert.equal(lookup(null, 'type'), metaTypes.type);
    });

    it('returns nil if it cannot lookup a type by name', function() {
      assert(u.isNil(lookup(null, 'foooobar')));
    });

    it('works with custom type names', function() {
      var types = {recipe: {type: 'object', structure: {name: 'string'}}};
      assert.equal(lookup(types, 'recipe'), types.recipe);
      assert.equal(lookup(types, 'typeSpec'), metaTypes.typeSpec);
    });
  });

  describe('spec', function() {
    describe('parse', function() {
      it('works with a single type name', function() {
        assert.equal(spec.parse('number'), {typeNames: ['number']});
        assert.equal(spec.parse('number?'), {typeNames: ['number'], optional: true});
      });

      it('returns null for unrecognized types and invalid type specs', function() {
        assert.equal(spec.parse(null), null);
        assert.equal(spec.parse({}), null);
        assert.equal(spec.parse('foooobar'), null);
        assert.equal(spec.parse('foo|oo|bar'), null);
        assert.equal(spec.parse('number|string&object'), null);
      });

      it('works with custom types', function() {
        var types = {recipe: {type: 'object', structure: {name: 'string', ingredients: 'string'}}};
        assert.equal(spec.parse('recipe', {types: types}), {typeNames: ['recipe']});
      });

      it('works with union types', function() {
        assert.equal(spec.parse('number|string|object'), {typeNames: ['number', 'string', 'object'], operator: 'any'});
        assert.equal(spec.parse('number|string|object?'), {typeNames: ['number', 'string', 'object'], operator: 'any', optional: true});
        var types = {recipe: {type: 'object', structure: {name: 'string', ingredients: 'string'}}};
        assert.equal(spec.parse('number|recipe', {types: types}), {typeNames: ['number', 'recipe'], operator: 'any'});
      });

      it('works with intersection types', function() {
        assert.equal(spec.parse('number&string&object'), {typeNames: ['number', 'string', 'object'], operator: 'all'});
        assert.equal(spec.parse('number&string&object?'), {typeNames: ['number', 'string', 'object'], operator: 'all', optional: true});
        var types = {recipe: {type: 'object', structure: {name: 'string', ingredients: 'string'}}};
        assert.equal(spec.parse('number&recipe', {types: types}), {typeNames: ['number', 'recipe'], operator: 'all'});
      });
    });

    describe('containsType', function() {
      it('works with a single type name', function() {
        assert(spec.containsType('number', 'number'));
        assert(!spec.containsType('number', 'string'));
      });

      it('works with union types', function() {
        assert(spec.containsType('number|string', 'number'));
        assert(spec.containsType('number|string', 'string'));
        assert(!spec.containsType('number|string', 'foobar'));
      });

      it('works with intersection types', function() {
        assert(spec.containsType('number&string', 'number'));
        assert(spec.containsType('number&string', 'string'));
        assert(!spec.containsType('number&string', 'foobar'));
      });
    });
  });

  describe('isType', function() {
    it('works with basic types', function() {
      assert(isType({type: 'null', value: null}));
      assert(!isType({type: 'null', value: 'foobar'}));

      assert(isType({type: 'undefined', value: undefined}));
      assert(!isType({type: 'undefined', value: 'foobar'}));

      assert(isType({type: 'string', value: 'foobar'}));
      assert(!isType({type: 'string', value: 5}));

      assert(isType({type: 'number', value: 5}));
      assert(!isType({type: 'number', value: 'foobar'}));

      assert(isType({type: 'boolean', value: true}));
      assert(isType({type: 'boolean', value: false}));
      assert(!isType({type: 'boolean', value: 'foobar'}));

      assert(isType({type: 'object', value: {value: 5}}));
      assert(!isType({type: 'object', value: 'foobar'}));

      assert(isType({type: 'array', value: [5]}));
      assert(!isType({type: 'array', value: 'foobar'}));

      assert(isType({type: 'function', value: function() {}}));
      assert(!isType({type: 'function', value: 'foobar'}));

      assert(isType({type: 'date', value: new Date()}));
      assert(!isType({type: 'date', value: 'foobar'}));

      assert(isType({type: 'regexp', value: /foobar/}));
      assert(!isType({type: 'regexp', value: 'foobar'}));
    });

    it('works with a validate function', function() {
      var evenNumber = function(v) { return v % 2 === 0; },
          identity = function(v) { return v; };
      assert(isType({type: {type: 'number', validate: evenNumber}, value: 6}));
      assert(!isType({type: {type: 'number', validate: evenNumber}, value: '6'}));
      assert(!isType({type: {type: 'number', validate: evenNumber}, value: 5}));

      assert(isType({type: {validate: identity}, value: 6}));
      assert(isType({type: {validate: identity}, value: true}));
      assert(isType({type: {validate: identity}, value: {}}));
      assert(!isType({type: {validate: identity}, value: false}));
      assert(!isType({type: {validate: identity}, value: 0}));
    });

    it('works with the structure attribute for objects', function() {
      assert(isType({type: {type: 'object', structure: {name: 'string', level: 'number'}}, value: {name: 'foobar', level: 4}}));
      assert(isType({type: {type: 'object', structure: {name: 'string', level: 'number'}}, value: {name: 'foobar', level: 4, foo: 'bar'}}));
      assert(!isType({type: {type: 'object', structure: {name: 'string', level: 'number'}}, value: {name: 'foobar', level: '4'}}));
      assert(!isType({type: {type: 'object', structure: {name: 'string', level: 'number'}}, value: {name: 'foobar'}}));
    });

    it('works with the structure attribute for arrays', function() {
      assert(isType({type: {type: 'array', structure: ['number']}, value: [4]}));
      assert(isType({type: {type: 'array', structure: ['number']}, value: [4, 5]}));
      assert(!isType({type: {type: 'array', structure: ['number'], allowMore: false}, value: [4, 5]}));

      assert(isType({type: {type: 'array', structure: ['number']}, value: []}));
      assert(!isType({type: {type: 'array', structure: ['number'], allowEmpty: false}, value: []}));
      assert(isType({type: {type: 'array', valueType: 'number'}, value: []}));
      assert(!isType({type: {type: 'array', valueType: 'number', allowEmpty: false}, value: []}));
      assert(!isType({type: {type: 'array', structure: ['number']}, value: [4, '5']}));
      assert(isType({type: {type: 'array', structure: ['number', 'string']}, value: [4, '5']}));
      assert(!isType({type: {type: 'array', structure: ['number', 'string']}, value: [4, '5', 'foobar']}));
      assert(isType({type: {type: 'array', structure: ['number', 'string'], allowMore: true}, value: [4, '5', 'foobar']}));
    });

    it('works with object valueType', function() {
      assert(isType({type: {type: 'object', valueType: 'number'}, value: {foo: 5}}));
      assert(!isType({type: {type: 'object', valueType: 'number'}, value: {foo: '5'}}));
      assert(!isType({type: {type: 'object', valueType: 'number'}, value: [5]}));
    });

    it('works with array valueType', function() {
      assert(isType({type: {type: 'array', valueType: 'number'}, value: [5]}));
      assert(!isType({type: {type: 'array', valueType: 'number'}, value: ['5']}));
      assert(!isType({type: {type: 'array', valueType: 'number'}, value: {foo: 5}}));
    });

    it('works with union types', function() {
      assert(isType({type: 'number|string', value: 5}));
      assert(isType({type: {type: 'number|string'}, value: 5}));
      assert(isType({type: {type: 'number|string'}, value: 'foobar'}));
      assert(!isType({type: 'number|string', value: true}));
      assert(!isType({type: {type: 'number|string'}, value: true}));

      assert(isType({types: TYPES, type: 'evenNumber|posNumber', value: 2}));
      assert(isType({types: TYPES, type: 'evenNumber', value: -2}));
      assert(!isType({types: TYPES, type: 'posNumber', value: -2}));
      assert(isType({types: TYPES, type: 'evenNumber|posNumber', value: -2}));
    });

    it('works with intersection types', function() {
      assert(!isType({types: TYPES, type: 'string&number', value: 2}));

      assert(isType({types: TYPES, type: 'evenNumber&posNumber', value: 2}));
      assert(isType({types: TYPES, type: 'evenNumber', value: -2}));
      assert(!isType({types: TYPES, type: 'posNumber', value: -2}));
      assert(!isType({types: TYPES, type: 'evenNumber&posNumber', value: -2}));
    });

    it('works with optional types', function() {
      assert(isType({type: 'number', value: 2}));
      assert(!isType({type: 'number', value: null}));
      assert(isType({type: 'number?', value: null}));
      assert(isType({type: 'number|string?', value: null}));

      assert(isType({types: TYPES, type: 'evenNumber|posNumber', value: 3}));
      assert(!isType({types: TYPES, type: 'evenNumber|posNumber', value: null}));
      assert(isType({types: TYPES, type: 'evenNumber|posNumber?', value: null}));
      assert(isType({types: TYPES, type: 'evenNumber|posNumber?', value: undefined}));
    });

    it('works with "any" types', function() {
      assert(isType({type: 'any', value: 2}));
      assert(isType({type: 'any', value: 'foobar'}));
      assert(isType({type: 'any', value: null}));
      assert(isType({type: {type: 'object', valueType: 'any'}, value: {foo: 'bar'}}));
      assert(!isType({type: {type: 'object', valueType: 'any'}, value: ['bar']}));
    });

    it('works with meta types', function() {
      assert(isType({types: metaTypes, type: 'typeName', value: 'number'}));
      assert(isType({types: metaTypes, type: 'typeName', value: 'typeName'}));
      assert(!isType({types: metaTypes, type: 'typeName', value: 'foooobar'}));

      var validTypes = [
        {type: 'number'},
        {type: 'object', structure: {foo: 'number'}},
        {type: 'object', valueType: 'number|string'},
        {type: 'number', validate: function(v) { return v % 2 === 0; }, default: 4}
      ];
      validTypes.forEach(function(type) {
        assert(isType({types: metaTypes, type: 'type', value: type}), "Should be valid: " + JSON.stringify(type));
      });

      var invalidTypes = [
        null,
        {},
        {type: 'object', valueType: 5},
        {type: 'string', valueType: 'number'}
      ];
      invalidTypes.forEach(function(type) {
        assert(!isType({types: metaTypes, type: 'type', value: type}), "Should *not* be valid: " + JSON.stringify(type));
      });
    });
  });

  describe('isStructure', function() {
    it('works with objects', function() {
      assert(isStructure({structure: {foo: 'number', bar: 'string'}, value: {foo: 5, bar: 'baz'}}));
      assert(!isStructure({structure: {foo: 'number', bar: 'string'}, value: {foo: 5}}));
      assert(!isStructure({structure: {foo: 'number', bar: 'string'}, value: {foo: 5, bar: 6}}));

      var structure = {
        foo: 'boolean',
        bar: [{baz: 'string'}]
      };

      var value = {
        foo: true,
        bar: [{baz: 'foobar'}, {baz: 'foobar'}]
      };

      assert(isStructure({structure: structure, value: value}));
    });

    it('works with arrays with one element (same type for all)', function() {
      assert(isStructure({structure: ['number'], value: [1]}));
      assert(isStructure({structure: ['number'], value: [5, 2, 3.14]}));
      assert(isStructure({structure: ['number'], value: []}));
      assert(!isStructure({structure: ['number'], value: [5, '4']}));
      assert(!isStructure({structure: ['number'], value: null}));
      assert(!isStructure({structure: ['number'], value: {}}));
      assert(!isStructure({structure: ['number'], value: true}));
    });

    it('works with arrays with several elements (different types, length of array must match)', function() {
      assert(isStructure({structure: ['number', 'array', {name: 'string'}], value: [1, [], {name: 'foobar'}]}));
      assert(!isStructure({structure: ['number', 'array', {name: 'string'}], value: [1, []]}));
      assert(!isStructure({structure: ['number', 'array', {name: 'string'}], value: [1, [], {name: 'foobar'}, 'bla']}));
      assert(!isStructure({structure: ['number', 'array', {name: 'string'}], value: [1, {}, {name: 'foobar'}]}));
      assert(!isStructure({structure: ['number', 'array', {name: 'string'}], value: [1, [], {names: 'foobar'}]}));
    });

    it('works with type specs (strings)', function() {
      assert(isStructure({structure: 'number|string', value: 5}));
      assert(isStructure({structure: 'number|string', value: '5'}));
      assert(isStructure({structure: 'number|string', value: '5'}));
      assert(!isStructure({structure: 'number|string', value: {}}));
    });

    it('raises an exception for invalid structures', function() {
      assert.throws(function() {
        isStructure({structure: 5, value: [1]});
      });
    });
  });
});
