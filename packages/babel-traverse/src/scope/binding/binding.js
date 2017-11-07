import BindingBase from "./base";

/**
 * This class is responsible for a binding inside of a scope.
 *
 * It tracks the following:
 *
 *  * Node path.
 *  * Amount of times referenced by other nodes.
 *  * Paths to nodes that reassign or modify this binding.
 *  * The kind of binding. (Is it a parameter, declaration etc)
 */

export default class Binding extends BindingBase {
  constructor({ identifier, scope, path, kind }) {
    super({ scope });
    this.identifier = identifier;
    this.path = path;
    this.kind = kind;
  }

  static fromImplicit(
    implicitBinding: ImplicitBinding,
    { identifier, path, kind },
  ): Binding {
    const binding = new Binding({
      scope: implicitBinding.scope,
      identifier,
      path,
      kind,
    });

    binding.usages = implicitBinding.usages;
    binding.violations = implicitBinding.violations;

    return binding;
  }
}
