import type NodePath from "../../path";
import type { Identifier } from "@babel/types";

type Read = { read: true };
type Write = { write: true, path: NodePath };

export type Usage = Read | Write | (Read & Write);

/**
 * This class is responsible for a binding inside of a scope.
 *
 * It tracks the following:
 *
 *  * Amount of times referenced by other nodes.
 *  * Paths to nodes that reassign or modify this binding.
 */
export default class BindingBase {
  constructor({ scope }) {
    this.scope = scope;

    this.usages = new Map();
    this.violations = new Map();

    this.clearValue();
  }

  usages: Map<NodePath<Identifier>, { read: boolean, write: boolean }>;
  violations: Map<NodePath<Identifier>, NodePath>;
  exportPath: ?NodePath;

  hasDeoptedValue: boolean;
  hasValue: boolean;
  value: any;

  get referencePaths() {
    const referencePaths = Array.from(this.usages.keys());
    if (this.exportPath) referencePaths.push(this.exportPath);
    return referencePaths;
  }

  get references() {
    return this.usages.size + (this.exportPath ? 1 : 0);
  }

  get referenced() {
    return !!this.usages.size || !!this.exportPath;
  }

  get constant() {
    return !this.violations.size;
  }

  get constantViolations() {
    return Array.from(this.violations.values());
  }

  deoptValue() {
    this.clearValue();
    this.hasDeoptedValue = true;
  }

  setValue(value: any) {
    if (this.hasDeoptedValue) return;
    this.hasValue = true;
    this.value = value;
  }

  clearValue() {
    this.hasDeoptedValue = false;
    this.hasValue = false;
    this.value = null;
  }

  registerUsage(id, usage: Usage) {
    this.usages.set(id, { read: !!usage.read, write: !!usage.write });
    if (usage.write) this.violations.set(id, usage.path);
  }

  removeUsage(id) {
    this.usages.delete(id);
    this.violations.delete(id);
  }

  registerExport(path) {
    this.exportPath = path;
  }

  removeExport() {
    this.exportPath = null;
  }
}
