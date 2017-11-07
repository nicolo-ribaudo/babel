import includes from "lodash/includes";
import repeat from "lodash/repeat";
import type NodePath from "../path";
import traverse, { visitors } from "../index";
import defaults from "lodash/defaults";
import { Binding, ImplicitBinding } from "./binding";
import globals from "globals";
import * as t from "@babel/types";
import { scope as scopeCache } from "../cache";

// Number of calls to the crawl method to figure out whether we're
// somewhere inside a call that was trigerred by call. This is meant
// to be used to figure out whether a warning should be trigerred.
// See `warnOnFlowBinding`.
let _crawlCallsCount = 0;

function renameObjectKey(obj, oldKey, newKey) {
  obj[newKey] = obj[oldKey];
  delete obj[oldKey];
}

// Traverse a path visiting also the root node.
function traverseRoot(path, visitor, state) {
  visitors.explode(visitor);
  for (const type in visitor) {
    if (t.is(type, path.node) && visitor[type].enter) {
      visitor[type].enter.forEach(fn => fn.call({ isRoot: true }, path, state));
    }
  }
}

// Recursively gathers the identifying names of a node.
function gatherNodeParts(node: Object, parts: Array) {
  if (t.isModuleDeclaration(node)) {
    if (node.source) {
      gatherNodeParts(node.source, parts);
    } else if (node.specifiers && node.specifiers.length) {
      for (const specifier of (node.specifiers: Array)) {
        gatherNodeParts(specifier, parts);
      }
    } else if (node.declaration) {
      gatherNodeParts(node.declaration, parts);
    }
  } else if (t.isModuleSpecifier(node)) {
    gatherNodeParts(node.local, parts);
  } else if (t.isMemberExpression(node)) {
    gatherNodeParts(node.object, parts);
    gatherNodeParts(node.property, parts);
  } else if (t.isIdentifier(node)) {
    parts.push(node.name);
  } else if (t.isLiteral(node)) {
    parts.push(node.value);
  } else if (t.isCallExpression(node)) {
    gatherNodeParts(node.callee, parts);
  } else if (t.isObjectExpression(node) || t.isObjectPattern(node)) {
    for (const prop of (node.properties: Array)) {
      gatherNodeParts(prop.key || prop.argument, parts);
    }
  }
}

const collectorVisitor = {
  noScope: true,

  enter(path, scopes) {
    path.scope = path.getScope(scopes.block);
  },

  Scope(path) {
    if (this.isRoot) return;
    path.skip();
  },

  ReferencedIdentifier(path, scopes) {
    scopes.block.registerUsage(path, { read: true });
  },

  "BindingIdentifier|Pattern"(path, scopes) {
    const parent = path.parentPath;
    if (parent.isFunction()) {
      if (parent.get("id") === path) {
        if (!path.node[t.NOT_LOCAL_BINDING] && parent.isFunctionExpression()) {
          scopes.function.registerBinding("local", path, parent);
        }
      } else if (parent.get("params").indexOf(path) !== -1) {
        scopes.function.registerBinding("param", path);
      }
    } else if (parent.isClassExpression()) {
      if (parent.get("id") === path && !path.node[t.NOT_LOCAL_BINDING]) {
        scopes.block.registerBinding("local", path);
      }
    } else if (parent.isCatchClause()) {
      scopes.block.registerBinding("let", path);
    }
  },

  For(path, scopes) {
    for (const key of (t.FOR_INIT_KEYS: Array)) {
      const declar = path.get(key);
      if (declar.isVar()) {
        scopes.function.registerBinding("var", declar);
      }
    }
    path.skip();
  },

  VariableDeclaration(path, scopes) {
    if (path.isFlow()) return;

    const scope = path.node.kind === "var" ? scopes.function : scopes.block;

    scope.registerDeclaration(path);
  },

  ForXStatement(path, scopes) {
    const left = path.get("left");
    if (left.isPattern() || left.isIdentifier()) {
      scopes.block.registerConstantViolation(left, path);
    }
  },

  ExportDeclaration: {
    exit(path, scopes) {
      const { node } = path;
      const declar = node.declaration;
      if (t.isClassDeclaration(declar) || t.isFunctionDeclaration(declar)) {
        const id = declar.id;
        if (!id) return;

        const binding = scopes.program.getBinding(id.name);
        if (binding) binding.registerExport(path);
      } else if (t.isVariableDeclaration(declar)) {
        for (const decl of (declar.declarations: Array<Object>)) {
          const ids = t.getBindingIdentifiers(decl);
          for (const name in ids) {
            const binding = scopes.program.getBinding(name);
            if (binding) binding.registerExport(path);
          }
        }
      }
    },
  },

  LabeledStatement(path, scopes) {
    scopes.program.addGlobal(path.node);
    scopes.block.registerLabel(path);
  },

  AssignmentExpression(path, scopes) {
    scopes.block.registerConstantViolation(path);
  },

  UpdateExpression(path, scopes) {
    const arg = path.get("argument");
    if (arg.isIdentifier()) {
      scopes.block.registerUsage(arg, { read: true, write: true, path });
      path.skip();
    }
  },

  UnaryExpression(path, scopes) {
    if (path.node.operator === "delete") {
      const arg = path.get("argument");
      if (arg.isIdentifier()) {
        scopes.block.registerUsage(arg, { read: true, write: true, path });
        path.skip();
      }
    }
  },
};

