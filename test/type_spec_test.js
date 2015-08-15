'use strict';

var testHelper = require('test/test_helper'),
    assert = testHelper.assert,
    TypeSpec = require('lib/type_spec'),
    parse = TypeSpec.parse,
    containsType = TypeSpec.containsType;

describe('type_spec', function() {
  describe('parse', function() {
    it('works with a single type name', function() {
      assert.equal(parse('number'), {typeNames: ['number']});
      assert.equal(parse('number?'), {typeNames: ['number'], optional: true});
    });

    it('returns null for unrecognized types and invalid type specs', function() {
      assert.equal(parse(null), null);
      assert.equal(parse({}), null);
      assert.equal(parse('foooobar'), null);
      assert.equal(parse('foo|oo|bar'), null);
      assert.equal(parse('number|string&object'), null);
    });

    it('works with custom types', function() {
      var types = {recipe: {type: 'object', attributes: {name: 'string', ingredients: 'string'}}};
      assert.equal(parse('recipe', {types: types}), {typeNames: ['recipe']});
    });

    it('works with union types', function() {
      assert.equal(parse('number|string|object'), {typeNames: ['number', 'string', 'object'], operator: 'any'});
      assert.equal(parse('number|string|object?'), {typeNames: ['number', 'string', 'object'], operator: 'any', optional: true});
      var types = {recipe: {type: 'object', attributes: {name: 'string', ingredients: 'string'}}};
      assert.equal(parse('number|recipe', {types: types}), {typeNames: ['number', 'recipe'], operator: 'any'});
    });

    it('works with intersection types', function() {
      assert.equal(parse('number&string&object'), {typeNames: ['number', 'string', 'object'], operator: 'all'});
      assert.equal(parse('number&string&object?'), {typeNames: ['number', 'string', 'object'], operator: 'all', optional: true});
      var types = {recipe: {type: 'object', attributes: {name: 'string', ingredients: 'string'}}};
      assert.equal(parse('number&recipe', {types: types}), {typeNames: ['number', 'recipe'], operator: 'all'});
    });
  });

  describe('containsType', function() {
    it('works with a single type name', function() {
      assert(containsType('number', 'number'));
      assert(!containsType('number', 'string'));
    });

    it('works with union types', function() {
      assert(containsType('number|string', 'number'));
      assert(containsType('number|string', 'string'));
      assert(!containsType('number|string', 'foobar'));
    });

    it('works with intersection types', function() {
      assert(containsType('number&string', 'number'));
      assert(containsType('number&string', 'string'));
      assert(!containsType('number&string', 'foobar'));
    });
  });
});
