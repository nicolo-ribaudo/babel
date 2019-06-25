//@flow

import { logPluginOrPolyfill } from "./debug";
import getOptionSpecificExcludesFor from "./get-option-specific-excludes";
import filterItems from "./filter-items";
import moduleTransformations from "./module-transformations";
import normalizeOptions from "./normalize-options";
import pluginList from "../data/plugins.json";
import { proposalPlugins, pluginSyntaxMap } from "../data/shipped-proposals";

import handlePolyfillImports from "./polyfills/handle-polyfill-imports";

// $FlowIgnore Flow doesn't support symlinked modules
import injectPolyfillsPlugin from "@babel/plugin-inject-polyfills";
// $FlowIgnore Flow doesn't support symlinked modules
import regeneratorPolyfillProvider from "@babel/polyfill-provider-regenerator";
// $FlowIgnore Flow doesn't support symlinked modules
import coreJS2PolyfillProvider from "@babel/polyfill-provider-corejs2";
// $FlowIgnore Flow doesn't support symlinked modules
import coreJS3PolyfillProvider from "@babel/polyfill-provider-corejs3";

import getTargets from "./targets-parser";
import availablePlugins from "./available-plugins";
import { filterStageFromList, prettifyTargets } from "./utils";
import { declare } from "@babel/helper-plugin-utils";

export { isPluginRequired } from "./filter-items";

const pluginListWithoutProposals = filterStageFromList(
  pluginList,
  proposalPlugins,
);

const getPlugin = (pluginName: string) => {
  const plugin = availablePlugins[pluginName];

  if (!plugin) {
    throw new Error(
      `Could not find plugin "${pluginName}". Ensure there is an entry in ./available-plugins.js for it.`,
    );
  }

  return plugin;
};

export const transformIncludesAndExcludes = (opts: Array<string>): Object => {
  return opts.reduce(
    (result, opt) => {
      const target = opt.match(/^(es|es6|es7|esnext|web)\./)
        ? "builtIns"
        : "plugins";
      result[target].add(opt);
      return result;
    },
    {
      all: opts,
      plugins: new Set(),
      builtIns: new Set(),
    },
  );
};

function supportsStaticESM(caller) {
  return !!(caller && caller.supportsStaticESM);
}

function supportsDynamicImport(caller) {
  return !!(caller && caller.supportsDynamicImport);
}

