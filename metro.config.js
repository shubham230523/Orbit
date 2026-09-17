const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure the bundler handles WASM and worker files correctly for SQLite
config.resolver.assetExts.push('wasm');
config.resolver.sourceExts.push('sql');

module.exports = config;
