const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin')
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const smp = process.env.MEASURE === 'true' ? new SpeedMeasureWebpackPlugin({
  outputFormat: 'humanVerbose'
}) : {wrap:(v) => v}
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = {
  parallel: true,
  publicPath: './',
  configureWebpack: smp.wrap({
    cache: {
      type: 'filesystem',
      cacheDirectory: path.resolve(__dirname, './node_modules/.cache_temp')
    },
    resolve: {
      alias: {
        'src': path.resolve(__dirname, './src'),
        'assets': path.resolve(__dirname, './src/assets'),
        'components': path.resolve(__dirname, './src/components')
      }
    },
    module: {
      rules: [{
        test: /\.vue$/,
        exclude: /node_modules/,
        use: [{
          loader: 'thread-loader',
          options: {
            worker: 5
          }
        }]
      }]
    },
    plugins: [
      new BundleAnalyzerPlugin(),
      new webpack.DllReferencePlugin({
        context: path.join(__dirname),
        manifest: path.resolve(__dirname, './dll/vue-manifest.json')
      }),
      new AddAssetHtmlWebpackPlugin({
        filepath: path.resolve(__dirname, './dll/vue.dll.js'),
      })
    ]
  })
}
