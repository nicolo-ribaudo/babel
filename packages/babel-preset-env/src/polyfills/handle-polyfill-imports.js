// @flow

import { getImportSource, getRequireSource } from "../utils";
import type { NodePath } from "@babel/traverse";
import typeof * as BabelApi from "@babel/core";

type Opts = {
  polyfillAction: "warn" | "remove" | "replace",
  removeRegenerator: boolean,
  debug: boolean,
};

const BABEL_POLYFILL_DEPRECATION = `
  \`@babel/polyfill\` is deprecated. Please, use required parts of \`core-js\`
  and \`regenerator-runtime/runtime\` separately`;

const NO_DIRECT_COREJS_IMPORT = `
  When setting \`useBuiltIns: 'usage'\`, polyfills are automatically imported when needed.
  Please remove the direct import of \`core-js\` or use \`useBuiltIns: 'entry'\` instead.`;

const NO_DIRECT_POLYFILL_IMPORT = `
  When setting \`useBuiltIns: 'usage'\`, polyfills are automatically imported when needed.
  Please remove the \`import '@babel/polyfill'\` call or use \`useBuiltIns: 'entry'\` instead.`;

export default function(
  { template }: BabelApi,
  { polyfillAction, removeRegenerator, debug }: Opts,
) {
  const importStmt = template.statement({
    sourceType: "module",
  })`import "core-js"`;
  const requireStmt = template.statement`require("core-js")`;

  const handler = (getSource, getReplacement, path, filename) => {
    const source = getSource(path);

    if (source === "regenerator-runtime/runtime" && removeRegenerator) {
      if (debug) {
        console.log(
          `\n[${filename}] Based on your targets, ` +
            `regenerator-runtime import excluded.`,
        );
      }
      path.remove();
    }

    if (source === "core-js" && polyfillAction === "remove") {
      console.warn(NO_DIRECT_COREJS_IMPORT);
      path.remove();
    }

    if (source !== "@babel/polyfill") return;

    if (polyfillAction === "warn") {
      console.warn(BABEL_POLYFILL_DEPRECATION);
    } else if (polyfillAction === "remove") {
      console.warn(NO_DIRECT_POLYFILL_IMPORT);
      path.remove();
    } else if (polyfillAction === "replace") {
      if (debug) {
        console.log(
          `\n[${filename}] The '@babel/polyfill' import has ` +
            `been internally replaced with 'core-js'.`,
        );
      }
      path.replaceWith(getReplacement());
    }
  };

  return {
    name: "@babel/preset-env/handle-babel-polyfill-import",
    visitor: {
      ImportDeclaration(path: NodePath) {
        handler(getImportSource, importStmt, path, this.filename);
      },
      Program(path: NodePath) {
        path.get("body").forEach(path => {
          handler(getRequireSource, requireStmt, path, this.filename);
        });
      },
    },
  };
}
