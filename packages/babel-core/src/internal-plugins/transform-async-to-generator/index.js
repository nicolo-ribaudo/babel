import { declare } from "@babel/helper-plugin-utils";
import remapAsyncToGenerator from "@babel/helper-remap-async-to-generator";
import { addNamed } from "@babel/helper-module-imports";
import * as t from "@babel/types";

export default declare((api, options) => {
  const { method, module } = options;

  if (method && module) {
    return {
      name: "internal:transform-async-to-generator",

      visitor: {
        Function(path, state) {
          if (!path.node.async || path.node.generator) return;

          let wrapAsync = state.methodWrapper;
          if (wrapAsync) {
            wrapAsync = t.cloneNode(wrapAsync);
          } else {
            wrapAsync = state.methodWrapper = addNamed(path, method, module);
          }

          remapAsyncToGenerator(path, { wrapAsync });
        },
      },
    };
  }

  return {
    name: "internal:transform-async-to-generator",

    visitor: {
      Function(path, state) {
        if (!path.node.async || path.node.generator) return;

        remapAsyncToGenerator(path, {
          wrapAsync: state.addHelper("asyncToGenerator"),
        });
      },
    },
  };
});