const removerVisitor = {
  Declaration(path) {
    path.scope.removeDeclaration(path);
  },
  "BindingIdentifier|ReferencedIdentifier"(path) {
    path.scope.removeUsage(path);
  },
};

let uid = 0;

export default class Scope {
  /**
   * This searches the current "scope" and collects all references/bindings
   * within.
   */

  constructor(path: NodePath) {
    const { node } = path;
    const cached = scopeCache.get(node);
    // Sometimes, a scopable path is placed higher in the AST tree.
    // In these cases, have to create a new Scope.
    if (cached && cached.path === path) {
      cached.revitalizeCached();
      return cached;
    }
    scopeCache.set(node, this);

    this.uid = uid++;

    this.block = node;
    this.path = path;

    this.labels = new Map();

    path.scope = this;

    this.init();
  }

  /**
   * Globals.
   */

  static globals = Object.keys(globals.builtin);

  /**
   * Variables available in current context.
   */

  static contextVariables = ["arguments", "undefined", "Infinity", "NaN"];

  get parent() {
    const parent = this.path.findParent(p => p.isScope());
    return parent && parent.scope;
  }

  get parentBlock() {
    return this.path.parent;
  }

  get hub() {
    return this.path.hub;
  }

  /**
   * Traverse node with current scope and path.
   */

  traverse(node: Object, opts: Object, state?) {
    traverse(node, opts, this, state, this.path);
  }

  /**
   * Generate a unique identifier and add it to the current scope.
   */

  generateDeclaredUidIdentifier(name: string = "temp") {
    const id = this.generateUidIdentifier(name);
    this.push({ id });
    return id;
  }

  /**
   * Generate a unique identifier.
   */

  generateUidIdentifier(name: string = "temp") {
    return t.identifier(this.generateUid(name));
  }

  /**
   * Generate a unique `_id1` binding.
   */

  generateUid(name: string = "temp") {
    name = t
      .toIdentifier(name)
      .replace(/^_+/, "")
      .replace(/[0-9]+$/g, "");

    let uid;
    let i = 0;
    do {
      uid = this._generateUid(name, i);
      i++;
    } while (
      this.hasLabel(uid) ||
      this.hasBinding(uid) ||
      this.hasGlobal(uid) ||
      this.hasReference(uid)
    );

    const program = this.getProgramParent();
    program.references[uid] = true;
    program.uids[uid] = true;

    return uid;
  }

  /**
   * Generate an `_id1`.
   */

  _generateUid(name, i) {
    let id = name;
    if (i > 1) id += i;
    return `_${id}`;
  }

  /**
   * Generate a unique identifier based on a node.
   */

  generateUidIdentifierBasedOnNode(
    parent: Object,
    defaultName?: String,
  ): Object {
    let node = parent;

    if (t.isAssignmentExpression(parent)) {
      node = parent.left;
    } else if (t.isVariableDeclarator(parent)) {
      node = parent.id;
    } else if (t.isObjectProperty(node) || t.isObjectMethod(node)) {
      node = node.key;
    }

    const parts = [];
    gatherNodeParts(node, parts);

    let id = parts.join("$");
    id = id.replace(/^_/, "") || defaultName || "ref";

    return this.generateUidIdentifier(id.slice(0, 20));
  }

