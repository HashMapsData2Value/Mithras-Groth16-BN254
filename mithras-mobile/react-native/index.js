// Polyfills:
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import "@bacons/text-decoder/install";
import { Buffer } from "@craftzdog/react-native-buffer";
global.Buffer = global.Buffer || Buffer;

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { uniffiInitAsync } from 'mopro-ffi';

uniffiInitAsync().then(() => {
  AppRegistry.registerComponent(appName, () => App);
});
