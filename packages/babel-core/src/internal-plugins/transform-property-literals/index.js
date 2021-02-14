import { declare } from "@babel/helper-plugin-utils";
import * as t from "@babel/types";

export default declare(() => {
  return {
    name: "internal:transform-property-literals",

    visitor: {
      ObjectProperty: {
        exit({ node }) {
          const key = node.key;
          if (
            !node.computed &&
            t.isIdentifier(key) &&
            !t.isValidES3Identifier(key.name)
          ) {
            // default: "bar" -> "default": "bar"
            node.key = t.stringLiteral(key.name);
          }
        },
      },
    },
  };
});