  /**
   * Determine whether evaluating the specific input `node` is a consequenceless reference. ie.
   * evaluating it wont result in potentially arbitrary code from being ran. The following are
   * whitelisted and determined not to cause side effects:
   *
   *  - `this` expressions
   *  - `super` expressions
   *  - Bound identifiers
   */

  isStatic(node: Object): boolean {
    if (t.isThisExpression(node) || t.isSuper(node)) {
      return true;
    }

    if (t.isIdentifier(node)) {
      const binding = this.getBinding(node.name);
      if (binding) {
        return binding.constant;
      } else {
        return this.hasBinding(node.name);
      }
    }

    return false;
  }

  /**
   * Possibly generate a memoised identifier if it is not static and has consequences.
   */

  maybeGenerateMemoised(node: Object, dontPush?: boolean): ?Object {
    if (this.isStatic(node)) {
      return null;
    } else {
      const id = this.generateUidIdentifierBasedOnNode(node);
      if (!dontPush) this.push({ id });
      return id;
    }
  }

  checkBlockScopedCollisions(local, kind: string, name: string, id: Object) {
    // ignore parameters
    if (kind === "param") return;

    // Ignore existing binding if it's the name of the current function or
    // class expression
    if (local.kind === "local") return;

    // ignore hoisted functions if there's also a local let
    if (kind === "hoisted" && local.kind === "let") return;

    const duplicate =
      // don't allow duplicate bindings to exist alongside
      kind === "let" ||
      local.kind === "let" ||
      local.kind === "const" ||
      local.kind === "module" ||
      // don't allow a local of param with a kind of let
      (local.kind === "param" && (kind === "let" || kind === "const"));

    if (duplicate) {
      throw this.hub.file.buildCodeFrameError(
        id,
        `Duplicate declaration "${name}"`,
        TypeError,
      );
    }
  }

  rename(oldName: string, newName: string, block?): ?string {
    const binding = this.getBinding(oldName);
    if (binding) {
      newName = newName || this.generateUid(oldName);

      binding.usages.forEach((usage, id) => {
        const shouldReplace = !block || !!id.findParent(path => path.node === block);

        if (!shouldReplace) return;

        id.node.name = newName;

        let scope = id.scope;
        while (scope && scope.seenReferences[oldName]) {
          renameObjectKey(scope.seenReferences, oldName, newName);
          scope = scope.parent;
        }
      });

      if (!block) {
        renameObjectKey(binding.scope.bindings, oldName, newName);
        binding.identifier.name = newName;
      }

      return newName;
    }
  }

  _renameFromMap(map, oldName, newName, value) {
    if (map[oldName]) {
      map[newName] = value;
      map[oldName] = null;
    }
  }

  dump() {
    const sep = repeat("-", 60);
    console.log(sep);
    let scope = this;
    do {
      console.log("#", scope.block.type);
      for (const name in scope.bindings) {
        const binding = scope.bindings[name];
        console.log(" -", name, {
          constant: binding.constant,
          references: binding.references,
          violations: binding.constantViolations.length,
          kind: binding.kind,
        });
      }
    } while ((scope = scope.parent));
    console.log(sep);
  }

  toArray(node: Object, i?: number) {
    const file = this.hub.file;

    if (t.isIdentifier(node)) {
      const binding = this.getBinding(node.name);
      if (binding && binding.constant && binding.path.isGenericType("Array")) {
        return node;
      }
    }

    if (t.isArrayExpression(node)) {
      return node;
    }

    if (t.isIdentifier(node, { name: "arguments" })) {
      return t.callExpression(
        t.memberExpression(
          t.memberExpression(
            t.memberExpression(
              t.identifier("Array"),
              t.identifier("prototype"),
            ),
            t.identifier("slice"),
          ),
          t.identifier("call"),
        ),
        [node],
      );
    }

    let helperName = "toArray";
    const args = [node];
    if (i === true) {
      helperName = "toConsumableArray";
    } else if (i) {
      args.push(t.numericLiteral(i));
      helperName = "slicedToArray";
      // TODO if (this.hub.file.isLoose("es6.forOf")) helperName += "-loose";
    }
    return t.callExpression(file.addHelper(helperName), args);
  }

  hasLabel(name: string) {
    return !!this.getLabel(name);
  }

