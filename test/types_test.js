'use strict';

var testHelper = require('test/test_helper'),
    assert = testHelper.assert,
    types = require('lib/types'),
    isType = types.isType,
    metaTypes = types.metaTypes;

describe('types', function() {
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

    it('works with internal types', function() {
      assert(isType({types: metaTypes, type: 'typeName', value: 'number'}));
      assert(isType({types: metaTypes, type: 'typeName', value: 'typeName'}));
      assert(!isType({types: metaTypes, type: 'typeName', value: 'foooobar'}));
    });
  });
});
