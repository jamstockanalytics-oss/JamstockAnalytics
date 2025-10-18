const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  entry: './server.js',
  target: 'node',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
    clean: true,
    // Performance optimizations
    chunkFilename: '[name].[contenthash].js',
    assetModuleFilename: 'assets/[name].[contenthash][ext]'
  },
  
  // Performance optimizations
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug']
          },
          mangle: {
            reserved: ['require', 'exports', 'module']
          },
          extractComments: false
        })
      ]
    },
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5
        }
      }
    }
  },
  
  plugins: [
    // Sentry plugin
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
    }),
    
    // Compression plugin for gzip
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    }),
    
    // Bundle analyzer (only in development)
    ...(process.env.ANALYZE_BUNDLE ? [new BundleAnalyzerPlugin()] : [])
  ],
  
  // Source maps configuration
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
  
  // Node.js externals for better performance
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
  },
  
  // Performance hints
  performance: {
    hints: 'warning',
    maxEntrypointSize: 500000,
    maxAssetSize: 500000
  },
  
  // Resolve optimizations
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@routes': path.resolve(__dirname, 'routes'),
      '@services': path.resolve(__dirname, 'services'),
      '@middleware': path.resolve(__dirname, 'middleware')
    }
  },
  
  // Module rules for optimization
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-syntax-dynamic-import'
            ]
          }
        }
      }
    ]
  }
};
