// @flow

import fs from "fs";
import { fromImplementations } from "./index";

export const readFile = fromImplementations<string>({
  sync: fs.readFileSync,
  async: fs.promises.readFile,
  callback: fs.readFile,
});

export const exists = fromImplementations<string>({
  sync: fs.existsSync,
  async: path => new Promise(resolve => fs.exists(path, resolve)),
  callback: fs.exists,
});
