const path = require('path');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './server.js',
  target: 'node',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
    clean: true
  },
  
  plugins: [
    new SentryWebpackPlugin({
      org: 'jam-stock-analytics',
      project: 'node-b0',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: process.env.SENTRY_RELEASE || 'jamstockanalytics@1.0.0',
      include: './dist',
      ignore: ['node_modules', 'webpack.config.js'],
      setCommits: { auto: true },
      debug: process.env.NODE_ENV === 'development',
      cleanArtifacts: true,
      finalize: true
    })
  ],
  
  devtool: 'source-map',
  
  externals: {
    'mongodb': 'commonjs mongodb',
    'redis': 'commonjs redis',
    'mongoose': 'commonjs mongoose',
    'express': 'commonjs express',
    'socket.io': 'commonjs socket.io',
    'helmet': 'commonjs helmet',
    'compression': 'commonjs compression',
    'cors': 'commonjs cors',
    'morgan': 'commonjs morgan'
  }
};
