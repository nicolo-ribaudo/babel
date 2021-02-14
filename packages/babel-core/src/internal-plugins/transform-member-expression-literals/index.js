import { declare } from "@babel/helper-plugin-utils";
import * as t from "@babel/types";

export default declare(() => {
  return {
    name: "internal:transform-member-expression-literals",

    visitor: {
      MemberExpression: {
        exit({ node }) {
          const prop = node.property;
          if (
            !node.computed &&
            t.isIdentifier(prop) &&
            !t.isValidES3Identifier(prop.name)
          ) {
            // foo.default -> foo["default"]
            node.property = t.stringLiteral(prop.name);
            node.computed = true;
          }
        },
      },
    },
  };
});
