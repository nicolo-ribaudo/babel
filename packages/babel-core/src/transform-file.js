// @flow

import loadConfig, { type InputOptions, type ResolvedConfig } from "./config";
import {
  run,
  type FileResult,
  type FileResultCallback,
} from "./transformation";
import aSync from "./a-sync";
import * as fs from "./a-sync/fs";

import typeof * as transformFileBrowserType from "./transform-file-browser";
import typeof * as transformFileType from "./transform-file";

// Kind of gross, but essentially asserting that the exports of this module are the same as the
// exports of transform-file-browser, since this file may be replaced at bundle time with
// transform-file-browser.
((({}: any): $Exact<transformFileBrowserType>): $Exact<transformFileType>);

type TransformFile = {
  (filename: string, callback: FileResultCallback): void,
  (filename: string, opts: ?InputOptions, callback: FileResultCallback): void,
};

const transformFileRunner = aSync<FileResult | null>(function*(
  filename: string,
  opts: ?InputOptions,
) {
  let options;
  if (opts == null) {
    options = { filename };
  } else if (opts && typeof opts === "object") {
    options = {
      ...opts,
      filename,
    };
  }

  const config: ResolvedConfig | null = yield loadConfig(options);
  if (config === null) return null;

  const code = yield fs.readFile(filename, "utf8");
  const result = yield run(config, code);

  return result;
});

export const transformFile: TransformFile = transformFileRunner.callback;
export const transformFileSync = transformFileRunner.sync;
export const transformFileAsync = transformFileRunner.async;