  getLabel(name: string) {
    return this.labels.get(name);
  }

  registerLabel(path: NodePath) {
    this.labels.set(path.node.label.name, path);
  }

  registerDeclaration(path: NodePath) {
    if (path.isLabeledStatement()) {
      this.registerLabel(path);
    } else if (path.isFunctionDeclaration()) {
      this.registerBinding("hoisted", path.get("id"), path);
    } else if (path.isVariableDeclaration()) {
      const declarations = path.get("declarations");
      for (const declar of (declarations: Array)) {
        this.registerBinding(path.node.kind, declar);
      }
    } else if (path.isClassDeclaration()) {
      this.registerBinding("let", path);
    } else if (path.isImportDeclaration()) {
      const specifiers = path.get("specifiers");
      for (const specifier of (specifiers: Array)) {
        this.registerBinding("module", specifier);
      }
    } else if (path.isExportDeclaration()) {
      const declar = path.get("declaration");
      if (
        declar.isClassDeclaration() ||
        declar.isFunctionDeclaration() ||
        declar.isVariableDeclaration()
      ) {
        this.registerDeclaration(declar);
      }
    } else {
      this.registerBinding("unknown", path);
    }
  }

  removeDeclaration(path: NodePath) {
    if (path.isLabeledStatement()) {
      this.removeLabel(path);
    } else if (path.isFunctionDeclaration()) {
      this.removeBinding(path.get("id"));
    } else if (path.isVariableDeclaration()) {
      path.get("declarations").forEach(::this.removeBinding);
    } else if (path.isClassDeclaration()) {
      this.removeBinding("let", path);
    } else if (path.isImportDeclaration()) {
      path.get("specifiers").forEach(::this.removeBinding);
    } else if (path.isExportDeclaration()) {
      const declar = path.get("declaration");
      if (
        declar.isClassDeclaration() ||
        declar.isFunctionDeclaration() ||
        declar.isVariableDeclaration()
      ) {
        this.removeDeclaration(declar);
      }
    } else {
      this.removeBinding(path);
    }
  }

  buildUndefinedNode() {
    if (this.hasBinding("undefined")) {
      return t.unaryExpression("void", t.numericLiteral(0), true);
    } else {
      return t.identifier("undefined");
    }
  }

  registerUsage(path: NodePath, usage) {
    const { name } = path.node;
    let scope = this;
    do {
      const binding = scope.getOwnBinding(name, true);
      if (binding) {
        binding.registerUsage(path, usage);
        return;
      } else {
        if (!scope.seenUsages[name]) scope.seenUsages[name] = new Map();
        scope.seenUsages[name].set(path, usage);
      }
    } while (scope.parent && (scope = scope.parent));

    // ASSERT: scope is the global scope

    scope.addGlobal(path.node);
    scope.registerImplicitBinding(name).registerUsage(path, usage);
  }

  removeUsage(path: NodePath) {
    const { name } = path.node;
    let scope = this;
    do {
      if (scope.seenUsages[name]) {
        scope.seenUsages[name].delete(path);
      }
      const binding = scope.getOwnBinding(name, true);
      if (binding) {
        binding.removeUsage(path);
        return;
      }
    } while (scope.parent && (scope = scope.parent));
  }

  registerConstantViolation(path: NodePath, violationPath: NodePath = path) {
    const ids = path.getBindingIdentifierPaths();
    for (const name in ids) {
      this.registerUsage(ids[name], { write: true, path: violationPath });
    }
  }

  _registerBinding(
    kind: string,
    name: String,
    id: Object,
    path: NodePath,
    parentScope: Scope,
  ) {
    let local = this.getOwnBinding(name);

    if (local) {
      // same identifier so continue safely as we're likely trying to register it
      // multiple times
      if (local.identifier === id) return;

      this.checkBlockScopedCollisions(local, kind, name, id);
    }

    // It's erroneous that we currently consider flow a binding, however, we can't
    // remove it because people might be depending on it. See warning section
    // in `warnOnFlowBinding`.
    if (local && local.path.isFlow()) local = null;

    parentScope.references[name] = true;

    // A redeclaration of an existing variable is a modification
    if (local) {
      this.registerConstantViolation(path);
    } else {
      const oldBinding = this.getBinding(name);
      const binding = new Binding({
        identifier: id,
        scope: this,
        path,
        kind,
      });
      this.bindings[name] = binding;

      let { scope } = path;
      if (scope) {
        do {
          if (scope.seenUsages[name]) {
            scope.seenUsages[name].forEach((usage, path) => {
              binding.registerUsage(path, usage);
              if (oldBinding) oldBinding.removeUsage(path);
            });
          }
        } while (scope !== this && (scope = scope.parent));
      }

      const isGlobalScope = this.parent === null;
      if (isGlobalScope && this.globals[name]) {
        delete this.globals[name];
        delete this.implicitBindings[name];
      }
    }
  }

