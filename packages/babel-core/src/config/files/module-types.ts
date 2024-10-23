import { isAsync, waitFor } from "../../gensync-utils/async.ts";
import type { Handler } from "gensync";
import path from "path";
import { pathToFileURL } from "url";
import { createRequire } from "module";
import semver from "semver";
import buildDebug from "debug";

import { endHiddenCallStack } from "../../errors/rewrite-stack-trace.ts";
import ConfigError from "../../errors/config-error.ts";

import type { InputOptions } from "../index.ts";
import { transformFileSync } from "../../transform-file.ts";

const debug = buildDebug("babel:config:loading:files:module-types");

const require = createRequire(import.meta.url);

if (!process.env.BABEL_8_BREAKING) {
  try {
    // Old Node.js versions don't support import() syntax.
    // eslint-disable-next-line no-var
    var import_:
      | ((specifier: string | URL) => any)
      | undefined = require("./import.cjs");
  } catch {}
}

export const supportsESM = semver.satisfies(
  process.versions.node,
  // older versions, starting from 10, support the dynamic
  // import syntax but always return a rejected promise.
  "^12.17 || >=13.2",
);

const LOADING_CJS_FILES = new Set();

function loadCjsDefault(filepath: string) {
  // The `require()` call below can make this code reentrant if a require hook
  // like @babel/register has been loaded into the system. That would cause
  // Babel to attempt to compile the `.babelrc.js` file as it loads below. To
  // cover this case, we auto-ignore re-entrant config processing. ESM loaders
  // do not have this problem, because loaders do not apply to themselves.
  if (LOADING_CJS_FILES.has(filepath)) {
    debug("Auto-ignoring usage of config %o.", filepath);
    return {};
  }

  let module;
  try {
    LOADING_CJS_FILES.add(filepath);
    module = endHiddenCallStack(require)(filepath);
  } finally {
    LOADING_CJS_FILES.delete(filepath);
  }

  if (process.env.BABEL_8_BREAKING) {
    return module != null &&
      (module.__esModule || module[Symbol.toStringTag] === "Module")
      ? module.default
      : module;
  } else {
    return module != null &&
      (module.__esModule || module[Symbol.toStringTag] === "Module")
      ? module.default ||
          /* fallbackToTranspiledModule */ (arguments[1] ? module : undefined)
      : module;
  }
}

const loadMjsFromPath = endHiddenCallStack(async function loadMjsFromPath(
  filepath: string,
) {
  const url = pathToFileURL(filepath).toString();

  if (process.env.BABEL_8_BREAKING) {
    return await import(url);
  } else {
    if (!import_) {
      throw new ConfigError(
        "Internal error: Native ECMAScript modules aren't supported by this platform.\n",
        filepath,
      );
    }

    return await import_(url);
  }
});

const SUPPORTED_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".cts"] as const);
type SetValue<T extends Set<unknown>> = T extends Set<infer U> ? U : never;

