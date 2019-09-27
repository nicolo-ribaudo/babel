// @flow

import nodeFs from "fs";
import { makeStrongCache } from "../caching-a";
import aSync, { type ASync } from "../../a-sync";
import * as fs from "../../a-sync/fs";

export function makeStaticFileCache<T>(
  fn: (string, string) => T,
): ASync<T | null> {
  return makeStrongCache(
    aSync<T | null>(function*(filepath, cache) {
      if (cache.invalidate(() => fileMtime(filepath)) === null) {
        cache.forever();
        return null;
      }

      return fn(filepath, yield fs.readFile(filepath, "utf8"));
    }),
  );
}

function fileMtime(filepath: string): number | null {
  try {
    return +nodeFs.statSync(filepath).mtime;
  } catch (e) {
    if (e.code !== "ENOENT" && e.code !== "ENOTDIR") throw e;
  }

  return null;
}
