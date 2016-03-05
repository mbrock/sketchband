var webpack = require("webpack")
var html = require("html-webpack-plugin")
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
      "teoria"
    ]
  },
  output: {
    path: require("path").resolve(__dirname, "dist"),
    filename: "[name].[chunkhash:12].js"
  },
  plugins: [
    new html({
      template: "index.html.ejs",
      inject: "body",
    }),
    new webpack.optimize.CommonsChunkPlugin(
      "vendor",
      "vendor.[chunkhash:12].js"
    )
  ],
  devtool: "inline-source-map",
  module: {
    loaders: [
      {
        test: /\.es$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          presets: ["es2015", "react"],
          plugins: [
            "transform-object-rest-spread",
            "transform-regenerator",
            "syntax-do-expressions",
            "syntax-async-functions"
          ]
        }
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      }
    ]
  }
}