export default function* loadCodeDefault(
  filepath: string,
  loader: "require" | "auto",
  esmError: string,
  tlaError: string,
): Handler<unknown> {
  let async;

  let ext = path.extname(filepath);
  if (!SUPPORTED_EXTENSIONS.has(ext as any)) ext = ".js";

  const pattern =
    `${loader} ${ext}` as `${typeof loader} ${SetValue<typeof SUPPORTED_EXTENSIONS>}`;
  switch (pattern) {
    case "require .cjs":
    case "auto .cjs":
      if (process.env.BABEL_8_BREAKING) {
        return loadCjsDefault(filepath);
      } else {
        return loadCjsDefault(
          filepath,
          // @ts-ignore(Babel 7 vs Babel 8) Removed in Babel 8
          /* fallbackToTranspiledModule */ arguments[2],
        );
      }
    case "require .cts":
    case "auto .cts":
      return loadCtsDefault(filepath);
    case "auto .js":
    case "require .js":
    case "require .mjs": // Some versions of Node.js support require(esm):
      try {
        if (process.env.BABEL_8_BREAKING) {
          return loadCjsDefault(filepath);
        } else {
          return loadCjsDefault(
            filepath,
            // @ts-ignore(Babel 7 vs Babel 8) Removed in Babel 8
            /* fallbackToTranspiledModule */ arguments[2],
          );
        }
      } catch (e) {
        if (e.code === "ERR_REQUIRE_ASYNC_MODULE") {
          if (!(async ??= yield* isAsync())) {
            throw new ConfigError(tlaError, filepath);
          }
          // fall through: require() failed due to TLA
        } else if (
          e.code === "ERR_REQUIRE_ESM" ||
          (!process.env.BABEL_8_BREAKING && ext === ".mjs")
        ) {
          // fall through: require() failed due to ESM
        } else {
          throw e;
        }
      }
    // fall through: require() failed due to ESM or TLA, try import()
    case "auto .mjs":
      if ((async ??= yield* isAsync())) {
        return (yield* waitFor(loadMjsFromPath(filepath))).default;
      }
      throw new ConfigError(esmError, filepath);
    default:
      throw new Error("Internal Babel error: unreachable code.");
  }
}

function loadCtsDefault(filepath: string) {
  const ext = ".cts";
  const hasTsSupport = !!(
    require.extensions[".ts"] ||
    require.extensions[".cts"] ||
    require.extensions[".mts"]
  );

  let handler: NodeJS.RequireExtensions[""];

  if (!hasTsSupport) {
    const opts: InputOptions = {
      babelrc: false,
      configFile: false,
      sourceType: "unambiguous",
      sourceMaps: "inline",
      sourceFileName: path.basename(filepath),
      presets: [
        [
          getTSPreset(filepath),
          {
            onlyRemoveTypeImports: true,
            optimizeConstEnums: true,
            ...(process.env.BABEL_8_BREAKING
              ? {}
              : { allowDeclareFields: true }),
          },
        ],
      ],
    };

    handler = function (m, filename) {
      // If we want to support `.ts`, `.d.ts` must be handled specially.
      if (handler && filename.endsWith(ext)) {
        try {
          // @ts-expect-error Undocumented API
          return m._compile(
            transformFileSync(filename, {
              ...opts,
              filename,
            }).code,
            filename,
          );
        } catch (error) {
          if (!hasTsSupport) {
            // TODO(Babel 8): Add this as an optional peer dependency
            // eslint-disable-next-line import/no-extraneous-dependencies
            const packageJson = require("@babel/preset-typescript/package.json");
            if (semver.lt(packageJson.version, "7.21.4")) {
              console.error(
                "`.cts` configuration file failed to load, please try to update `@babel/preset-typescript`.",
              );
            }
          }
          throw error;
        }
      }
      return require.extensions[".js"](m, filename);
    };
    require.extensions[ext] = handler;
  }
  try {
    return loadCjsDefault(filepath);
  } finally {
    if (!hasTsSupport) {
      if (require.extensions[ext] === handler) delete require.extensions[ext];
      handler = undefined;
    }
  }
}

function getTSPreset(filepath: string) {
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    return require("@babel/preset-typescript");
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;

    let message =
      "You appear to be using a .cts file as Babel configuration, but the `@babel/preset-typescript` package was not found: please install it!";

    if (!process.env.BABEL_8_BREAKING) {
      if (process.versions.pnp) {
        // Using Yarn PnP, which doesn't allow requiring packages that are not
        // explicitly specified as dependencies.
        message += `
If you are using Yarn Plug'n'Play, you may also need to add the following configuration to your .yarnrc.yml file:

packageExtensions:
\t"@babel/core@*":
\t\tpeerDependencies:
\t\t\t"@babel/preset-typescript": "*"
`;
      }
    }

    throw new ConfigError(message, filepath);
  }
}
