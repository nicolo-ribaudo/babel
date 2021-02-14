import { declare } from "@babel/helper-plugin-utils";
import * as t from "@babel/types";

export default declare(() => {
  return {
    name: "internal:transform-typeof-symbol",

    visitor: {
      Scope({ scope }) {
        if (!scope.getBinding("Symbol")) {
          return;
        }

        scope.rename("Symbol");
      },

      UnaryExpression(path) {
        const { node, parent } = path;
        if (node.operator !== "typeof") return;

        if (
          path.parentPath.isBinaryExpression() &&
          t.EQUALITY_BINARY_OPERATORS.indexOf(parent.operator) >= 0
        ) {
          // optimise `typeof foo === "string"` since we can determine that they'll never
          // need to handle symbols
          const opposite = path.getOpposite();
          if (
            opposite.isLiteral() &&
            opposite.node.value !== "symbol" &&
            opposite.node.value !== "object"
          ) {
            return;
          }
        }

        const isUnderHelper = path.findParent(path => {
          if (path.isFunction()) {
            return (
              path.get("body.directives.0")?.node.value.value ===
              "@babel/helpers - typeof"
            );
          }
        });

        if (isUnderHelper) return;

        const helper = this.addHelper("typeof");
        const call = t.callExpression(helper, [node.argument]);
        const arg = path.get("argument");
        if (arg.isIdentifier() && !path.scope.hasBinding(arg.node.name, true)) {
          const unary = t.unaryExpression("typeof", t.cloneNode(node.argument));
          path.replaceWith(
            t.conditionalExpression(
              t.binaryExpression("===", unary, t.stringLiteral("undefined")),
              t.stringLiteral("undefined"),
              call,
            ),
          );
        } else {
          path.replaceWith(call);
        }
      },
    },
  };
});
