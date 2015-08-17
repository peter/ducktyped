# Ducktyped

Runtime type checking for JavaScript

Work in progress, check back soon :)

## Motivation

JavaScript neither checks the number of arguments passed to a function or their type.
Here is what Wikipedia says about the purpose of [Type Systems](https://en.m.wikipedia.org/wiki/Type_system):

> The main purpose of a type system is to reduce possibilities for bugs in computer programs by defining interfaces between different parts of a computer program, and then checking that the parts have been connected in a consistent way.

## Usage

TODO

## TODO

* Use multiple arguments instead of array for typedFunction positional arguments
* typedFunction with [type] will require all arguments to have same type...
* Validate that types that are passed in are valid, i.e. {person: {name: 'string', email: 'string'}} should be {person: {structure: {name: 'string', email: 'string'}}}
* Ability to have ['string'] in type definition instead of {type: 'array', valueType: 'string'}?

## Basic types

```
null
undefined
string
number
boolean
object
array
function
date
regexp
```
