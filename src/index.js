const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const WebpackAssetsManifest = require('webpack-assets-manifest');

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
  const isProduction = process.env.NODE_ENV == 'production'

  /**
   * Transform the entry points object into a usable format
   * so a browser is able to digest the output but still keep
   * the simple webpack config mentioned above to create addons.
   *
   * Basically webpack's EntryDescription object is used to define
   * the library output https://webpack.js.org/concepts/entry-points/#entrydescription-object.
   * Further configuration of library types can be found here https://webpack.js.org/configuration/output/#outputlibrary
   */
  for (const key of Object.keys(entrypoints)) {
    entrypoints[key] = {
      import: entrypoints[key]
    }
    entrypoints[key]['library'] = {
      name: key,
      type: 'window'
    }
  }

  return {
    entry: entrypoints,
    mode: isProduction ? 'production' : 'development',
    output: {
      path: resolve('dist'),
      filename: `[name].umd.js`,
      library: addon_name
    },
    resolve: {
      extensions: ['.js', '.vue']
    },
    devtool: isProduction ? 'nosources-source-map': 'eval-source-map',
    plugins: [
      new MiniCssExtractPlugin(),
      new VueLoaderPlugin(),
      new WebpackAssetsManifest({
        publicPath: true,
        entrypoints: true,
        entrypointsUseAssets: true
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
          test: /\.(scss|css)$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.scss$/,
          loader: 'sass-loader',
          options: {
            additionalData:
              `@import "@demos-europe/demosplan-ui/tokens/dist/scss/_boxShadow.scss";
              @import "@demos-europe/demosplan-ui/tokens/dist/scss/_breakpoints.scss";
              @import "@demos-europe/demosplan-ui/tokens/dist/scss/_color.brand.scss";
              @import "@demos-europe/demosplan-ui/tokens/dist/scss/_color.data.scss";
              @import "@demos-europe/demosplan-ui/tokens/dist/scss/_color.palette.scss";
              @import "@demos-europe/demosplan-ui/tokens/dist/scss/_color.ui.scss";
              @import "@demos-europe/demosplan-ui/tokens/dist/scss/_fontSize.scss";
              @import "@demos-europe/demosplan-ui/tokens/dist/scss/_rounded.scss";
              @import "@demos-europe/demosplan-ui/tokens/dist/scss/_space.scss";
              @import "@demos-europe/demosplan-ui/tokens/dist/scss/_zIndex.scss";`
          }
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
          type: 'asset',
        },
      ],
    }
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
