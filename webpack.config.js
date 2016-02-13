var webpack = require("webpack")
module.exports = {
  entry: ["babel-polyfill", "./index.es"],
  output: {
    path: require("path").resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  plugins: [
    new require("html-webpack-plugin"),
  ],
  devtool: "source-map",
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
