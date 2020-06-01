export default function privateMethodsToFields({ types: t }) {
  function shadows(classBody, name) {
    return classBody.some(p => p.isPrivate() && p.node.key.id.name === name);
  }

  function visitUpdates(path, name, visit) {
    path.traverse({
      ClassBody(path) {
        if (shadows(path, name)) path.skip();
      },
      "AssignmentExpression|UpdateExpression"(path) {
        const left = path.get(path.type[0] === "A" ? "left" : "expression");
        if (!left.isMemberExpression()) return;

        const prop = left.get("property");
        if (!prop.isPrivateName() || prop.node.id.name !== name) {
          return;
        }

        visit(path, left.get("object"));
      },
    });
  }

  return {
    visitor: {
      ClassBody(path, state) {
        const { scope } = path;
        const methods = path.get("body").filter(p => p.isClassPrivateMethod());

        if (methods.length === 0) return;

        const getters = new Map();
        const setters = new Map();
        const accessors = new Set();
        const readonly = new Set();

        for (const { node } of methods) {
          const { kind } = node;
          const { name } = node.key.id;

          if (kind === "method") {
            readonly.add(name);
          } else if (kind === "get") {
            getters.set(name, node);
            accessors.add(name);
            readonly.add(name);
          } else if (kind === "set") {
            setters.set(name, node);
            accessors.add(name);
            readonly.delete(name);
          }
        }

        for (const name of readonly) {
          visitUpdates(path, name, path => {
            path.replaceWith(
              t.callExpression(state.addHelper("classPrivateMethodSet"), []),
            );
          });
        }

        for (const [name] of setters) {
          visitUpdates(path, name, (path, base) => {
            let left, right;

            if (path.isUpdateExpression()) {
              const memo = path.scope.maybeGenerateMemoised(base.node);

              if (memo) {
                left = t.memberExpression(
                  t.assignmentExpression("=", memo, base.node),
                  base.parent.property,
                );
                right = t.callExpression(
                  t.memberExpression(
                    t.memberExpression(memo, t.cloneNode(base.parent.property)),
                    t.identifier("get"),
                  ),
                  [],
                );
              } else {
                left = base.parent;
                right = t.callExpression(
                  t.memberExpression(
                    t.cloneNode(base.parent),
                    t.identifier("get"),
                  ),
                  [],
                );
              }
            } else return;

            path.replaceWith(t.callExpression(t.memberExpression(left, t.identifier("set")), [right]));
          });
        }

        const initializers = [];

        for (const path of methods) {
          const { key, kind } = path.node;
          const { name } = key.id;

          let extracted;

          if (kind === "get" || kind === "set") {
            if (!accessors.has(name)) {
              // Already replaced
              path.remove();
              continue;
            }
            accessors.delete(name);

            const getterProps = getters.get(name) || {
              body: t.blockStatement([]),
              generator: false,
              async: false,
            };
            const setterProps = setters.get(name);

            extracted = t.objectExpression([
              t.objectMethod(
                "method",
                t.identifier("get"),
                [],
                getterProps.body,
                false,
                getterProps.generator,
                getterProps.async,
              ),
              setterProps
                ? t.objectMethod(
                    "method",
                    t.identifier("set"),
                    setterProps.params,
                    setterProps.body,
                    false,
                    setterProps.generator,
                    setterProps.async,
                  )
                : t.objectProperty(
                    t.identifier("set"),
                    this.addHelper("classPrivateMethodSet"),
                  ),
            ]);
          } else {
            extracted = t.functionExpression(
              null,
              path.node.params,
              path.node.body,
              path.node.generator,
              path.node.async,
            );
          }

          const id = scope.generateUidIdentifierBasedOnNode(key);
          scope.push({ id });

          initializers.push(
            t.assignmentExpression("=", t.cloneNode(id), extracted),
          );

          path.replaceWith(
            Object.assign(
              t.classPrivateProperty(path.node.key, t.cloneNode(id)),
              { static: path.node.static },
            ),
          );
        }

        path.unshiftContainer(
          "body",
          Object.assign(
            t.classPrivateProperty(
              t.privateName(scope.generateUidIdentifier("_")),
              t.sequenceExpression(initializers),
            ),
            { static: true },
          ),
        );
      },
    },
  };
}
