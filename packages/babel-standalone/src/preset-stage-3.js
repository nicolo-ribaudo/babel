// @flow
import * as babelPlugins from "./generated/plugins";

export default (_: any, opts: Object) => {
  let loose = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
  }

  return {
    plugins: [
      babelPlugins.syntaxImportAssertions,
      babelPlugins.syntaxImportMeta,
      babelPlugins.syntaxTopLevelAwait,
      "internal:transform-export-namespace-from",
      "internal:transform-logical-assignment-operators",
      ["internal:transform-optional-chaining", { loose }],
      ["internal:transform-nullish-coalescing-operator", { loose }],
      [babelPlugins.proposalClassProperties, { loose }],
      "internal:transform-json-strings",
      "internal:transform-numeric-separator",
      [babelPlugins.proposalPrivateMethods, { loose }],
    ],
  };
};
