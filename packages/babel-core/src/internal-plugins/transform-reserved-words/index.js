import { declare } from "@babel/helper-plugin-utils";
import * as t from "@babel/types";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "internal:transform-reserved-words",

    visitor: {
      "BindingIdentifier|ReferencedIdentifier"(path) {
        if (!t.isValidES3Identifier(path.node.name)) {
          path.scope.rename(path.node.name);
        }
      },
    },
  };
});
