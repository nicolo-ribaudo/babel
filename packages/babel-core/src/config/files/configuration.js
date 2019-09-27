// @flow

import buildDebug from "debug";
import path from "path";
import json5 from "json5";
import { makeWeakCache } from "../caching";
import { makeStrongCache, type CacheConfigurator } from "../caching-a";
import makeAPI, { type PluginAPI } from "../helpers/config-api";
import { makeStaticFileCache } from "./utils";
import pathPatternToRegex from "../pattern-to-regex";
import type { FilePackageData, RelativeConfig, ConfigFile } from "./types";
import type { CallerMetadata } from "../validation/options";

import aSync from "../../a-sync";
import * as fs from "../../a-sync/fs";
import resolve from "../../a-sync/resolve";

const debug = buildDebug("babel:config:loading:files:configuration");

const BABEL_CONFIG_JS_FILENAME = "babel.config.js";

const BABELRC_FILENAME = ".babelrc";
const BABELRC_JS_FILENAME = ".babelrc.js";
const BABELIGNORE_FILENAME = ".babelignore";

export const findConfigUpwards = aSync<string | null>(
  function* findConfigUpwards(rootDir: string) {
    let dirname = rootDir;
    while (true) {
      if (yield fs.exists(path.join(dirname, BABEL_CONFIG_JS_FILENAME))) {
        return dirname;
      }

      const nextDir = path.dirname(dirname);
      if (dirname === nextDir) break;
      dirname = nextDir;
    }

    return null;
  },
);

export const findRelativeConfig = aSync<RelativeConfig>(
  function* findRelativeConfig(
    packageData: FilePackageData,
    envName: string,
    caller: CallerMetadata | void,
  ) {
    if (0) yield;

    let config = null;
    let ignore = null;

    const dirname = path.dirname(packageData.filepath);

    for (const loc of packageData.directories) {
      if (!config) {
        const filepath1 = path.join(loc, BABELRC_FILENAME);
        const filepath2 = path.join(loc, BABELRC_JS_FILENAME);

        const config1 = yield readConfig(filepath1, envName, caller);
        const config2 = yield readConfig(filepath2, envName, caller);

        if (config1 && config2) {
          throw new Error(
            `Multiple configuration files found. Please remove one:\n` +
              ` - ${path.basename(config1.filepath)}\n` +
              ` - ${BABELRC_JS_FILENAME}\n` +
              `from ${loc}`,
          );
        }

        config = config1 || config2;

        const pkgConfig =
          packageData.pkg && packageData.pkg.dirname === loc
            ? packageToBabelConfig(packageData.pkg)
            : null;

        if (pkgConfig) {
          if (config) {
            throw new Error(
              `Multiple configuration files found. Please remove one:\n` +
                ` - ${path.basename(pkgConfig.filepath)}#babel\n` +
                ` - ${path.basename(config.filepath)}\n` +
                `from ${loc}`,
            );
          }
          config = pkgConfig;
        }

        if (config) {
          debug("Found configuration %o from %o.", config.filepath, dirname);
        }
      }

      if (!ignore) {
        const ignoreLoc = path.join(loc, BABELIGNORE_FILENAME);
        ignore = readIgnoreConfig(ignoreLoc);

        if (ignore) {
          debug("Found ignore %o from %o.", ignore.filepath, dirname);
        }
      }
    }

    return { config, ignore };
  },
);

export function findRootConfig(
  dirname: string,
  envName: string,
  caller: CallerMetadata | void,
): ConfigFile | null {
  const filepath = path.resolve(dirname, BABEL_CONFIG_JS_FILENAME);

  const conf = readConfig(filepath, envName, caller).sync();
  if (conf) {
    debug("Found root config %o in %o.", BABEL_CONFIG_JS_FILENAME, dirname);
  }
  return conf;
}

export const loadConfig = aSync<ConfigFile>(function* loadConfig(
  name: string,
  dirname: string,
  envName: string,
  caller: CallerMetadata | void,
) {
  const filepath = yield resolve(name, { basedir: dirname });

  const conf = yield readConfig(filepath, envName, caller);
  if (!conf) {
    throw new Error(`Config file ${filepath} contains no configuration data`);
  }

  debug("Loaded config %o from %o.", name, dirname);
  return conf;
});

/**
 * Read the given config file, returning the result. Returns null if no config was found, but will
 * throw if there are parsing errors while loading a config.
 */
function readConfig(filepath, envName, caller) {
  return path.extname(filepath) === ".js"
    ? readConfigJS(filepath, { envName, caller })
    : readConfigJSON5(filepath);
}

const LOADING_CONFIGS = new Set();

