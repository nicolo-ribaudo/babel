import { declare } from "@babel/helper-plugin-utils";
import build from "@babel/helper-builder-binary-assignment-operator-visitor";
import * as t from "@babel/types";

export default declare(() => {
  return {
    name: "internal:transform-exponentiation-operator",

    visitor: build({
      operator: "**",

      build(left, right) {
        return t.callExpression(
          t.memberExpression(t.identifier("Math"), t.identifier("pow")),
          [left, right],
        );
      },
    }),
  };
});
