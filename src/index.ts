import createLogger from 'ilp-logger'
const log = createLogger('ilp-store')
require('source-map-support').install()

export interface StoreServices {
}

export interface StoreConstructor {
  new (options: StoreOptions, api: StoreServices): StoreInstance
}

export interface StoreOptions {
  prefix?: string
  [key: string]: any
}

export interface StoreInstance {
  get (key: string): Promise<string | undefined>
  put (key: string, value: string): Promise<void>
  del (key: string): Promise<void>
}

export interface CreateStoreOptions {
  store?: string
  options?: StoreOptions
}

/**
 * A type guard for ILP stores
 *
 * See https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards
 *
 * @param store a class to test
 */
export function isStore (store: any): store is StoreInstance {
  return store.get !== undefined &&
    store.put !== undefined &&
    store.del !== undefined
}

export const DEFAULT_STORE_MODULE = 'ilp-store-memory'
export const DEFAULT_STORE_PREFIX = 'ilp:'

/**
 * Create an instance of an ILP store (simple key/value store)
 *
 * This function loads an instance of an ILP store.
 *
 * The constructor options for the store and the module name of the store can be passed to the function as parameters.
 * If no parameters are provided then it will attempt to find the config in environment variables.
 * If these are not found it will load an in-memory store.
 *
 * If no `options.prefix` is provided then the store will use the DEFAULT_STORE_PREFIX which is simply `ilp:`.
 *
 * The Environment variables that can be set are:
 *  - ILP_STORE : The name/path of the plugin module
 *  - ILP_STORE_OPTIONS : The options passed to the constructor, serialized as a JSON object.
 *
 * Example 1: Explicit config
 *
 * ```js
 * const store = require('ilp-store').createStore({
 *     plugin : 'ilp-store-redis',
 *     options : {
 *       prefix: 'test.example',
 *       port: 6379
 *     }
 * })
 * ```
 *
 * Example 2: Config from env
 *
 * ```sh
 *  $ ILP_STORE="ilp-store-redis" \
 *    ILP_STORE_OPTIONS="{\"prefix\":\"test.example\",\"port\":6379}" \
 *    node app.js
 * ```
 *
 * Where `app.js` has the following:
 *
 * ```js
 * const store = require('ilp-store').createStore()
 * ```
 */
const createStore = function (options?: CreateStoreOptions, services?: StoreServices): StoreInstance {

  const envOptions = process.env.ILP_STORE_OPTIONS

  const moduleName = (options && options.store) ? options.store : (process.env.ILP_STORE || DEFAULT_STORE_MODULE)
  const moduleNameSource = (options && options.store) ? 'parameter' : ((process.env.ILP_STORE) ? 'environment' : 'default')
  const storeOptions = (options && options.options) ? options.options : (envOptions ? JSON.parse(envOptions) : {})
  const optionsSource = (options && options.options) ? 'parameter' : ((envOptions) ? 'environment' : 'default')

  if (Object.keys(storeOptions).length === 0) {
    log.debug(`No prefix provided. Using default: '${DEFAULT_STORE_PREFIX}'`)
    storeOptions.prefix = DEFAULT_STORE_PREFIX
  }
  log.debug(`Loading module '${moduleName}' defined via ${moduleNameSource}.`)
  const ConstructorFromModule = require(moduleName)
  log.debug(`Creating store using options defined via ${optionsSource}.`)
  try {
    const store = new ConstructorFromModule(storeOptions, services)
    if (!isStore(store)) {
      log.error(`${moduleName} is not a valid store.`)
      throw Error(`Invalid module: ${moduleName}`)
    }
    return store
  } catch (e) {
    log.error(`Unable to create instance of store from '${moduleName}' module. Does it export a store constructor?`)
    throw e
  }
} as ModuleExport

interface ModuleExport {
  (options?: CreateStoreOptions, services?: StoreServices): StoreInstance
  default: ModuleExport
  isStore: (store: any) => store is StoreInstance
}

createStore.default = createStore
createStore.isStore = isStore
export default createStore

module.exports = createStore
