// @flow

import nodeFs from "fs";
import { type Gensync } from "gensync";

import { makeStrongCache, type CacheConfigurator } from "../caching-a";
import * as fs from "../../gensync-utils/fs";

export function makeStaticFileCache<T>(
  fn: (string, string) => T,
): Gensync<[string], T | null> {
  return (makeStrongCache(function*(
    filepath: string,
    cache: CacheConfigurator<?void>,
  ) {
    if (cache.invalidate(() => fileMtime(filepath)) === null) {
      cache.forever();
      return null;
    }

    return fn(filepath, yield* fs.readFile(filepath, "utf8"));
  }): Gensync<any, *>);
}

function fileMtime(filepath: string): number | null {
  try {
    return +nodeFs.statSync(filepath).mtime;
  } catch (e) {
    if (e.code !== "ENOENT" && e.code !== "ENOTDIR") throw e;
  }

  return null;
}
