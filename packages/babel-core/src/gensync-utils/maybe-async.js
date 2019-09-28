// @flow

import gensync, { type Gensync } from "gensync";

export default function maybeAsync<T, Args: any[]>(
  fn: (...args: Args) => T,
  message: string,
): Gensync<Args, T> {
  return gensync({
    sync(...args) {
      const result = fn.apply(this, args);
      if (isThenable(result)) throw new Error(message);
      return result;
    },
    async(...args) {
      return Promise.resolve(fn.apply(this, args));
    },
  });
}

function isThenable(val: mixed): boolean {
  return (
    !!val &&
    (typeof val === "object" || typeof val === "function") &&
    !!val.then &&
    typeof val.then === "function"
  );
}
