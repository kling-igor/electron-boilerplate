import { join } from 'path'
import HTMLWebpackPlugin from 'html-webpack-plugin'
import packagejson from './package.json'

module.exports = env => ({
  entry: join(__dirname, 'src', 'renderer', 'index.js'),
  output: {
    filename: 'index.js',
    path: join(__dirname, 'app')
  },

  target: 'electron-renderer',

  watch: false,

  node: {
    fs: 'empty',
    __dirname: false,
    __filename: false
  },

  watchOptions: {
    aggregateTimeout: 100
  },

  devtool: env.dev ? 'inline-source-map' : false,

  resolve: {
    modules: [join(__dirname, '.'), join(__dirname, 'src'), join(__dirname, 'src', 'renderer')]
  },

  plugins: [
    new HTMLWebpackPlugin({
      title: packagejson.description,
      filename: 'index.html',
      template: join(__dirname, 'src', 'renderer', 'index.html'),
      inject: 'body',
      hash: true,
      debug: env.dev
    })
  ],

  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        include: [join(__dirname, 'src'), join(__dirname, 'src', 'renderer')],
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.css']
  }
})
