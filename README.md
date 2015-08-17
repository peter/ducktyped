# Ducktyped

Runtime type checking for JavaScript

Work in progress, check back soon :)

## TODO

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
