// @flow

import loadFullConfig from "./full";
export type {
  ResolvedConfig,
  InputOptions,
  PluginPasses,
  Plugin,
} from "./full";

import { loadPartialConfig as loadPartialConfigRunner } from "./partial";

export { loadFullConfig as default };
export type { PartialConfig } from "./partial";

export const loadPartialConfig = loadPartialConfigRunner.sync;

export function loadOptions(opts: {}): Object | null {
  const config = loadFullConfig.sync(opts);

  return config ? config.options : null;
}
