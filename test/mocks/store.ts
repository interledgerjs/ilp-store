import { StoreInstance, StoreOptions } from '../../src'
require('source-map-support').install()

class TestStore implements StoreInstance {

  public prefix: string

  constructor(options: StoreOptions) {
    this.prefix = options.prefix || ''
  }
  
  get(key: string): Promise<string | undefined> {
    throw new Error("Method not implemented.");
  }  
  put(key: string, value: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  del(key: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
export = TestStore