import gensync from "gensync";

export type {
  ResolvedConfig,
  InputOptions,
  PluginPasses,
  Plugin,
} from "./full";

import loadFullConfig from "./full";
import { loadPartialConfig as loadPartialConfigRunner } from "./partial";

export { loadFullConfig as default };
export type { PartialConfig } from "./partial";

const loadOptionsRunner = gensync<[unknown], any | null>(function* (opts) {
  const config = yield* loadFullConfig(opts);
  // NOTE: We want to return "null" explicitly, while ?. alone returns undefined
  return config?.options ?? null;
});

const maybeErrback = runner => (opts: unknown, callback: Function) => {
  if (callback === undefined && typeof opts === "function") {
    callback = opts;
    opts = undefined;
  }
  return callback ? runner.errback(opts, callback) : runner.sync(opts);
};

export const loadPartialConfig = maybeErrback(loadPartialConfigRunner);
export const loadPartialConfigSync = loadPartialConfigRunner.sync;
export const loadPartialConfigAsync = loadPartialConfigRunner.async;

export const loadOptions = maybeErrback(loadOptionsRunner);
export const loadOptionsSync = loadOptionsRunner.sync;
export const loadOptionsAsync = loadOptionsRunner.async;
