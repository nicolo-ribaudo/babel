import { declare } from "@babel/helper-plugin-utils";

export default declare(() => {
  return {
    name: "internal:transform-optional-catch-binding",

    visitor: {
      CatchClause(path) {
        if (!path.node.param) {
          const uid = path.scope.generateUidIdentifier("unused");
          const paramPath = path.get("param");
          paramPath.replaceWith(uid);
        }
      },
    },
  };
});
