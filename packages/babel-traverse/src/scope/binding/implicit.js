import BindingBase from "./base";

/**
 * This class is responsible for a binding inside of a scope.
 *
 * It tracks the following:
 *
 *  * Amount of times referenced by other nodes.
 *  * Paths to nodes that reassign or modify this binding.
 */

export default class ImplicitBinding extends BindingBase {
  constructor({ scope, name }) {
    super({ scope });
    this.name = name;
  }

  removeUsage(id) {
    super.removeUsage(id);
    if (this.usages.size === 0) {
      delete this.scope.implicitBindings[this.name];
      delete this.scope.globals[this.name];
    }
  }
}
