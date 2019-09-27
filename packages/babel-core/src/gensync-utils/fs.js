// @flow

import fs from "fs";
import gensync from "gensync";

export const readFile = gensync<[string, "utf8"], string>({
  sync: fs.readFileSync,
  errback: fs.readFile,
});

export const exists = gensync<[string], boolean>({
  sync: fs.existsSync,
  errback: (path, cb) => fs.exists(path, res => cb(null, res)),
});
