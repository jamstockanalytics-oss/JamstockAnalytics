const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Remove react-native-web alias to avoid InitializeCore issues
// config.resolver.alias = {
//   'react-native': 'react-native-web',
// };

// Ensure proper module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Fix for react-native-web InitializeCore issue
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;