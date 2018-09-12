# ILP Store
> An ILP store loader for key/value stores used by ILP components

[![NPM Package](https://img.shields.io/npm/v/ilp-store.svg?style=flat)](https://npmjs.org/package/ilp-store)
[![CircleCI](https://circleci.com/gh/interledgerjs/ilp-store.svg?style=shield)](https://circleci.com/gh/interledgerjs/ilp-store)
[![Known Vulnerabilities](https://snyk.io/test/github/interledgerjs/ilp-store/badge.svg)](https://snyk.io/test/github/interledgerjs/ilp-store)

The script below will create an instance of an ILP store with no setup whatsoever.  You can
use this anywhere that you need a key value store for use by an ILP component.

**IMPORTANT**: The default store is an in-memory store that will lose all of its data when the process exits. For persistent storage consider one of the other `ilp-store-*` modules such as `ilp-store-redis` or `ilp-store-simpledb`.


## Examples

Javascript:
```js
const store = require('ilp-store')()
async function run () {
  await store.put('key', 'some value')
  const value = await store.get('key')
  process.exit(0)
}
run()
```

TypeScript:
```typescript
import createStore from 'ilp-store'
const store = createStore()
async function run () {
  await store.put('key', 'some value')
  const value = await store.get('key')
  process.exit(0)
}
run()
```

If no parameters are provided it will attempt to find the config in environment variables. If these are not found it will load an in-memory store.

The Environment variables that can be set are:

`ILP_STORE` : The name/path of the store module
`ILP_STORE_OPTIONS` : The options passed to the constructor, serialized as a JSON object.

The options object passed are a subset of the configuration object used in `ilp-connector`.