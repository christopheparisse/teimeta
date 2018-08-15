const path = require('path');

module.exports = {
  entry: {
    bundle: '/devlopt/teimeta/temp-page/ui/init-singlepage.ts',
    lib: '/devlopt/teimeta/temp-page/teiedit/lib.ts'
  },
  output: {
    filename: '[name].js',
    path: '/devlopt/teimeta/temp-page/'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'] // note if using webpack 1 you'd also need a '' in the array as well
  },
  module: {
    rules: [ // loaders will work with webpack 1 or 2; but will be renamed "rules" in future
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, 
        use: 'ts-loader'
      }
    ]
  }
}