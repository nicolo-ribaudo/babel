// @flow

import resolve from "resolve";
import { fromImplementations } from "./index";

export default fromImplementations<string>({
  sync: resolve.sync,
  async: (id, opts) =>
    new Promise((resolveP, rejectP) => {
      resolve(id, opts, (err, res) => {
        if (err) rejectP(err);
        else resolveP(res);
      });
    }),
  callback: resolve,
});
