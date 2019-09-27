// @flow

import loadConfig, { type InputOptions } from "./config";
import normalizeFile from "./transformation/normalize-file";
import normalizeOptions from "./transformation/normalize-opts";
import aSync from "./a-sync";

type AstRoot = BabelNodeFile | BabelNodeProgram;

export type ParseResult = AstRoot;

export type FileParseCallback = {
  (Error, null): any,
  (null, ParseResult | null): any,
};

type Parse = {
  (code: string, callback: FileParseCallback): void,
  (code: string, opts: ?InputOptions, callback: FileParseCallback): void,

  // Here for backward-compatibility. Ideally use ".parseSync" if you want
  // a synchronous API.
  (code: string, opts: ?InputOptions): ParseResult | null,
};

// eslint-disable-next-line require-yield
const parseRunner = aSync<ParseResult | null>(function* parse(code, opts) {
  const config = yield loadConfig(opts);

  if (config === null) {
    return null;
  }

  return normalizeFile(config.passes, normalizeOptions(config), code).ast;
});

export const parse: Parse = (function parse(code, opts, callback) {
  if (typeof opts === "function") {
    callback = opts;
    opts = undefined;
  }

  const run = parseRunner(code, opts);

  // For backward-compat with Babel 7's early betas, we allow sync parsing when
  // no callback is given. Will be dropped in some future Babel major version.
  if (callback === undefined) return run.sync();

  run.callback(callback);
}: Function);

export const parseSync = parseRunner.sync;
export const parseAsync = parseRunner.async;
