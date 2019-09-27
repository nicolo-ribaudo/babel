// @flow

import gensync, { type Handler, type Gensync } from "gensync";
import { CacheConfigurator } from "./caching";

export type SimpleCacheConfigurator = SimpleCacheConfiguratorFn &
  SimpleCacheConfiguratorObj;

type SimpleCacheConfiguratorFn = {
  (boolean): void,
  <T>(handler: () => T): T,
};
type SimpleCacheConfiguratorObj = {
  forever: () => void,
  never: () => void,
  using: <T>(handler: () => T) => T,
  invalidate: <T>(handler: () => T) => T,
};

type CacheEntry<ResultT, SideChannel> = Array<{
  value: ResultT,
  valid: SideChannel => boolean,
}>;

export type { CacheConfigurator };

/**
 * Given a function with a single argument, cache its results based on its argument and how it
 * configures its caching behavior. Cached values are stored strongly.
 */
export function makeStrongCache<ArgT, ResultT, SideChannel>(
  handler: (ArgT, CacheConfigurator<SideChannel>) => Handler<ResultT>,
): Gensync<[ArgT, SideChannel], ResultT> {
  return makeCachedFunction<ArgT, ResultT, SideChannel, *>(new Map(), handler);
}

/**
 * Given a function with a single argument, cache its results based on its argument and how it
 * configures its caching behavior. Cached values are stored weakly and the function argument must be
 * an object type.
 */
export function makeWeakCache<
  ArgT: {} | Array<*> | $ReadOnlyArray<*>,
  ResultT,
  SideChannel,
>(
  handler: (ArgT, CacheConfigurator<SideChannel>) => Handler<ResultT>,
): Gensync<[ArgT, SideChannel], ResultT> {
  return makeCachedFunction<ArgT, ResultT, SideChannel, *>(
    new WeakMap(),
    handler,
  );
}

type CacheMap<ArgT, ResultT, SideChannel> =
  | Map<ArgT, CacheEntry<ResultT, SideChannel>>
  | WeakMap<ArgT, CacheEntry<ResultT, SideChannel>>;

function makeCachedFunction<
  ArgT,
  ResultT,
  SideChannel,
  // $FlowIssue https://github.com/facebook/flow/issues/4528
  Cache: CacheMap<ArgT, ResultT, SideChannel>,
>(
  callCache: Cache,
  handler: (ArgT, CacheConfigurator<SideChannel>) => Handler<ResultT>,
): Gensync<[ArgT, SideChannel], ResultT> {
  return gensync(function* cachedFunction(arg: ArgT, data: SideChannel) {
    let cachedValue: CacheEntry<ResultT, SideChannel> | void = callCache.get(
      arg,
    );

    if (cachedValue) {
      for (const { value, valid } of cachedValue) {
        if (valid(data)) return value;
      }
    }

    const cache = new CacheConfigurator(data);

    const value = yield* handler(arg, cache);

    if (!cache.configured()) cache.forever();

    cache.deactivate();

    switch (cache.mode()) {
      case "forever":
        cachedValue = [{ value, valid: () => true }];
        callCache.set(arg, cachedValue);
        break;
      case "invalidate":
        cachedValue = [{ value, valid: cache.validator() }];
        callCache.set(arg, cachedValue);
        break;
      case "valid":
        if (cachedValue) {
          cachedValue.push({ value, valid: cache.validator() });
        } else {
          cachedValue = [{ value, valid: cache.validator() }];
          callCache.set(arg, cachedValue);
        }
    }

    return value;
  });
}
