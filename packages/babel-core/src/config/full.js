// @flow

import gensync, { type Handler } from "gensync";
import { forwardAsync } from "../gensync-utils/async";

import { mergeOptions } from "./util";
import * as context from "../index";
import Plugin from "./plugin";
import { getItemDescriptor } from "./item";
import {
  buildPresetChain,
  type ConfigContext,
  type ConfigChain,
  type PresetInstance,
} from "./config-chain";
import type { UnloadedDescriptor } from "./config-descriptors";
import traverse from "@babel/traverse";
import {
  makeWeakCache,
  makeWeakCacheSync,
  type CacheConfigurator,
} from "./caching";
import {
  validate,
  type CallerMetadata,
  checkNoUnwrappedItemOptionPairs,
} from "./validation/options";
import { validatePluginObject } from "./validation/plugins";
import makeAPI from "./helpers/config-api";

import loadPrivatePartialConfig from "./partial";
import type { ValidatedOptions } from "./validation/options";

type LoadedDescriptor = {
  value: {},
  options: {},
  dirname: string,
  alias: string,
};

export type { InputOptions } from "./validation/options";

export type ResolvedConfig = {
  options: Object,
  passes: PluginPasses,
};

export type { Plugin };
export type PluginPassList = Array<Plugin>;
export type PluginPasses = Array<PluginPassList>;

// Context not including filename since it is used in places that cannot
// process 'ignore'/'only' and other filename-based logic.
type SimpleContext = {
  envName: string,
  caller: CallerMetadata | void,
};

export default gensync<[any], ResolvedConfig | null>(function* loadFullConfig(
  inputOpts: mixed,
): Handler<ResolvedConfig | null> {
  const result = yield* loadPrivatePartialConfig(inputOpts);
  if (!result) {
    return null;
  }
  const { options, context } = result;

  const optionDefaults = {};

  const { plugins, presets } = options;

  if (!plugins || !presets) {
    throw new Error("Assertion failure - plugins and presets exist");
  }

  const toDescriptor = item => {
    const desc = getItemDescriptor(item);
    if (!desc) {
      throw new Error("Assertion failure - must be config item");
    }

    return desc;
  };

  const presetsDescriptors = presets.map(toDescriptor);
  const initialPluginsDescriptors = plugins.map(toDescriptor);
  const pluginDescriptorsByPass = [[]];
  const passes = [];

  const ignored = yield* enhanceError(
    context,
    function* recursePresetDescriptors(
      rawPresets: Array<UnloadedDescriptor>,
      pluginDescriptorsPass: Array<UnloadedDescriptor>,
    ) {
      const presets = [];

      for (let i = 0; i < rawPresets.length; i++) {
        const descriptor = rawPresets[i];
        if (descriptor.options !== false) {
          try {
            presets.push({
              preset: yield* loadPresetDescriptor(descriptor, context),
              pass: descriptor.ownPass ? [] : pluginDescriptorsPass,
            });
          } catch (e) {
            if (e.code === "BABEL_UNKNOWN_OPTION") {
              checkNoUnwrappedItemOptionPairs(rawPresets, i, "preset", e);
            }
            throw e;
          }
        }
      }

      // resolve presets
      if (presets.length > 0) {
        // The passes are created in the same order as the preset list, but are inserted before any
        // existing additional passes.
        pluginDescriptorsByPass.splice(
          1,
          0,
          ...presets.map(o => o.pass).filter(p => p !== pluginDescriptorsPass),
        );

        for (const { preset, pass } of presets) {
          if (!preset) return true;

          pass.unshift(...preset.plugins);

          const ignored = yield* recursePresetDescriptors(preset.presets, pass);
          if (ignored) return true;

          preset.options.forEach(opts => {
            mergeOptions(optionDefaults, opts);
          });
        }
      }
    },
  )(presetsDescriptors, pluginDescriptorsByPass[0]);

  if (ignored) return null;

  const opts: Object = optionDefaults;
  mergeOptions(opts, options);

  yield* enhanceError(context, function* loadPluginDescriptors() {
    pluginDescriptorsByPass[0].unshift(...initialPluginsDescriptors);

    for (const descs of pluginDescriptorsByPass) {
      const pass = [];
      passes.push(pass);

      for (let i = 0; i < descs.length; i++) {
        const descriptor = descs[i];
        if (descriptor.options !== false) {
          try {
            pass.push(yield* loadPluginDescriptor(descriptor, context));
          } catch (e) {
            if (e.code === "BABEL_UNKNOWN_PLUGIN_PROPERTY") {
              // print special message for `plugins: ["@babel/foo", { foo: "option" }]`
              checkNoUnwrappedItemOptionPairs(descs, i, "plugin", e);
            }
            throw e;
          }
        }
      }
    }
  })();

  opts.plugins = passes[0];
  opts.presets = passes
    .slice(1)
    .filter(plugins => plugins.length > 0)
    .map(plugins => ({ plugins }));
  opts.passPerPreset = opts.presets.length > 0;

  return {
    options: opts,
    passes: passes,
  };
});