const readConfigJS = makeStrongCache(
  aSync<ConfigFile | null>(function* readConfigJS(
    filepath: string,
    cache: CacheConfigurator<{
      envName: string,
      caller: CallerMetadata | void,
    }>,
  ) {
    if (!(yield fs.exists(filepath))) {
      cache.forever();
      return null;
    }

    // The `require()` call below can make this code reentrant if a require hook like @babel/register has been
    // loaded into the system. That would cause Babel to attempt to compile the `.babelrc.js` file as it loads
    // below. To cover this case, we auto-ignore re-entrant config processing.
    if (LOADING_CONFIGS.has(filepath)) {
      cache.never();

      debug("Auto-ignoring usage of config %o.", filepath);
      return {
        filepath,
        dirname: path.dirname(filepath),
        options: {},
      };
    }

    let options;
    try {
      LOADING_CONFIGS.add(filepath);

      // $FlowIssue
      const configModule = (require(filepath): mixed);
      options =
        configModule && configModule.__esModule
          ? configModule.default || undefined
          : configModule;
    } catch (err) {
      err.message = `${filepath}: Error while loading config - ${err.message}`;
      throw err;
    } finally {
      LOADING_CONFIGS.delete(filepath);
    }

    if (typeof options === "function") {
      options = ((options: any): (api: PluginAPI) => {})(makeAPI(cache));

      if (!cache.configured()) throwConfigError();
    }

    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new Error(
        `${filepath}: Configuration should be an exported JavaScript object.`,
      );
    }

    if (typeof options.then === "function") {
      throw new Error(
        `You appear to be using an async configuration, ` +
          `which your current version of Babel does not support. ` +
          `We may add support for this in the future, ` +
          `but if you're on the most recent version of @babel/core and still ` +
          `seeing this error, then you'll need to synchronously return your config.`,
      );
    }

    return {
      filepath,
      dirname: path.dirname(filepath),
      options,
    };
  }),
);

const packageToBabelConfig = makeWeakCache(
  (file: ConfigFile): ConfigFile | null => {
    const babel = file.options[("babel": string)];

    if (typeof babel === "undefined") return null;

    if (typeof babel !== "object" || Array.isArray(babel) || babel === null) {
      throw new Error(`${file.filepath}: .babel property must be an object`);
    }

    return {
      filepath: file.filepath,
      dirname: file.dirname,
      options: babel,
    };
  },
);

const readConfigJSON5 = makeStaticFileCache((filepath, content) => {
  let options;
  try {
    options = json5.parse(content);
  } catch (err) {
    err.message = `${filepath}: Error while parsing config - ${err.message}`;
    throw err;
  }

  if (!options) throw new Error(`${filepath}: No config detected`);

  if (typeof options !== "object") {
    throw new Error(`${filepath}: Config returned typeof ${typeof options}`);
  }
  if (Array.isArray(options)) {
    throw new Error(`${filepath}: Expected config object but found array`);
  }

  return {
    filepath,
    dirname: path.dirname(filepath),
    options,
  };
});

const readIgnoreConfig = makeStaticFileCache((filepath, content) => {
  const ignoreDir = path.dirname(filepath);
  const ignorePatterns = content
    .split("\n")
    .map(line => line.replace(/#(.*?)$/, "").trim())
    .filter(line => !!line);

  for (const pattern of ignorePatterns) {
    if (pattern[0] === "!") {
      throw new Error(`Negation of file paths is not supported.`);
    }
  }

  return {
    filepath,
    dirname: path.dirname(filepath),
    ignore: ignorePatterns.map(pattern =>
      pathPatternToRegex(pattern, ignoreDir),
    ),
  };
}).sync;

function throwConfigError() {
  throw new Error(`\
Caching was left unconfigured. Babel's plugins, presets, and .babelrc.js files can be configured
for various types of caching, using the first param of their handler functions:

module.exports = function(api) {
  // The API exposes the following:

  // Cache the returned value forever and don't call this function again.
  api.cache(true);

  // Don't cache at all. Not recommended because it will be very slow.
  api.cache(false);

  // Cached based on the value of some function. If this function returns a value different from
  // a previously-encountered value, the plugins will re-evaluate.
  var env = api.cache(() => process.env.NODE_ENV);

  // If testing for a specific env, we recommend specifics to avoid instantiating a plugin for
  // any possible NODE_ENV value that might come up during plugin execution.
  var isProd = api.cache(() => process.env.NODE_ENV === "production");

  // .cache(fn) will perform a linear search though instances to find the matching plugin based
  // based on previous instantiated plugins. If you want to recreate the plugin and discard the
  // previous instance whenever something changes, you may use:
  var isProd = api.cache.invalidate(() => process.env.NODE_ENV === "production");

  // Note, we also expose the following more-verbose versions of the above examples:
  api.cache.forever(); // api.cache(true)
  api.cache.never();   // api.cache(false)
  api.cache.using(fn); // api.cache(fn)

  // Return the value that will be cached.
  return { };
};`);
}
