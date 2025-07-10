import config from '@battis/gas-lighter/webpack.config.js';
import webpack from 'webpack';

export default config({
  root: import.meta.dirname,
  plugins: [
    new webpack.DefinePlugin({
      SERVICE_ACCOUNT: JSON.stringify(process.env.SERVICE_ACCOUNT)
    })
  ]
});
