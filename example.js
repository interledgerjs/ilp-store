const store = require('.')()
async function run () {
  store.put('key', 'value')
  console.log(`Got key=${await store.get('key')} from ${store.constructor.name}`)
  process.exit(0)
}
run()