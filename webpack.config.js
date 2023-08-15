const Dotenv = require('dotenv-webpack');
module.exports = require('@battis/gas-lighter/webpack.config')({
  root: __dirname,
  plugins: [new Dotenv()]
});
