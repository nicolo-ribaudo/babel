// @flow

/**
 * This file handles all logic for converting string-based configuration references into loaded objects.
 */

import buildDebug from "debug";
import path from "path";

import { hasInternalProtocol, loadInternal } from "./internal-plugins";

const debug = buildDebug("babel:config:loading:files:plugins");

const EXACT_RE = /^module:/;
const BABEL_PLUGIN_PREFIX_RE = /^(?!@|module:|internal:|[^/]+\/|babel-plugin-)/;
const BABEL_PRESET_PREFIX_RE = /^(?!@|module:|internal:|[^/]+\/|babel-preset-)/;
const BABEL_PLUGIN_ORG_RE = /^(@babel\/)(?!plugin-|[^/]+\/)/;
const BABEL_PRESET_ORG_RE = /^(@babel\/)(?!preset-|[^/]+\/)/;
const OTHER_PLUGIN_ORG_RE = /^(@(?!babel\/)[^/]+\/)(?![^/]*babel-plugin(?:-|\/|$)|[^/]+\/)/;
const OTHER_PRESET_ORG_RE = /^(@(?!babel\/)[^/]+\/)(?![^/]*babel-preset(?:-|\/|$)|[^/]+\/)/;
const OTHER_ORG_DEFAULT_RE = /^(@(?!babel$)[^/]+)$/;

export function resolvePlugin(name: string, dirname: string): string | null {
  return resolveStandardizedName("plugin", name, dirname);
}

export function resolvePreset(name: string, dirname: string): string | null {
  return resolveStandardizedName("preset", name, dirname);
}

export function loadPlugin(
  name: string,
  dirname: string,
): { filepath: string, value: mixed } {
  return loadPluginOrPreset("plugin", resolvePlugin, name, dirname);
}

export function loadPreset(
  name: string,
  dirname: string,
): { filepath: string, value: mixed } {
  return loadPluginOrPreset("preset", resolvePreset, name, dirname);
}

function loadPluginOrPreset(
  type: "plugin" | "preset",
  resolver: typeof resolvePlugin,
  name: string,
  dirname: string,
): { filepath: string, value: mixed } {
  const specifier = resolver(name, dirname);
  if (!specifier) {
    const capitalized = type === "plugin" ? "Plugin" : "Preset";
    throw new Error(`${capitalized} ${name} not found relative to ${dirname}`);
  }

  const value = hasInternalProtocol(specifier)
    ? loadInternal(type, specifier)
    : requireModule(type, specifier);

  debug("Loaded %o %o from %o.", type, name, dirname);

  return { filepath: specifier, value };
}

function standardizeName(type: "plugin" | "preset", name: string) {
  if (hasInternalProtocol(name)) return name;

  // Let absolute and relative paths through.
  if (path.isAbsolute(name)) return name;

  const isPreset = type === "preset";

  if (EXACT_RE.test(name)) {
    const specifier = name.replace(EXACT_RE, "");
    if (hasInternalProtocol(specifier)) {
      throw new Error(
        `Cannot mark a plugin both as 'module:' and 'internal:' (${name})`,
      );
    }
    return specifier;
  }

  return (
    name
      // foo -> babel-preset-foo
      .replace(
        isPreset ? BABEL_PRESET_PREFIX_RE : BABEL_PLUGIN_PREFIX_RE,
        `babel-${type}-`,
      )
      // @babel/es2015 -> @babel/preset-es2015
      .replace(
        isPreset ? BABEL_PRESET_ORG_RE : BABEL_PLUGIN_ORG_RE,
        `$1${type}-`,
      )
      // @foo/mypreset -> @foo/babel-preset-mypreset
      .replace(
        isPreset ? OTHER_PRESET_ORG_RE : OTHER_PLUGIN_ORG_RE,
        `$1babel-${type}-`,
      )
      // @foo -> @foo/babel-preset
      .replace(OTHER_ORG_DEFAULT_RE, `$1/babel-${type}`)
  );
}

function resolveStandardizedName(
  type: "plugin" | "preset",
  name: string,
  dirname: string = process.cwd(),
): string {
  const standardizedName = standardizeName(type, name);

  if (hasInternalProtocol(standardizedName)) {
    return standardizedName;
  }

  try {
    return require.resolve(standardizedName, {
      paths: [dirname],
    });
  } catch (e) {
    if (e.code !== "MODULE_NOT_FOUND") throw e;

    if (standardizedName !== name) {
      let resolvedOriginal = false;
      try {
        require.resolve(name, {
          paths: [dirname],
        });
        resolvedOriginal = true;
      } catch {}

      if (resolvedOriginal) {
        e.message += `\n- If you want to resolve "${name}", use "module:${name}"`;
      }
    }

    let resolvedBabel = false;
    try {
      require.resolve(standardizeName(type, "@babel/" + name), {
        paths: [dirname],
      });
      resolvedBabel = true;
    } catch {}

    if (resolvedBabel) {
      e.message += `\n- Did you mean "@babel/${name}"?`;
    }

    let resolvedOppositeType = false;
    const oppositeType = type === "preset" ? "plugin" : "preset";
    try {
      require.resolve(standardizeName(oppositeType, name), {
        paths: [dirname],
      });
      resolvedOppositeType = true;
    } catch {}

    if (resolvedOppositeType) {
      e.message += `\n- Did you accidentally pass a ${oppositeType} as a ${type}?`;
    }

    throw e;
  }
}

const LOADING_MODULES = new Set();
function requireModule(type: string, name: string): mixed {
  if (LOADING_MODULES.has(name)) {
    throw new Error(
      `Reentrant ${type} detected trying to load "${name}". This module is not ignored ` +
        "and is trying to load itself while compiling itself, leading to a dependency cycle. " +
        'We recommend adding it to your "ignore" list in your babelrc, or to a .babelignore.',
    );
  }

  try {
    LOADING_MODULES.add(name);
    return require(name);
  } finally {
    LOADING_MODULES.delete(name);
  }
}
