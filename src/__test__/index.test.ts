import 'mocha'
import createStore, { isStore } from '..'
import * as sinon from 'sinon'
import * as Chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
import * as path from 'path'

Chai.use(chaiAsPromised)
const modulePath = path.join(__dirname, '../../build/__test__/mocks/store')
const assert = Object.assign(Chai.assert, sinon.assert)
require('source-map-support').install()

describe('ilp-store', function () {

  beforeEach(() => {
    delete(process.env['ILP_STORE'])
    delete(process.env['ILP_STORE_OPTIONS'])
  })

  describe('createStore', function () {
    it('should return an instance of a store', function () {
      const store = createStore()
      assert(typeof(store.get) === 'function')
      assert(typeof(store.put) === 'function')
      assert(typeof(store.del) === 'function')
      assert(isStore(store))
    })

    it('should use ilp-store-memory if no module name is provided', function () {
      const store = createStore()
      assert(store.constructor.name === 'MemoryStore')
    })

    it('should throw an error if the provided module is not found', function () {
      assert.throws(() => createStore({ store: 'non-existent-module' }), /Cannot find module \'non-existent-module\'/)
    })

    it('should throw an error if the provided module is not a store', function () {
      assert.throws(() => createStore({ store: 'crypto' }))
    })

    it('should load the named module', function () {
      const store = createStore({ store: modulePath, options: { test: true } })
      assert(store.constructor.name === 'TestStore')
    })

    it('should load the store with the given options', function () {
      const store = createStore({ store: modulePath, options: { prefix: 'TEST' } })
      assert((store as any).prefix === 'TEST')
    })

    it('should load the store named in env var ILP_STORE if available', function () {
      process.env['ILP_STORE'] = modulePath
      const store = createStore()
      assert(store.constructor.name === 'TestStore')
    })

    it('should prefer the store named in parameters over the env var ILP_STORE', function () {
      process.env['ILP_STORE'] = 'ilp-plugin-memory'
      const store = createStore({ store: modulePath, options: { prefix: 'TEST' } })
      assert(store.constructor.name === 'TestStore')
    })

    it('should load the options in env var ILP_STORE_OPTIONS if available', function () {
      process.env['ILP_STORE'] = modulePath
      process.env['ILP_STORE_OPTIONS'] = '{"prefix":"TEST"}'
      const store = createStore()
      assert(store.constructor.name === 'TestStore')
      assert((store as any).prefix === 'TEST')
    })

    it('should prefer the options named in parameters over the env var ILP_STORE_OPTIONS', function () {
      process.env['ILP_STORE'] = 'wrong-path'
      process.env['ILP_STORE_OPTIONS'] = '{"prefix":"WRONG"}'
      const store = createStore({ store: modulePath, options: { prefix: 'TEST' } })
      assert(store.constructor.name === 'TestStore')
      assert((store as any).prefix === 'TEST')
    })

  })

  describe('isStore', function () {
    beforeEach(() => {
      delete(process.env['ILP_STORE'])
      delete(process.env['ILP_STORE_OPTIONS'])
    })

    it('should return false for {}', function () {
      assert(isStore({}) === false)
    })

    it('should return true for createStore()', function () {
      assert(isStore(createStore()))
    })

    it('should return true for TestStore', function () {
      assert(isStore(createStore({ store: modulePath })))
    })
  })
})
