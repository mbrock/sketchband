var webpack = require("webpack")
var html = require("html-webpack-plugin")

var distPath = require("path").resolve(__dirname, "dist")
var babelLoaderConf = {
  test: /\.es$/,
  loader: "babel-loader",
  exclude: /node_modules/
}

module.exports = {
  entry: {
    index: "./index.es",
    vendor: [
      "adsr",
      "babel-polyfill",
      "color",
      "pouchdb",
      "react",
      "react-dom",
      "teoria",
      "pegjs"
    ]
  },
  output: {
    path: distPath,
    filename: "[name].[chunkhash:12].js"
  },
  plugins: [
    new html({
      template: "index.html.ejs",
      inject: "body"
    }),
    new webpack.optimize.CommonsChunkPlugin(
      "vendor",
      "vendor.[chunkhash:12].js"
    ),
    function() {

      // We use a service worker to make the app work offline.  This
      // little plugin compiles the service worker code with constants
      // defined based on the output of the app's compilation: namely,
      // the hash (which changes when any chunk changes) and the names
      // of all assets.  Given that stuff, the service worker can
      // download and cache the entire app.

      this.plugin("emit", function(compilation, callback) {
        webpack({
          entry: "./service-worker.es",
          output: {
            path: distPath,
            filename: "service-worker.js"
          },
          devtool: "inline-source-map",
          module: {
            loaders: [babelLoaderConf]
          },
          plugins: [
            new webpack.DefinePlugin({
              HASH: JSON.stringify(compilation.hash),
              ASSETS: JSON.stringify(Object.keys(compilation.assets))
            })
          ]
        }).run(function(err, statsObject) {
          console.log("Compiled service worker")
          var stats = statsObject.toJson()
          if (err) {
            callback(new Error("Service worker compilation fatal error", err))
          } else if (stats.errors.length > 0) {
            callback(new Error("Service worker compilation errors", stats.errors))
          } else if (stats.warnings.length > 0) {
            callback(new Error("Service worker compilation warnings", stats.warnings))
          } else {
            callback()
          }
        })
      })
    }
  ],
  devtool: "inline-source-map",
  module: {
    loaders: [
      {
        test: /\.pegjs$/,
        loader: 'pegjs-loader'
      },
      babelLoaderConf,
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      }
    ]
  }
}
