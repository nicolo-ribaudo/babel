module.exports = function stringifyValidator(validator, nodePrefix, readonly) {
  if (validator === undefined) {
    return "any";
  }

  if (validator.each) {
    const array = readonly ? "$ReadOnlyArray" : "Array";
    return `${array}<${stringifyValidator(
      validator.each,
      nodePrefix,
      readonly
    )}>`;
  }

  if (validator.chainOf) {
    return stringifyValidator(validator.chainOf[1], nodePrefix, readonly);
  }

  if (validator.oneOf) {
    return validator.oneOf.map(JSON.stringify).join(" | ");
  }

  if (validator.oneOfNodeTypes) {
    return validator.oneOfNodeTypes.map(_ => nodePrefix + _).join(" | ");
  }

  if (validator.oneOfNodeOrValueTypes) {
    return validator.oneOfNodeOrValueTypes
      .map(_ => {
        return isValueType(_) ? _ : nodePrefix + _;
      })
      .join(" | ");
  }

  if (validator.type) {
    return validator.type;
  }

  if (validator.shapeOf) {
    const obj =
      "{ " +
      Object.keys(validator.shapeOf)
        .map(shapeKey => {
          const propertyDefinition = validator.shapeOf[shapeKey];
          if (propertyDefinition.validate) {
            const isOptional =
              propertyDefinition.optional || propertyDefinition.default != null;
            return (
              shapeKey +
              (isOptional ? "?: " : ": ") +
              stringifyValidator(propertyDefinition.validate, readonly)
            );
          }
          return null;
        })
        .filter(Boolean)
        .join(", ") +
      " }";

    return readonly ? `$ReadOnly<${obj}>` : obj;
  }

  return ["any"];
};

/**
 * Heuristic to decide whether or not the given type is a value type (eg. "null")
 * or a Node type (eg. "Expression").
 */
function isValueType(type) {
  return type.charAt(0).toLowerCase() === type.charAt(0);
}
