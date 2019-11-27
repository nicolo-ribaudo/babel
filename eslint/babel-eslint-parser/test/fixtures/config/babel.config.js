"use strict";

module.exports = {
  presets: [
    [require.resolve("@babel/preset-env"), { forceAllTransforms: true }],
    [require.resolve("@babel/preset-flow"), { all: true }],
    require.resolve("@babel/preset-react"),
  ],
  plugins: [
    require.resolve("@babel/plugin-syntax-dynamic-import"),
    require.resolve("@babel/plugin-syntax-import-meta"),
    require.resolve("@babel/plugin-syntax-export-default-from"),
    require.resolve("@babel/plugin-proposal-class-properties"),
    require.resolve("@babel/plugin-proposal-nullish-coalescing-operator"),
    require.resolve("@babel/plugin-proposal-optional-chaining"),
    require.resolve("@babel/plugin-syntax-numeric-separator"),
    require.resolve("@babel/plugin-syntax-export-namespace-from"),
    [require.resolve("@babel/plugin-proposal-decorators"), { decoratorsBeforeExport: false }],
    [require.resolve("@babel/plugin-proposal-pipeline-operator"), { proposal: "minimal" }],
  ],
};
