try {
  var path = require('path');
  var os = require('os');
  var projectDirectory = process.cwd();

  var webpack = require('webpack');
  var HtmlWebpackPlugin = require('html-webpack-plugin');
  var ExtractTextPlugin = require('extract-text-webpack-plugin');
  var CopyWebpackPlugin = require('copy-webpack-plugin');
  var ProgressBarPlugin = require('progress-bar-webpack-plugin');

  var postcssCssnext = require('postcss-cssnext');
  var postcssUrl = require('postcss-url');
  var postcssImport = require('postcss-smart-import');
} catch (e) {
  throw new Error('Missing Webpack Build Dependencies :' + e);
}

module.exports = {


  resolve: {
    modules: [
      "node_modules",
      path.join(projectDirectory, 'src'),
      path.join(projectDirectory, 'node_modules')
    ],

    extensions: ['.js', '.jsx', '.json', '.css', '.html'],

    unsafeCache: true
  },

  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      loader: 'babel-loader',
      include: path.join(projectDirectory, 'src'),
      options: {
        presets: [
          require.resolve('babel-preset-stage-3'),
          [
            require.resolve('babel-preset-env'),
            {
              "targets": {
                "browsers": ["last 2 versions", "safari >= 7"]
              }
            }
          ],
          require.resolve( "babel-preset-react")
        ],
        cacheDirectory: true,
        plugins: [
          path.join('react-hot-loader', 'babel')
        ]
      }
    }, {
      test: /\.html$/,
      loader: 'html-loader'
    }, {
      test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
      loader: 'file-loader?name=assets/[name].[hash].[ext]'
    }, {
        test: /\.css$/,
        include: [/\/onsen-css-components.css$/, path.join(projectDirectory, 'src')],
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: { importLoaders: 1 }
            }, {
              loader: 'postcss-loader'
            }
          ]
        })
      }, {
        test: /\.css$/,
        exclude: [/\/onsen-css-components.css$/, path.join(projectDirectory, 'src')],
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader?sourceMap',
          publicPath: "/"
        })
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin('[name].css'),
    new HtmlWebpackPlugin({
      template: 'src/index.html.ejs',
      chunksSortMode: 'dependency'
    }),
    new ProgressBarPlugin(),
    new webpack.LoaderOptionsPlugin({
        options: {
          context: projectDirectory,
          postcss: [
            postcssImport,
            postcssUrl,
            postcssCssnext
          ]
        }
      })
  ],

  //resolveLoader: {
    //modules: [cordovaNodeModules]
  //},
  performance: {
    hints: false
  }
};

if (process.env.NODE_ENV === JSON.stringify('production')) {

  module.exports.devtool = "#source-map",

  module.exports.stats= {
    warnings: false,
    children: false
  },

  module.exports.entry = {
    app: './src/main',
    vendor: ['react', 'react-dom', 'onsenui', 'react-onsenui']
  },

  module.exports.output = {
    path: path.join(projectDirectory, 'www'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },

  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('[name].css'),
    new webpack.optimize.CommonsChunkPlugin({
      name: ['vendor']
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html.ejs',
      chunksSortMode: 'dependency',
      externalCSS: ['components/loader.css'],
      externalJS: ['components/loader.js'],
      minify: {
        caseSensitive: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeAttributeQuotes: false,
        removeComments: true
      }
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin(),
    new CopyWebpackPlugin([{
      from: path.join(projectDirectory, 'src'),
      ignore: ['index.html.ejs']
    }]),
    new ProgressBarPlugin()
  ])
} else {

  module.exports.devtool = "#eval-source-map",

  module.exports.entry = [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://0.0.0.0:8000/',
    'webpack/hot/only-dev-server',
    './src/main'
  ],

  module.exports.output = {
    path: path.join(projectDirectory, 'www'),
    filename: 'bundle.js'
  },

  module.exports.devServer  = {
    hot: true,
    historyApiFallback: true,
    noInfo: true,
    contentBase: './src/assets',
    inline: true,
    host: '0.0.0.0',
    stats: 'minimal'
  }
}
