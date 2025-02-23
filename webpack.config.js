const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'), // Use the crypto-browserify polyfill
      stream: require.resolve('stream-browserify'),  // Add stream polyfill if necessary
      buffer: require.resolve('buffer/'),            // Add buffer polyfill if necessary
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false, // This can help in some cases where Webpack can't resolve ESM modules.
        },
      },
    ],
  },
};
