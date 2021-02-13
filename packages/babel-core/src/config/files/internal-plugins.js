// NOTE: This file is loaded both in Node.js and in the browser.
// It cannot use Node.js API, and it cannot import files that use it.

import { plugins as internalPlugins } from "../../internal-plugins/index";

const INTERNAL_RE = /^internal:/;

export function hasInternalProtocol(name: string): boolean {
  return INTERNAL_RE.test(name);
}

export function loadInternal(type: "preset" | "plugin", name: string) {
  const unqualifiedName = name.replace(INTERNAL_RE, "");
  if (type === "plugin" && unqualifiedName in internalPlugins) {
    return internalPlugins[unqualifiedName];
  }
  throw new Error(`Unknown internal ${type}: "${name}".`);
}