function enhanceError<T: Function>(context, fn: T): T {
  return (function*(arg1, arg2) {
    try {
      return yield* fn(arg1, arg2);
    } catch (e) {
      // There are a few case where thrown errors will try to annotate themselves multiple times, so
      // to keep things simple we just bail out if re-wrapping the message.
      if (!/^\[BABEL\]/.test(e.message)) {
        e.message = `[BABEL] ${context.filename || "unknown"}: ${e.message}`;
      }

      throw e;
    }
  }: any);
}

/**
 * Load a generic plugin/preset from the given descriptor loaded from the config object.
 */
const loadDescriptor = makeWeakCache(function*(
  { value, options, dirname, alias }: UnloadedDescriptor,
  cache: CacheConfigurator<SimpleContext>,
): Handler<LoadedDescriptor> {
  // Disabled presets should already have been filtered out
  if (options === false) throw new Error("Assertion failure");

  options = options || {};

  let item = value;
  if (typeof value === "function") {
    const api = {
      ...context,
      ...makeAPI(cache),
    };
    try {
      item = value(api, options, dirname);
    } catch (e) {
      if (alias) {
        e.message += ` (While processing: ${JSON.stringify(alias)})`;
      }
      throw e;
    }
  }

  if (!item || typeof item !== "object") {
    throw new Error("Plugin/Preset did not return an object.");
  }

  if (typeof item.then === "function") {
    yield* []; // if we want to support async plugins

    throw new Error(
      `You appear to be using an async plugin, ` +
        `which your current version of Babel does not support. ` +
        `If you're using a published plugin, ` +
        `you may need to upgrade your @babel/core version.`,
    );
  }

  return { value: item, options, dirname, alias };
});

/**
 * Instantiate a plugin for the given descriptor, returning the plugin/options pair.
 */
function* loadPluginDescriptor(
  descriptor: UnloadedDescriptor,
  context: SimpleContext,
): Handler<Plugin> {
  if (descriptor.value instanceof Plugin) {
    if (descriptor.options) {
      throw new Error(
        "Passed options to an existing Plugin instance will not work.",
      );
    }

    return descriptor.value;
  }

  return yield* instantiatePlugin(
    yield* loadDescriptor(descriptor, context),
    context,
  );
}

const instantiatePlugin = makeWeakCache(function*(
  { value, options, dirname, alias }: LoadedDescriptor,
  cache: CacheConfigurator<SimpleContext>,
): Handler<Plugin> {
  const pluginObj = validatePluginObject(value);

  const plugin = {
    ...pluginObj,
  };
  if (plugin.visitor) {
    plugin.visitor = traverse.explode({
      ...plugin.visitor,
    });
  }

  if (plugin.inherits) {
    const inheritsDescriptor = {
      name: undefined,
      alias: `${alias}$inherits`,
      value: plugin.inherits,
      options,
      dirname,
    };

    const inherits = yield* forwardAsync(loadPluginDescriptor, run => {
      // If the inherited plugin changes, reinstantiate this plugin.
      return cache.invalidate(data => run(inheritsDescriptor, data));
    });

    plugin.pre = chain(inherits.pre, plugin.pre);
    plugin.post = chain(inherits.post, plugin.post);
    plugin.manipulateOptions = chain(
      inherits.manipulateOptions,
      plugin.manipulateOptions,
    );
    plugin.visitor = traverse.visitors.merge([
      inherits.visitor || {},
      plugin.visitor || {},
    ]);
  }

  return new Plugin(plugin, options, alias);
});

const validateIfOptionNeedsFilename = (
  options: ValidatedOptions,
  descriptor: UnloadedDescriptor,
): void => {
  if (options.test || options.include || options.exclude) {
    const formattedPresetName = descriptor.name
      ? `"${descriptor.name}"`
      : "/* your preset */";
    throw new Error(
      [
        `Preset ${formattedPresetName} requires a filename to be set when babel is called directly,`,
        `\`\`\``,
        `babel.transform(code, { filename: 'file.ts', presets: [${formattedPresetName}] });`,
        `\`\`\``,
        `See https://babeljs.io/docs/en/options#filename for more information.`,
      ].join("\n"),
    );
  }
};

const validatePreset = (
  preset: PresetInstance,
  context: ConfigContext,
  descriptor: UnloadedDescriptor,
): void => {
  if (!context.filename) {
    const { options } = preset;
    validateIfOptionNeedsFilename(options, descriptor);
    if (options.overrides) {
      options.overrides.forEach(overrideOptions =>
        validateIfOptionNeedsFilename(overrideOptions, descriptor),
      );
    }
  }
};

/**
 * Generate a config object that will act as the root of a new nested config.
 */
function* loadPresetDescriptor(
  descriptor: UnloadedDescriptor,
  context: ConfigContext,
): Handler<ConfigChain | null> {
  const preset = instantiatePreset(yield* loadDescriptor(descriptor, context));
  validatePreset(preset, context, descriptor);
  return yield* buildPresetChain(preset, context);
}

const instantiatePreset = makeWeakCacheSync(
  ({ value, dirname, alias }: LoadedDescriptor): PresetInstance => {
    return {
      options: validate("preset", value),
      alias,
      dirname,
    };
  },
);

function chain(a, b) {
  const fns = [a, b].filter(Boolean);
  if (fns.length <= 1) return fns[0];

  return function(...args) {
    for (const fn of fns) {
      fn.apply(this, args);
    }
  };
}
