// @flow

export default function aSync<Res>(
  runner: (...args: any) => Generator<any, Res, any>,
): ASync<Res> {
  return fromImplementations<Res>({
    sync() {
      const it = runner.apply(this, arguments);

      let result = it.next();
      while (!result.done) {
        result = it.next(result.value.sync());
      }
      return result.value;
    },
    async async() {
      const it = runner.apply(this, arguments);

      let result = it.next();
      while (!result.done) {
        result = it.next(await result.value.async());
      }
      return result.value;
    },
    callback(...args) {
      // Just delaying the transform one tick for now to simulate async behavior
      // but more async logic may land here eventually.
      process.nextTick(() => {
        const cb = args.pop();
        const it = runner.apply(this, args);

        try {
          run(it.next());
        } catch (err) {
          cb(err);
        }

        function run(result) {
          if (result.done) return cb(null, result.value);

          result.value.callback((err, res) => {
            try {
              run(err ? it.throw(err) : it.next(res));
            } catch (e) {
              cb(e);
            }
          });
        }
      });
    },
  });
}

export function fromImplementations<Res>({
  sync,
  async,
  callback,
}: *): ASync<Res> {
  function deferred() {
    return {
      sync: () => sync.apply(this, arguments),
      async: () => async.apply(this, arguments),
      callback: (cb: Callback<Res>) => callback.apply(this, [...arguments, cb]),
    };
  }

  deferred.sync = sync;
  deferred.async = async;
  deferred.callback = callback;

  return deferred;
}

export type ASync<Res> = {
  (
    ...any[]
  ): {
    sync(): Res,
    async(): Promise<Res>,
    callback(cb: Callback<Res>): void,
  },

  sync(...any[]): Res,
  async(...any[]): Promise<Res>,
  callback(...any[]): void,
} & Function;

type Callback<T> = {
  (err: Error): void,
  (err: null, res: T): void,
};
