// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The Kenney sound packs and some music are .ogg files.
config.resolver.assetExts.push('ogg');

module.exports = config;