  registerBinding(kind: string, path: NodePath, bindingPath = path) {
    if (!kind) throw new ReferenceError("no `kind`");

    if (path.isVariableDeclaration()) {
      const declarators: Array<NodePath> = path.get("declarations");
      for (const declar of declarators) {
        this.registerBinding(kind, declar);
      }
      return;
    }

    const parent = this.getProgramParent();
    const ids = path.getBindingIdentifiers(true);

    for (const name in ids) {
      for (const id of (ids[name]: Array<Object>)) {
        this._registerBinding(kind, name, id, bindingPath, parent);
      }
    }
  }

  _removeBinding(name: string) {
    const binding = this.getBinding(name);
    if (!binding) return;

    delete binding.scope.bindings[name];
    binding.usages.forEach(({ read, write }, id) => {
      const path = write ? binding.violations.get(id) : null;
      binding.path.scope.registerUsage(id, { read, write, path });
    });
  }

  removeBinding(path: NodePath | string) {
    if (typeof path === "string") {
      this._removeBinding(path);
    } else if (path.scope !== this) {
      throw new Error();
    } else {
      const ids = path.getBindingIdentifiers(true);
      Object.keys(ids).forEach(::this._removeBinding);
    }
  }

  registerImplicitBinding(name: string) {
    const scope = this.getProgramParent();
    const binding = new ImplicitBinding({ scope, name });
    scope.implicitBindings[name] = binding;
    return binding;
  }

  isOriginalGlobal(name: string) {
    const binding = this.getBinding(name, true);
    if (!binding) return true;
    if (binding instanceof ImplicitBinding) return binding.constant;
    return false;
  }

  addGlobal(node: Object) {
    this.globals[node.name] = node;
  }

  hasUid(name): boolean {
    let scope = this;

    do {
      if (scope.uids[name]) return true;
    } while ((scope = scope.parent));

    return false;
  }

  hasGlobal(name: string): boolean {
    let scope = this;

    do {
      if (scope.implicitBindings[name]) {
        return scope.implicitBindings[name].referenced;
      }
      if (scope.globals[name]) return true;
    } while ((scope = scope.parent));

    return false;
  }

  hasReference(name: string): boolean {
    let scope = this;

    do {
      if (scope.references[name]) return true;
    } while ((scope = scope.parent));

    return false;
  }

  isPure(node, constantsOnly?: boolean) {
    if (t.isIdentifier(node)) {
      const binding = this.getBinding(node.name);
      if (!binding) return false;
      if (constantsOnly) return binding.constant;
      return true;
    } else if (t.isClass(node)) {
      if (node.superClass && !this.isPure(node.superClass, constantsOnly)) {
        return false;
      }
      return this.isPure(node.body, constantsOnly);
    } else if (t.isClassBody(node)) {
      for (const method of node.body) {
        if (!this.isPure(method, constantsOnly)) return false;
      }
      return true;
    } else if (t.isBinary(node)) {
      return (
        this.isPure(node.left, constantsOnly) &&
        this.isPure(node.right, constantsOnly)
      );
    } else if (t.isArrayExpression(node)) {
      for (const elem of (node.elements: Array<Object>)) {
        if (!this.isPure(elem, constantsOnly)) return false;
      }
      return true;
    } else if (t.isObjectExpression(node)) {
      for (const prop of (node.properties: Array<Object>)) {
        if (!this.isPure(prop, constantsOnly)) return false;
      }
      return true;
    } else if (t.isClassMethod(node)) {
      if (node.computed && !this.isPure(node.key, constantsOnly)) return false;
      if (node.kind === "get" || node.kind === "set") return false;
      return true;
    } else if (t.isClassProperty(node) || t.isObjectProperty(node)) {
      if (node.computed && !this.isPure(node.key, constantsOnly)) return false;
      return this.isPure(node.value, constantsOnly);
    } else if (t.isUnaryExpression(node)) {
      return this.isPure(node.argument, constantsOnly);
    } else if (t.isTaggedTemplateExpression(node)) {
      return (
        t.matchesPattern(node.tag, "String.raw") &&
        !this.hasBinding("String", true) &&
        this.isPure(node.quasi, constantsOnly)
      );
    } else if (t.isTemplateLiteral(node)) {
      for (const expression of (node.expressions: Array<Object>)) {
        if (!this.isPure(expression, constantsOnly)) return false;
      }
      return true;
    } else {
      return t.isPureish(node);
    }
  }

