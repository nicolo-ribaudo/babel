import { declare } from "@babel/helper-plugin-utils";
import syntaxClassStaticBlock from "@babel/plugin-syntax-class-static-block";
import type * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";
/**
 * Generate a uid that is not in `denyList`
 *
 * @param {*} scope
 * @param {Set<string>} a deny list that the generated uid should avoid
 * @returns
 */
function generateUid(scope, denyList: Set<string>) {
  const name = "";
  let uid;
  let i = 1;
  do {
    uid = scope._generateUid(name, i);
    i++;
  } while (denyList.has(uid));
  return uid;
}

export default declare(({ types: t, template, assertVersion }) => {
  assertVersion("^7.12.0");

  return {
    name: "proposal-class-static-block",
    inherits: syntaxClassStaticBlock,
    visitor: {
      Class(path: NodePath<t.Class>) {
        const { scope } = path;
        const classBody = path.get("body");
        const privateNames = new Set<string>();
        let staticBlockPath;
        for (const path of classBody.get("body")) {
          if (path.isPrivate()) {
            // @ts-expect-error todo(flow->ts) NodePath.get types
            privateNames.add(path.get("key.id").node.name);
          } else if (path.isStaticBlock()) {
            staticBlockPath = path;
          }
        }
        if (!staticBlockPath) {
          return;
        }
        const staticBlockRef = t.privateName(
          t.identifier(generateUid(scope, privateNames)),
        );
        classBody.pushContainer(
          "body",
          t.classPrivateProperty(
            staticBlockRef,
            template.expression.ast`(() => { ${staticBlockPath.node.body} })()`,
            [],
            /* static */ true,
          ),
        );
        staticBlockPath.remove();
      },
    },
  };
});
