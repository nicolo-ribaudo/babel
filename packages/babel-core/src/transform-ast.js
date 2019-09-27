// @flow

import loadConfig, { type InputOptions, type ResolvedConfig } from "./config";
import {
  run,
  type FileResult,
  type FileResultCallback,
} from "./transformation";
import aSync from "./a-sync";

type AstRoot = BabelNodeFile | BabelNodeProgram;

type TransformFromAst = {
  (ast: AstRoot, code: string, callback: FileResultCallback): void,
  (
    ast: AstRoot,
    code: string,
    opts: ?InputOptions,
    callback: FileResultCallback,
  ): void,

  // Here for backward-compatibility. Ideally use ".transformSync" if you want
  // a synchronous API.
  (ast: AstRoot, code: string, opts: ?InputOptions): FileResult | null,
};

const transformFromAstRunner = aSync<FileResult | null>(function*(
  ast: AstRoot,
  code: string,
  opts: ?InputOptions,
) {
  const config: ResolvedConfig | null = yield loadConfig(opts);
  if (config === null) return null;

  if (!ast) throw new Error("No AST given");

  return yield run(config, code, ast);
});

export const transformFromAst: TransformFromAst = (function transformFromAst(
  ast,
  code,
  opts,
  callback,
) {
  if (typeof opts === "function") {
    callback = opts;
    opts = undefined;
  }

  const run = transformFromAstRunner(ast, code, opts);

  // For backward-compat with Babel 6, we allow sync transformation when
  // no callback is given. Will be dropped in some future Babel major version.
  if (callback === undefined) return run.sync();

  run.callback(callback);
}: Function);

export const transformFromAstSync = transformFromAstRunner.sync;
export const transformFromAstAsync = transformFromAstRunner.async;