  /**
   * Set some arbitrary data on the current scope.
   */

  setData(key, val) {
    return (this.data[key] = val);
  }

  /**
   * Recursively walk up scope tree looking for the data `key`.
   */

  getData(key) {
    let scope = this;
    do {
      const data = scope.data[key];
      if (data != null) return data;
    } while ((scope = scope.parent));
  }

  /**
   * Recursively walk up scope tree looking for the data `key` and if it exists,
   * remove it.
   */

  removeData(key) {
    let scope = this;
    do {
      const data = scope.data[key];
      if (data != null) scope.data[key] = null;
    } while ((scope = scope.parent));
  }

  revitalizeCached() {
    const { parent } = this;
    if (!parent) return;

    for (const name in this.seenUsages) {
      this.seenUsages[name].forEach((usage, path) => {
        parent.registerUsage(path, usage);
      });
    }
  }

  init() {
    if (!this.references) this.crawl();
  }

  crawl() {
    _crawlCallsCount++;
    this._crawl();
    _crawlCallsCount--;
  }

  _crawl() {
    this.references = Object.create(null);
    this.seenUsages = Object.create(null);
    this.seenReferences = Object.create(null);
    this.seenConstantViolationsIds = Object.create(null);
    this.bindings = Object.create(null);
    this.implicitBindings = Object.create(null);
    this.globals = Object.create(null);
    this.uids = Object.create(null);
    this.data = Object.create(null);

    this.registerPath(this.path);
  }

  registerPath(path: NodePath) {
    path.scope = path.getScope(this);

    const scopes = {};
    scopes.program = path.scope.getProgramParent();
    scopes.function = path.scope.getFunctionParent() || scopes.program;
    scopes.block = path.scope;

    // ForStatement - left, init

    if (path.isLoop()) {
      for (const key of (t.FOR_INIT_KEYS: Array<string>)) {
        const node = path.get(key);
        if (node.isBlockScoped()) this.registerBinding(node.node.kind, node);
      }
    }
    
    if (path.isFunctionDeclaration() && !path.isFlow()) {
      const scope = scopes.function.parent.getBlockParent() || scopes.program;
      scope.registerDeclaration(path);
    }

    if (path.isClassDeclaration() && !path.isFlow()) {
      const scope = scopes.block.parent.getBlockParent() || scopes.program;
      scope.registerDeclaration(path);
    }

    traverseRoot(path, collectorVisitor, scopes);
    path.traverse(collectorVisitor, scopes);
  }

  removePath(path: NodePath) {
    if (path.scope !== this) {
      throw new Error();
    }

    traverseRoot(path, removerVisitor);
    path.traverse(removerVisitor);
  }

  push(opts: {
    id: Object,
    init: ?Object,
    unique: ?boolean,
    _blockHoist: ?number,
    kind: "var" | "let",
  }) {
    let path = this.path;

    if (!path.isBlockStatement() && !path.isProgram()) {
      path = this.getBlockParent().path;
    }

    if (path.isSwitchStatement()) {
      path = (this.getFunctionParent() || this.getProgramParent()).path;
    }

    if (path.isLoop() || path.isCatchClause() || path.isFunction()) {
      path.ensureBlock();
      path = path.get("body");
    }

    const unique = opts.unique;
    const kind = opts.kind || "var";
    const blockHoist = opts._blockHoist == null ? 2 : opts._blockHoist;

    const dataKey = `declaration:${kind}:${blockHoist}`;
    let declarPath = !unique && path.getData(dataKey);

    if (!declarPath) {
      const declar = t.variableDeclaration(kind, []);
      declar._blockHoist = blockHoist;

      [declarPath] = path.unshiftContainer("body", [declar]);
      if (!unique) path.setData(dataKey, declarPath);
    }

    const declarator = t.variableDeclarator(opts.id, opts.init);
    declarPath.node.declarations.push(declarator);
    this.registerBinding(kind, declarPath.get("declarations").pop());
  }

