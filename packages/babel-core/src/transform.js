// @flow
import loadConfig, { type InputOptions, type ResolvedConfig } from "./config";
import {
  run,
  type FileResult,
  type FileResultCallback,
} from "./transformation";
import aSync from "./a-sync";

type Transform = {
  (code: string, callback: FileResultCallback): void,
  (code: string, opts: ?InputOptions, callback: FileResultCallback): void,

  // Here for backward-compatibility. Ideally use ".transformSync" if you want
  // a synchronous API.
  (code: string, opts: ?InputOptions): FileResult | null,
};

const transformRunner = aSync<FileResult | null>(function* transform(
  code: string,
  opts: ?InputOptions,
) {
  const config: ResolvedConfig | null = yield loadConfig(opts);
  if (config === null) return null;

  return yield run(config, code);
});

export const transform: Transform = (function transform(code, opts, callback) {
  if (typeof opts === "function") {
    callback = opts;
    opts = undefined;
  }

  const run = transformRunner(code, opts);

  // For backward-compat with Babel 6, we allow sync transformation when
  // no callback is given. Will be dropped in some future Babel major version.
  if (callback === undefined) return run.sync();

  run.callback(callback);
}: Function);

export const transformSync = transformRunner.sync;
export const transformAsync = transformRunner.async;
