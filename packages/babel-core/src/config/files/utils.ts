import type { Gensync, Handler } from "gensync";

import { makeStrongCache } from "../caching";
import type { CacheConfigurator } from "../caching";
import * as fs from "../../gensync-utils/fs";
import nodeFs from "fs";

export function makeStaticFileCache<T>(
  fn: (b: string, a: string) => T,
): Gensync<[string], T | null> {
  return makeStrongCache(function* (
    filepath: string,
    cache: CacheConfigurator<void | undefined | null>,
  ): Handler<null | T> {
    const cached = cache.invalidate(() => fileMtime(filepath));

    if (cached === null) {
      return null;
    }

    return fn(filepath, yield* fs.readFile(filepath, "utf8"));
  }) as Gensync<any, any>;
}

function fileMtime(filepath: string): number | null {
  try {
    return +nodeFs.statSync(filepath).mtime;
  } catch (e) {
    if (e.code !== "ENOENT" && e.code !== "ENOTDIR") throw e;
  }

  return null;
}
