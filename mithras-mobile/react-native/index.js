
// Polyfills (must run before any other imports):
require('react-native-get-random-values');
require('react-native-url-polyfill/auto');
require('@bacons/text-decoder/install');

const { Buffer } = require('@craftzdog/react-native-buffer');
global.Buffer = global.Buffer || Buffer;

const { AppRegistry } = require('react-native');
const { name: appName } = require('./app.json');
const App = require('./src/App').default;

// In bridgeless/new-arch mode the runtime expects the component to be
// registered synchronously during startup.
AppRegistry.registerComponent(appName, () => App);

// Initialize UniFFI bindings, but don't block app registration.
try {
  const { uniffiInitAsync } = require('mopro-ffi');
  Promise.resolve(uniffiInitAsync()).catch((e) => {
    // eslint-disable-next-line no-console
    console.warn('[mopro-ffi] uniffiInitAsync failed', e);
  });
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[mopro-ffi] failed to require module', e);
}
