# Electron Compat
Some Function are Implemented as Chrome Extension. And Electron does not support that this is a compat layer.



webpack.config.mjs (Webpack@^5.6)
```js
{
  entry: './index.js',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [require.resolve('electron-chrome-extensions/preload')],
    }),
  ],
}
```
