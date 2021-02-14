import { declare } from "@babel/helper-plugin-utils";
import * as t from "@babel/types";

export default declare(() => {
  return {
    name: "internal:transform-sticky-regex",

    visitor: {
      RegExpLiteral(path) {
        const { node } = path;
        if (!node.flags.includes("y")) return;

        path.replaceWith(
          t.newExpression(t.identifier("RegExp"), [
            t.stringLiteral(node.pattern),
            t.stringLiteral(node.flags),
          ]),
        );
      },
    },
  };
});
