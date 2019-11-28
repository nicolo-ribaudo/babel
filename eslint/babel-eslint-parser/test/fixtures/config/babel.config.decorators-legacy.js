"use strict";

module.exports = {
  presets: [[require.resolve("@babel/preset-env"), { forceAllTransforms: true }]],
  plugins: [[require.resolve("@babel/plugin-proposal-decorators"), { legacy: true }]],
};