  /**
   * Walk up to the top of the scope tree and get the `Program`.
   */

  getProgramParent() {
    let scope = this;
    do {
      if (scope.path.isProgram()) {
        return scope;
      }
    } while ((scope = scope.parent));
    throw new Error("Couldn't find a Program");
  }

  /**
   * Walk up the scope tree until we hit either a Function or return null.
   */

  getFunctionParent() {
    let scope = this;
    do {
      if (scope.path.isFunctionParent()) {
        return scope;
      }
    } while ((scope = scope.parent));
    return null;
  }

  /**
   * Walk up the scope tree until we hit either a BlockStatement/Loop/Program/Function/Switch or reach the
   * very top and hit Program.
   */

  getBlockParent() {
    let scope = this;
    do {
      if (scope.path.isBlockParent()) {
        return scope;
      }
    } while ((scope = scope.parent));
    throw new Error(
      "We couldn't find a BlockStatement, For, Switch, Function, Loop or Program...",
    );
  }

  /**
   * Walks the scope tree and gathers **all** bindings.
   */

  getAllBindings(): Object {
    const ids = Object.create(null);

    let scope = this;
    do {
      defaults(ids, scope.bindings);
      scope = scope.parent;
    } while (scope);

    return ids;
  }

  /**
   * Walks the scope tree and gathers all declarations of `kind`.
   */

  getAllBindingsOfKind(): Object {
    const ids = Object.create(null);

    for (const kind of (arguments: Array)) {
      let scope = this;
      do {
        for (const name in scope.bindings) {
          const binding = scope.bindings[name];
          if (binding.kind === kind) ids[name] = binding;
        }
        scope = scope.parent;
      } while (scope);
    }

    return ids;
  }

  bindingIdentifierEquals(name: string, node: Object): boolean {
    return this.getBindingIdentifier(name) === node;
  }

  warnOnFlowBinding(binding) {
    if (_crawlCallsCount === 0 && binding && binding.path.isFlow()) {
      console.warn(`
        You or one of the Babel plugins you are using are using Flow declarations as bindings.
        Support for this will be removed in version 7. To find out the caller, grep for this
        message and change it to a \`console.trace()\`.
      `);
    }
    return binding;
  }

  getBinding(name: string, implicit?: boolean) {
    let scope = this;

    do {
      const binding = scope.getOwnBinding(name, implicit);
      if (binding) return binding;
    } while ((scope = scope.parent));
  }

  getOwnBinding(name: string, implicit?: boolean) {
    const binding = this.bindings[name];
    if (binding) {
      return this.warnOnFlowBinding(binding);
    }
    if (implicit) {
      return this.implicitBindings[name];
    }
  }

  getBindingIdentifier(name: string) {
    const info = this.getBinding(name);
    return info && info.identifier;
  }

  getOwnBindingIdentifier(name: string) {
    const binding = this.bindings[name];
    return binding && binding.identifier;
  }

  hasOwnBinding(name: string) {
    return !!this.getOwnBinding(name);
  }

  hasBinding(name: string, noGlobals?) {
    if (!name) return false;
    if (this.hasOwnBinding(name)) return true;
    if (this.parentHasBinding(name, noGlobals)) return true;
    if (this.hasUid(name)) return true;
    if (!noGlobals && includes(Scope.globals, name)) return true;
    if (!noGlobals && includes(Scope.contextVariables, name)) return true;
    return false;
  }

  parentHasBinding(name: string, noGlobals?) {
    return this.parent && this.parent.hasBinding(name, noGlobals);
  }

  /**
   * Move a binding of `name` to another `scope`.
   */

  moveBindingTo(name, scope) {
    const info = this.getBinding(name);
    if (info) {
      info.scope.removeOwnBinding(name);
      info.scope = scope;
      scope.bindings[name] = info;
    }
  }

  removeOwnBinding(name: string) {
    if (this.hasOwnBinding(name)) {
      this.removeBinding(name);
    }
  }
}
