const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')

/**
 * Resolve a path relative to the package root directory
 * 
 * This function assumes that it is run as part of a node process
 * started from the addon root for the webpack build.
 * 
 * @param {String} dir 
 * @returns String combined path
 */
function resolve (dir) {
  return path.join(process.cwd(), dir)
}

/**
 * Create a webpack config usable for demosplan-core addons.
 * 
 * ## Usage
 * 
 * ```js
 * const DemosplanAddon = require('@demos-europe/demosplan-addon')
 * 
 * module.exports = DemosplanAddon.build(
 *   'my-addon-name', 
 *   { 'MyAddon': DemosPlanAddon.resolve('src/index.js') }
 * )
 * ```
 * 
 * @param {String} addon_name the name, d'uh
 * @param {Object} entrypoints name-mapped entry points dictionary 
 * @returns {Options} webpack configuration
 */
function configBuilder(addon_name, entrypoints) {
  return {
    entry: entrypoints,
    mode: (process.env.NODE_ENV == 'production') ? 'production' : 'development',
    output: {
      path: resolve('dist'),
      filename: `[name].umd.js`,
      library: `${addon_name}`,
      libraryTarget: 'umd',
      libraryExport: 'default'
    },
    resolve: {
      extensions: ['.js', '.vue']
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new VueLoaderPlugin(),
      new WebpackManifestPlugin({
        fileName: resolve(`./${addon_name}.manifest.json`),
        publicPath: 'dist'
      })
    ],
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.(js|jsx)$/i,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postCssOptions: {
                  plugins: [['autoprefixer']],
                }
              }
            }
          ],
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
          type: 'asset',
        },
      ],
    },
  }
}

/**
 * Expose a webpack config builder and useful helpers
 * for entrypoint configuration.
 * 
 */
const DemosplanAddon = {
  build: configBuilder,
  resolve: resolve
}

module.exports = DemosplanAddon;
