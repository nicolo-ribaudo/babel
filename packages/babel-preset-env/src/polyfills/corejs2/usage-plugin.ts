import corejs2Polyfills from "@babel/compat-data/corejs2-built-ins";
import { filterItems } from "@babel/helper-compilation-targets";
import getPlatformSpecificDefaultFor from "./get-platform-specific-default";
import {
  BuiltIns,
  StaticProperties,
  InstanceProperties,
} from "./built-in-definitions";
import {
  createImport,
  getType,
  has,
  isPolyfillSource,
  getImportSource,
  getRequireSource,
  isNamespaced,
} from "../../utils";
import { logUsagePolyfills } from "../../debug";

import type { InternalPluginOptions } from "../../types";
import type { NodePath, Visitor } from "@babel/traverse";

const NO_DIRECT_POLYFILL_IMPORT = `
  When setting \`useBuiltIns: 'usage'\`, polyfills are automatically imported when needed.
  Please remove the \`import '@babel/polyfill'\` call or use \`useBuiltIns: 'entry'\` instead.`;

export default function (
  {
    types: t,
  }: {
    types: typeof import("@babel/types");
  },
  { include, exclude, polyfillTargets, debug }: InternalPluginOptions,
) {
  const polyfills = filterItems(
    corejs2Polyfills,
    include,
    exclude,
    polyfillTargets,
    getPlatformSpecificDefaultFor(polyfillTargets),
  );

  const addAndRemovePolyfillImports: Visitor<any> = {
    ImportDeclaration(path) {
      if (isPolyfillSource(getImportSource(path))) {
        console.warn(NO_DIRECT_POLYFILL_IMPORT);
        path.remove();
      }
    },

    Program(path) {
      path.get("body").forEach(bodyPath => {
        if (isPolyfillSource(getRequireSource(bodyPath))) {
          console.warn(NO_DIRECT_POLYFILL_IMPORT);
          bodyPath.remove();
        }
      });
    },

    // Symbol()
    // new Promise
    ReferencedIdentifier({ node: { name }, parent, scope }) {
      if (t.isMemberExpression(parent)) return;
      if (!has(BuiltIns, name)) return;
      if (scope.getBindingIdentifier(name)) return;

      const BuiltInDependencies = BuiltIns[name];
      this.addUnsupported(BuiltInDependencies);
    },

    // arr[Symbol.iterator]()
    CallExpression(path) {
      // we can't compile this
      if (path.node.arguments.length) return;

      const callee = path.node.callee;

      if (!t.isMemberExpression(callee)) return;
      if (!callee.computed) return;
      // @ts-expect-error todo(flow->ts) typesafe replacement for NodePath.get
      if (!path.get("callee.property").matchesPattern("Symbol.iterator")) {
        return;
      }

      this.addImport("web.dom.iterable");
    },

    // Symbol.iterator in arr
    BinaryExpression(path) {
      if (path.node.operator !== "in") return;
      if (!path.get("left").matchesPattern("Symbol.iterator")) return;

      this.addImport("web.dom.iterable");
    },

    // yield*
    YieldExpression(path) {
      if (path.node.delegate) {
        this.addImport("web.dom.iterable");
      }
    },

    // Array.from
    MemberExpression: {
      enter(path) {
        const { node } = path;
        const { object, property } = node;

        // ignore namespace
        if (isNamespaced(path.get("object"))) return;

        // @ts-expect-error todo(flow->ts) add assertion to ensure object is identifier
        let evaluatedPropType = object.name;
        let propertyName = "";
        let instanceType = "";

        if (node.computed) {
          if (t.isStringLiteral(property)) {
            propertyName = property.value;
          } else {
            const result = path.get("property").evaluate();
            if (result.confident && result.value) {
              propertyName = result.value;
            }
          }
        } else {
          // @ts-expect-error todo(flow->ts) name might be not defined
          propertyName = property.name;
        }

        // @ts-expect-error todo(flow->ts) add assertion to ensure object is identifier
        if (path.scope.getBindingIdentifier(object.name)) {
          const result = path.get("object").evaluate();
          if (result.value) {
            instanceType = getType(result.value);
          } else if (result.deopt && result.deopt.isIdentifier()) {
            evaluatedPropType = result.deopt.node.name;
          }
        }

        if (has(StaticProperties, evaluatedPropType)) {
          const BuiltInProperties = StaticProperties[evaluatedPropType];
          if (has(BuiltInProperties, propertyName)) {
            const StaticPropertyDependencies = BuiltInProperties[propertyName];
            this.addUnsupported(StaticPropertyDependencies);
          }
        }

        if (has(InstanceProperties, propertyName)) {
          let InstancePropertyDependencies = InstanceProperties[propertyName];
          if (instanceType) {
            InstancePropertyDependencies = InstancePropertyDependencies.filter(
              module => module.includes(instanceType),
            );
          }
          this.addUnsupported(InstancePropertyDependencies);
        }
      },

      // Symbol.match
      exit(path) {
        // @ts-expect-error todo(flow->ts) `.object` is an expression and might not have `name` property
        const { name } = path.node.object;

        if (!has(BuiltIns, name)) return;
        if (path.scope.getBindingIdentifier(name)) return;

        const BuiltInDependencies = BuiltIns[name];
        this.addUnsupported(BuiltInDependencies);
      },
    },

    // var { repeat, startsWith } = String
    VariableDeclarator(path) {
      const { node } = path;
      const { id, init } = node;

      if (!t.isObjectPattern(id)) return;

      // doesn't reference the global
      // @ts-expect-error todo(flow->ts) `init` is an expression and might have no name property
      if (init && path.scope.getBindingIdentifier(init.name)) return;

      // @ts-expect-error todo(flow->ts) `properties` property might not exist
      for (const { key } of id.properties) {
        if (
          // @ts-expect-error todo(flow->ts) `computed` does not exist on VariableDeclarator
          !node.computed &&
          t.isIdentifier(key) &&
          has(InstanceProperties, key.name)
        ) {
          const InstancePropertyDependencies = InstanceProperties[key.name];
          this.addUnsupported(InstancePropertyDependencies);
        }
      }
    },
  };

  return {
    name: "corejs2-usage",
    pre({ path }: { path: NodePath }) {
      this.polyfillsSet = new Set();

      this.addImport = function (builtIn) {
        if (!this.polyfillsSet.has(builtIn)) {
          this.polyfillsSet.add(builtIn);
          createImport(path, builtIn);
        }
      };

      this.addUnsupported = function (builtIn) {
        const modules = Array.isArray(builtIn) ? builtIn : [builtIn];
        for (const module of modules) {
          if (polyfills.has(module)) {
            this.addImport(module);
          }
        }
      };
    },
    post() {
      if (debug) {
        logUsagePolyfills(
          this.polyfillsSet,
          this.file.opts.filename,
          polyfillTargets,
          corejs2Polyfills,
        );
      }
    },
    visitor: addAndRemovePolyfillImports,
  };
}
