const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');

// Standard Metro config for this app.
// We intentionally avoid `react-native-monorepo-config` here because it is ESM
// (causing Node "ExperimentalWarning" when required from this CJS file) and it
// has proven to make resolver behavior fragile in this workspace.
const config = getDefaultConfig(__dirname);

// Keep Metro scoped to this app's node_modules.
const appNodeModules = path.resolve(__dirname, 'node_modules');
config.resolver.nodeModulesPaths = [appNodeModules];
config.resolver.disableHierarchicalLookup = true;

// If you consume local workspace packages (e.g. `MoproReactNativeBindings`),
// ensure Metro watches that folder so changes are picked up.
config.watchFolders = [path.resolve(__dirname, 'MoproReactNativeBindings')];

config.resolver.assetExts.push('zkey');
config.resolver.assetExts.push('bin');
config.resolver.assetExts.push('local');

module.exports = config;
