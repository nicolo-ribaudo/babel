// @flow
import traverse from "@babel/traverse";
import typeof { SourceMap } from "convert-source-map";
import type { Handler } from "gensync";

import maybeAsync from "../gensync-utils/maybe-async";

import type { ResolvedConfig, PluginPasses } from "../config";

import PluginPass from "./plugin-pass";
import loadBlockHoistPlugin from "./block-hoist-plugin";
import normalizeOptions from "./normalize-opts";
import normalizeFile from "./normalize-file";

import generateCode from "./file/generate";
import type File from "./file/file";

export type FileResultCallback = {
  (Error, null): any,
  (null, FileResult | null): any,
};

export type FileResult = {
  metadata: {},
  options: {},
  ast: {} | null,
  code: string | null,
  map: SourceMap | null,
};

export function* run(
  config: ResolvedConfig,
  code: string,
  ast: ?(BabelNodeFile | BabelNodeProgram),
): Handler<FileResult> {
  const file = normalizeFile(
    config.passes,
    normalizeOptions(config),
    code,
    ast,
  );

  yield* transformFile(file, config.passes);

  const opts = file.opts;
  const { outputCode, outputMap } =
    opts.code !== false ? generateCode(config.passes, file) : {};

  return {
    metadata: file.metadata,
    options: opts,
    ast: opts.ast === true ? file.ast : null,
    code: outputCode === undefined ? null : outputCode,
    map: outputMap === undefined ? null : outputMap,
    sourceType: file.ast.program.sourceType,
  };
}

// eslint-disable-next-line require-yield
function* transformFile(file: File, pluginPasses: PluginPasses): Handler<void> {
  for (const pluginPairs of pluginPasses) {
    const passPairs = [];
    const passes = [];
    const visitors = [];

    for (const plugin of pluginPairs.concat([loadBlockHoistPlugin()])) {
      const pass = new PluginPass(file, plugin.key, plugin.options);

      passPairs.push([plugin, pass]);
      passes.push(pass);
      visitors.push(plugin.visitor);
    }

    for (const [plugin, pass] of passPairs) {
      const fn = plugin.pre;
      if (fn) {
        yield* maybeAsync(
          fn,
          `You appear to be using an plugin with an async .pre, ` +
            `but Babel has been called synchronously.`,
        ).call(pass, file);
      }
    }

    // merge all plugin visitors into a single visitor
    const visitor = traverse.visitors.merge(
      visitors,
      passes,
      file.opts.wrapPluginVisitorMethod,
    );
    traverse(file.ast, visitor, file.scope);

    for (const [plugin, pass] of passPairs) {
      const fn = plugin.post;
      if (fn) {
        yield* maybeAsync(
          fn,
          `You appear to be using an plugin with an async .post, ` +
            `but Babel has been called synchronously.`,
        ).call(pass, file);
      }
    }
  }
}
