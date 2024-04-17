const webpack = require('webpack')
const path = require("node:path");

const dllPath = './dll'

module.exports = {
  mode: 'production',
  entry: {
    vue: ['vue', 'vue-router', 'vuex'],

  },
  output: {
    path: path.resolve(__dirname, dllPath),
    filename: '[name].dll.js',
    library: '[name]_[hash]',
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname, dllPath, '[name]-manifest.json'),
      name: '[name]_[hash]',
      context: process.cwd(),
    })
  ]
}
