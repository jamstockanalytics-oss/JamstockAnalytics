module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Remove react-native-web alias to avoid InitializeCore issues
      // ['module-resolver', {
      //   alias: {
      //     'react-native': 'react-native-web',
      //   },
      //   extensions: ['.js', '.jsx', '.ts', '.tsx'],
      // }],
    ],
  };
};