export default declare((api, opts) => {
  api.assertVersion(7);

  const {
    configPath,
    debug,
    exclude: optionsExclude,
    forceAllTransforms,
    ignoreBrowserslistConfig,
    include: optionsInclude,
    loose,
    modules,
    shippedProposals,
    spec,
    targets: optionsTargets,
    useBuiltIns,
    corejs: { version: corejs, proposals },
  } = normalizeOptions(opts);
  // TODO: remove this in next major
  let hasUglifyTarget = false;

  if (optionsTargets && optionsTargets.uglify) {
    hasUglifyTarget = true;
    delete optionsTargets.uglify;

    console.log("");
    console.log("The uglify target has been deprecated. Set the top level");
    console.log("option `forceAllTransforms: true` instead.");
    console.log("");
  }

  if (optionsTargets && optionsTargets.esmodules && optionsTargets.browsers) {
    console.log("");
    console.log(
      "@babel/preset-env: esmodules and browsers targets have been specified together.",
    );
    console.log(
      `\`browsers\` target, \`${optionsTargets.browsers}\` will be ignored.`,
    );
    console.log("");
  }

  const targets = getTargets(optionsTargets, {
    ignoreBrowserslistConfig,
    configPath,
  });
  const include = transformIncludesAndExcludes(optionsInclude);
  const exclude = transformIncludesAndExcludes(optionsExclude);

  const transformTargets = forceAllTransforms || hasUglifyTarget ? {} : targets;

  const transformations = filterItems(
    shippedProposals ? pluginList : pluginListWithoutProposals,
    include.plugins,
    exclude.plugins,
    transformTargets,
    null,
    getOptionSpecificExcludesFor({ loose }),
    pluginSyntaxMap,
  );

  const plugins = [];
  const pluginUseBuiltIns = useBuiltIns !== false;

  if (modules !== false && moduleTransformations[modules]) {
    // TODO: Remove the 'api.caller' check eventually. Just here to prevent
    // unnecessary breakage in the short term for users on older betas/RCs.
    const shouldTransformESM =
      modules !== "auto" || !api.caller || !api.caller(supportsStaticESM);
    const shouldTransformDynamicImport =
      modules !== "auto" || !api.caller || !api.caller(supportsDynamicImport);

    if (shouldTransformESM) {
      // NOTE: not giving spec here yet to avoid compatibility issues when
      // transform-modules-commonjs gets its spec mode
      plugins.push([getPlugin(moduleTransformations[modules]), { loose }]);
    }

    if (
      shouldTransformDynamicImport &&
      shouldTransformESM &&
      modules !== "umd"
    ) {
      plugins.push([getPlugin("proposal-dynamic-import"), { loose }]);
    } else {
      if (shouldTransformDynamicImport) {
        console.warn(
          "Dynamic import can only be supported when transforming ES modules" +
            " to AMD, CommonJS or SystemJS. Only the parser plugin will be enabled.",
        );
      }
      plugins.push(getPlugin("syntax-dynamic-import"));
    }
  } else {
    plugins.push(getPlugin("syntax-dynamic-import"));
  }

  transformations.forEach(pluginName =>
    plugins.push([
      getPlugin(pluginName),
      { spec, loose, useBuiltIns: pluginUseBuiltIns },
    ]),
  );

  if (debug) {
    console.log("@babel/preset-env: `DEBUG` option");
    console.log("\nUsing targets:");
    console.log(JSON.stringify(prettifyTargets(targets), null, 2));
    console.log(`\nUsing modules transform: ${modules.toString()}`);
    console.log("\nUsing plugins:");
    transformations.forEach(transform => {
      logPluginOrPolyfill(transform, targets, pluginList);
    });

    if (!useBuiltIns) {
      console.log(
        "\nUsing polyfills: No polyfills were added, since the `useBuiltIns` option was not set.",
      );
    } else {
      console.log(`\nUsing polyfills with \`${useBuiltIns}\` option:`);
    }
  }

  if (useBuiltIns === "usage" || useBuiltIns === "entry") {
    const regenerator = transformations.has("transform-regenerator");

    const providers = [];

    if (corejs) {
      plugins.push([
        handlePolyfillImports,
        {
          polyfillAction:
            useBuiltIns === "usage"
              ? "remove"
              : corejs.major === 2
              ? "replace"
              : "warn",
          removeRegenerator: useBuiltIns === "entry" && !regenerator,
        },
      ]);

      if (useBuiltIns === "usage") {
        if (corejs.major === 2) {
          providers.push([
            coreJS2PolyfillProvider,
            { include: include.builtIns, exclude: exclude.builtIns },
          ]);
        } else {
          providers.push([
            coreJS3PolyfillProvider,
            {
              include: include.builtIns,
              exclude: exclude.builtIns,
              proposals,
              shippedProposals,
              version: corejs,
            },
          ]);
        }
        if (regenerator) {
          providers.push(regeneratorPolyfillProvider);
        }
      } else if (useBuiltIns === "entry") {
        if (corejs.major === 2) {
          providers.push([
            coreJS2PolyfillProvider,
            {
              include: include.builtIns,
              exclude: exclude.builtIns,
              "#__secret_key__@babel/preset-env__compatibility": {
                entryInjectRegenerator: regenerator,
              },
            },
          ]);
        } else {
          providers.push([
            coreJS3PolyfillProvider,
            {
              include: include.builtIns,
              exclude: exclude.builtIns,
              proposals,
              shippedProposals,
              version: corejs,
            },
          ]);
        }
      }

      if (providers.length) {
        plugins.push([
          injectPolyfillsPlugin,
          { method: useBuiltIns + "-global", targets, providers },
        ]);
      }
    }
  }

  return { plugins };
});
