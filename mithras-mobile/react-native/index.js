
// Polyfills (must run before any other imports):
require('react-native-get-random-values');
require('react-native-url-polyfill/auto');
require('@bacons/text-decoder/install');

const { Buffer } = require('@craftzdog/react-native-buffer');
global.Buffer = global.Buffer || Buffer;

import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';
import { uniffiInitAsync } from 'mopro-ffi';

// Require App after polyfills/shims are installed (ESM imports are hoisted).
const App = require('./src/App').default;

uniffiInitAsync().then(() => {
  AppRegistry.registerComponent(appName, () => App);
});
