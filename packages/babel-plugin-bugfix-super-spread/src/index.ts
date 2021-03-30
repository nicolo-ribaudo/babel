import { declare } from "@babel/helper-plugin-utils";
import ReplaceSupers from "@babel/helper-replace-supers";

const last = arr => arr[arr.length - 1];

export default declare(({ assertVersion, types: t, template, assumption }) => {
  assertVersion(7);

  const constantSuper = assumption("constantSuper");

  const constructorContextVisitor = {
    ThisExpression(path, state) {
      state.this.push(path);
    },
    Super(path, state) {
      if (path.parentPath.isCallExpression()) {
        state.superCalls.push(path.parentPath);

        if (path.parent.arguments.some(arg => t.isSpreadElement(arg))) {
          state.superSpreads.add(path.parent);
        }
      } else {
        state.super.push(path.parentPath);
      }
    },
    Function(path) {
      if (!path.isArrowFunctionExpression()) path.skip();
    },
  };

  const constructorReturnVisitor = {
    ReturnStatement(path, state) {
      state.return.push(path);
    },
    Function(path) {
      path.skip();
    },
  };

  return {
    name: "bugfix-super-spread",

    visitor: {
      Class(path, file) {
        if (!path.node.superClass) return;

        const constructorPath = path
          .get("body.body")
          .find(el => el.isClassMethod({ kind: "constructor" }));
        if (!constructorPath) return;

        const state = {
          this: [],
          super: [],
          superCalls: [],
          superSpreads: new Set(),
          return: [],
          noScope: true,
        };
        constructorPath.traverse(constructorContextVisitor, state);
        if (state.superSpreads.size === 0) return;
        constructorPath.traverse(constructorReturnVisitor, state);

        const superId = path.scope.generateUidIdentifierBasedOnNode(
          path.node.superClass,
        );
        path.scope.push({ id: superId });
        path.set(
          "superClass",
          t.assignmentExpression(
            "=",
            t.cloneNode(superId),
            path.node.superClass,
          ),
        );

        const thisId = constructorPath.scope.generateUidIdentifier("this");
        constructorPath.scope.push({ id: thisId });

        for (const path of state.superCalls) {
          if (state.superSpreads.has(path.node)) {
            const args = t.arrayExpression(path.node.arguments);
            const newTarget = t.metaProperty(
              t.identifier("new"),
              t.identifier("target"),
            );

            path.replaceWith(
              template.ast`
                ${t.cloneNode(thisId)} = Reflect.construct(
                  ${t.cloneNode(superId)},
                  ${args},
                  ${newTarget}
                )
              `,
            );
          } else {
            path.replaceWith(
              template.ast`
              ${t.cloneNode(thisId)} = ${path.node}`,
            );
          }
        }

        for (const path of state.this) {
          path.replaceWith(t.cloneNode(thisId));
        }

        for (const path of state.return) {
          if (!path.node.argument) {
            path.set("argument", t.cloneNode(thisId));
          } else {
            path.set(
              "argument",
              t.callExpression(file.addHelper("possibleConstructorReturn"), [
                t.cloneNode(thisId),
                path.node.argument,
              ]),
            );
          }
        }
        const bodyPath = constructorPath.get("body");
        if (!last(bodyPath.get("body")).isReturnStatement()) {
          bodyPath.pushContainer(
            "body",
            t.returnStatement(t.cloneNode(thisId)),
          );
        }

        let classId = path.node.id;
        new ReplaceSupers({
          methodPath: constructorPath,
          superRef: superId,
          thisRef: thisId,
          constantSuper: constantSuper,
          file: file,
          refToPreserve: classId,
          getObjectRef() {
            if (!classId) {
              classId = path.scope.generateUidIdentifier("class");
              path.set("id", classId);
            }
            return classId;
          },
        }).replace();
      },
    },
  };
});
