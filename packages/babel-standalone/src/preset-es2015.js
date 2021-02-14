// @flow
import * as babelPlugins from "./generated/plugins";

export default (_: any, opts: Object): Object => {
  let loose = false;
  let modules = "commonjs";
  let spec = false;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
    if (opts.modules !== undefined) modules = opts.modules;
    if (opts.spec !== undefined) spec = opts.spec;
  }

  // be DRY
  const optsLoose = { loose };

  return {
    plugins: [
      ["internal:transform-template-literals", { loose, spec }],
      "internal:transform-literals",
      "internal:transform-function-name",
      ["internal:transform-arrow-functions", { spec }],
      "internal:transform-block-scoped-functions",
      ["internal:transform-classes", optsLoose],
      "internal:transform-object-super",
      "internal:transform-shorthand-properties",
      "internal:transform-duplicate-keys",
      ["internal:transform-computed-properties", optsLoose],
      ["internal:transform-for-of", optsLoose],
      "internal:transform-sticky-regex",
      "internal:transform-unicode-escapes",
      "internal:transform-unicode-regex",
      ["internal:transform-spread", optsLoose],
      ["internal:transform-parameters", optsLoose],
      ["internal:transform-destructuring", optsLoose],
      "internal:transform-block-scoping",
      "internal:transform-typeof-symbol",
      "internal:transform-instanceof",
      (modules === "commonjs" || modules === "cjs") && [
        babelPlugins.transformModulesCommonjs,
        optsLoose,
      ],
      modules === "systemjs" && [
        babelPlugins.transformModulesSystemjs,
        optsLoose,
      ],
      modules === "amd" && [babelPlugins.transformModulesAmd, optsLoose],
      modules === "umd" && [babelPlugins.transformModulesUmd, optsLoose],
      [
        "internal:transform-regenerator",
        { async: false, asyncGenerators: false },
      ],
    ].filter(Boolean), // filter out falsy values
  };
};
