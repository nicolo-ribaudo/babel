import traverse from "../lib";
import assert from "assert";
import { parse } from "babylon";
import * as t from "@babel/types";

function getPath(code) {
  const ast = parse(code);
  let path;
  traverse(ast, {
    Program: function(_path) {
      path = _path;
      _path.stop();
    },
  });
  return path;
}

function getIdentifierPath(code) {
  const ast = parse(code);
  let nodePath;
  traverse(ast, {
    Identifier: function(path) {
      nodePath = path;
      path.stop();
    },
  });

  return nodePath;
}

describe("scope", function() {
  describe("binding paths", function() {
    it("function declaration id", function() {
      assert.ok(
        getPath("function foo() {}").scope.getBinding("foo").path.type ===
          "FunctionDeclaration",
      );
    });

    it("function expression id", function() {
      assert.ok(
        getPath("(function foo() {})")
          .get("body")[0]
          .get("expression")
          .scope.getBinding("foo").path.type === "FunctionExpression",
      );
    });

    it("function param", function() {
      assert.ok(
        getPath("(function (foo) {})")
          .get("body")[0]
          .get("expression")
          .scope.getBinding("foo").path.type === "Identifier",
      );
    });

    it("variable declaration", function() {
      assert.ok(
        getPath("var foo = null;").scope.getBinding("foo").path.type ===
          "VariableDeclarator",
      );
      assert.ok(
        getPath("var { foo } = null;").scope.getBinding("foo").path.type ===
          "VariableDeclarator",
      );
      assert.ok(
        getPath("var [ foo ] = null;").scope.getBinding("foo").path.type ===
          "VariableDeclarator",
      );
      assert.ok(
        getPath("var { bar: [ foo ] } = null;").scope.getBinding("foo").path
          .type === "VariableDeclarator",
      );
    });

    it("variable constantness", function() {
      assert.ok(getPath("var a = 1;").scope.getBinding("a").constant === true);
      assert.ok(
        getPath("var a = 1; a = 2;").scope.getBinding("a").constant === false,
      );
      assert.ok(
        getPath("var a = 1, a = 2;").scope.getBinding("a").constant === false,
      );
      assert.ok(
        getPath("var a = 1; var a = 2;").scope.getBinding("a").constant ===
          false,
      );
    });

    it("purity", function() {
      assert.ok(
        getPath("({ x: 1 })")
          .get("body")[0]
          .get("expression")
          .isPure(),
      );
      assert.ok(
        !getPath("`${a}`")
          .get("body")[0]
          .get("expression")
          .isPure(),
      );
      assert.ok(
        getPath("let a = 1; `${a}`")
          .get("body")[1]
          .get("expression")
          .isPure(),
      );
      assert.ok(
        !getPath("let a = 1; `${a++}`")
          .get("body")[1]
          .get("expression")
          .isPure(),
      );
      assert.ok(
        !getPath("tagged`foo`")
          .get("body")[0]
          .get("expression")
          .isPure(),
      );
      assert.ok(
        getPath("String.raw`foo`")
          .get("body")[0]
          .get("expression")
          .isPure(),
      );
    });

    test("label", function() {
      assert.strictEqual(
        getPath("foo: { }").scope.getBinding("foo"),
        undefined,
      );
      assert.strictEqual(
        getPath("foo: { }").scope.getLabel("foo").type,
        "LabeledStatement",
      );
      assert.strictEqual(
        getPath("foo: { }").scope.getLabel("toString"),
        undefined,
      );

      assert.strictEqual(
        getPath(
          `
        foo: { }
      `,
        ).scope.generateUid("foo"),
        "_foo",
      );
    });

    test("generateUid collision check with labels", function() {
      assert.strictEqual(
        getPath(
          `
        _foo: { }
      `,
        ).scope.generateUid("foo"),
        "_foo2",
      );

      assert.strictEqual(
        getPath(
          `
        _foo: { }
        _foo1: { }
        _foo2: { }
      `,
        ).scope.generateUid("foo"),
        "_foo3",
      );
    });

    it("reference paths", function() {
      const path = getIdentifierPath("function square(n) { return n * n}");
      const referencePaths = path.context.scope.bindings.n.referencePaths;
      assert.equal(referencePaths.length, 2);
      assert.deepEqual(referencePaths[0].node.loc.start, {
        line: 1,
        column: 28,
      });
      assert.deepEqual(referencePaths[1].node.loc.start, {
        line: 1,
        column: 32,
      });
    });

    describe("declaration after reference", function() {
      it("basic", function() {
        const path = getPath("a; var a");
        const refPath = path.get("body.0.expression");

        assert.deepEqual(path.scope.globals, {});
        assert.equal(path.scope.bindings.a.references, 1);
        assert.equal(path.scope.bindings.a.referencePaths[0], refPath);
      });

      it("in blocks", function() {
        const path = getPath("{ a } { var a }");
        const refPath = path.get("body.0.body.0.expression");

        assert.deepEqual(path.scope.globals, {});
        assert.equal(path.scope.bindings.a.references, 1);
        assert.equal(path.scope.bindings.a.referencePaths[0], refPath);
      });

      it("shadowed", function() {
        const path = getPath("var a; function fn() { a; var a; }");
        const refPath = path.get("body.1.body.body.0.expression");

        assert.equal(path.scope.bindings.a.references, 0);
        assert.equal(refPath.scope.bindings.a.references, 1);
        assert.equal(refPath.scope.bindings.a.referencePaths[0], refPath);
      });
    });
  });

  describe("synchronized with path", function() {
    describe("removal", function() {
      it("reference removed", function() {
        const path = getPath("var a; a();");
        const binding = path.scope.getBinding("a");

        assert.strictEqual(binding.usages.size, 1);
        path.get("body.1").remove(); // a();
        assert.strictEqual(binding.usages.size, 0);
      });

      it("reassignment removed", function() {
        const path = getPath("var a = 1; a = 2;");
        const binding = path.scope.getBinding("a");

        assert.strictEqual(binding.violations.size, 1);
        assert.strictEqual(binding.constant, false);
        path.get("body.1").remove(); // a = 2;
        assert.strictEqual(binding.violations.size, 0);
        assert.strictEqual(binding.constant, true);
      });

      it("removed declaration becomes global", function() {
        const path = getPath("var a; a();");

        assert.strictEqual(path.scope.hasGlobal("a"), false);
        path.get("body.0").remove(); // a();
        assert.strictEqual(path.scope.hasGlobal("a"), true);
      });

      it("removed declaration references get updated", function() {
        const path = getPath("var a; { let a; a(); }");
        const binding = path.scope.getBinding("a");

        assert.strictEqual(binding.usages.size, 0);
        path.get("body.1.body.0").remove(); // let a;
        assert.strictEqual(binding.usages.size, 1);
      });
    });
    describe("insertion", function() {
      it("declaration overwrites global", function() {
        const path = getPath("a();");
        const node = t.variableDeclaration("var", [
          t.variableDeclarator(t.identifier("a")),
        ]);

        assert.strictEqual(path.scope.hasGlobal("a"), true);
        path.get("body.0").insertBefore(node);
        assert.strictEqual(path.scope.hasGlobal("a"), false);
        assert.strictEqual(path.scope.hasBinding("a"), true);
      });

      it("declaration takes it usages from global", function() {
        const path = getPath("a();").get("body.0");
        const node = t.variableDeclaration("var", [
          t.variableDeclarator(t.identifier("a")),
        ]);

        path.insertBefore(node);
        const binding = path.scope.getBinding("a");

        assert.strictEqual(binding.usages.size, 1);
        assert.strictEqual(
          binding.usages.keys().next().value,
          path.get("expression.callee"),
        );
      });

      it("declaration usages are removed from outer declaration", function() {
        const path = getPath("var a; { a(); }");
        const node = t.variableDeclaration("let", [
          t.variableDeclarator(t.identifier("a")),
        ]);
        const binding = path.scope.getBinding("a");

        assert.strictEqual(binding.usages.size, 1);
        path.get("body.1.body.0").insertBefore(node);
        assert.strictEqual(binding.usages.size, 0);
        assert.strictEqual(
          path.get("body.1").scope.getBinding("a").usages.size,
          1,
        );
      });

      it("reference", function() {
        const path = getPath("var a;");
        const node = t.expressionStatement(t.identifier("a"));
        const binding = path.scope.getBinding("a");

        assert.strictEqual(binding.usages.size, 0);
        path.get("body.0").insertAfter(node);
        assert.strictEqual(binding.usages.size, 1);
      });

      it("reassignment", function() {
        const path = getPath("var a;");
        const node = t.expressionStatement(
          t.assignmentExpression("=", t.identifier("a"), t.stringLiteral("x")),
        );
        const binding = path.scope.getBinding("a");

        assert.strictEqual(binding.violations.size, 0);
        path.get("body.0").insertAfter(node);
        assert.strictEqual(binding.violations.size, 1);
      });

      it("parameter", function() {
        const path = getPath("function fn() { param; }");
        const fn = path.get("body.0");
        const node = t.identifier("param");

        assert.strictEqual(path.scope.hasGlobal("param"), true);
        fn.pushContainer("params", node);
        assert.strictEqual(path.scope.hasGlobal("param"), false);
        assert.strictEqual(fn.scope.getBinding("param").references, 1);
      });
    });
  });
});
