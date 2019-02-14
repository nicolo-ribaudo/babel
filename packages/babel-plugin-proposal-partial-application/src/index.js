import { declare } from "@babel/helper-plugin-utils";
import syntaxPartialApplication from "@babel/plugin-syntax-partial-application";
import { types as t } from "@babel/core";

export default declare(api => {
  api.assertVersion(7);

  /**
   * a function to figure out if a call expression has
   * ArgumentPlaceholder as one of its arguments
   * @param node a callExpression node
   * @returns boolean
   */
  function hasArgumentPlaceholder(node) {
    return node.arguments.some(arg => t.isArgumentPlaceholder(arg));
  }

  /**
   * Creates a unique identifier for the new returned function
   * @param {Object} scope
   * @returns {LVal} unique identifier
   */
  function newFuncLVal(scope) {
    return scope.generateUidIdentifier("_func");
  }

  /**
   * Creates a unique identifier for the new receiver
   * @param {Object} scope
   * @returns {LVal} unique identifier
   */
  function newReceiverLVal(scope) {
    return scope.generateUidIdentifier("_receiver");
  }

  /**
   * Creates a unique identifier for the parameters
   * @param {Object} scope
   * @returns {LVal} unique identifier
   */
  function newParamLVal(scope) {
    return scope.generateUidIdentifier("_param");
  }

  /**
   * returns the correct right hand-side for the receiver function
   * based on the callee type
   * @param {Object} node CallExpression node
   * @returns {Array<Expression>}
   */
  function funcRVal(node) {
    if (node.callee.type === "MemberExpression") {
      return unfold(node);
    }
  }

  /**
   * removes last node from an unfolded argument
   * @param {Object} node CallExpression node
   * @returns {String} correct right hand-side for the receiver
   * in a MemberExpression
   */
  function receiverRVal(node) {
    const rVal = unfold(node).split(".");
    rVal.pop();
    return rVal.join(".");
  }

  /**
   * a recursive function that unfolds nested MemberExpressions
   * @param {Object} node CallExpression node
   * @returns {String} the correct right hand-side value for the receiver
   * and the function
   */
  function unfold(node, acc = "") {
    if (t.isIdentifier(node)) {
      return `${node.name}.${acc}`;
    } else if (t.isThisExpression(node)) {
      return `this${acc ? "." : ""}${acc}`;
    } else if (t.isThisExpression(node && node.callee && node.callee.object)) {
      return unfold(
        node.callee.object,
        `${node.callee.property.name}${acc ? "." : ""}${acc}`,
      );
    } else if (
      node.callee
        ? t.isMemberExpression(node.callee)
        : t.isMemberExpression(node)
    ) {
      try {
        return unfold(
          node.callee.object,
          `${node.callee.property.name}${acc ? "." : ""}${acc}`,
        );
      } catch (error) {
        return unfold(
          node.object,
          `${node.property.name}${acc ? "." : ""}${acc}`,
        );
      }
    } else {
      throw new Error(`Can't unfold ${JSON.stringify(node)}`);
    }
  }

  /**
   * Unwrap the arguments of a CallExpression and removes
   * ArgumentPlaceholders from the unwrapped arguments
   * @param {Object} node CallExpression node
   * @returns {Array<Expression>}
   */
  function unwrapArguments(node) {
    return node.arguments.filter(
      argument => argument.type !== "ArgumentPlaceholder",
    );
  }

  /**
   * Unwraps all of the arguments in CallExpression
   * and removes ArgumentPlaceholders type with Identifier
   * and gives them a uniques name.
   * @param {Object} node
   * @param {Object} scope
   * @returns {Array<Expression>} the arguments
   */
  function unwrapAllArguments(node, scope) {
    const clone = t.cloneNode(node);

    return clone.arguments.map(arg => {
      if (arg.type === "ArgumentPlaceholder") {
        return Object.assign({}, arg, {
          type: "Identifier",
          name: scope.generateUid("_argPlaceholder"),
        });
      }

      return arg;
    });
  }

  /**
   * Makes an array of declarator for our VariableDeclaration
   * @param {Array<Expression>} inits
   * @param {Object} scope
   */
  function argsToVarDeclarator(inits, scope) {
    return inits.map(expr => t.variableDeclarator(newParamLVal(scope), expr));
  }

  /**
   * It replaces the values of non-placeholder args in allArgs
   * @param {Array<Declarator>} nonPlaceholderDecl that has no placeholder in them
   * @param {Array<Arguments>} args
   */
  function mapNonPlaceholderToLVal(nonPlaceholderDecl, allArgsList) {
    const clone = Array.from(allArgsList);
    clone.map(cl => {
      nonPlaceholderDecl.forEach(dec => {
        if (dec.init.type === cl.type) {
          if (!!cl.value && cl.value === dec.init.value) {
            cl.value = dec.id.name;
          } else if (!!cl.name && cl.name === dec.init.name) {
            cl.name = dec.id.name;
          }
        }
      });
    });
    return clone;
  }

  /**
   * Takes the full list of arguments and extracts placeholders from it
   * @param {Array<Argument>} allArgsList full list of arguments
   * @returns {Array<ArgumentPlaceholder>} cloneList
   */
  function placeholderLVal(allArgsList) {
    let cloneList = [];
    allArgsList.forEach(item => {
      if (item.name && item.name.includes("_argPlaceholder")) {
        cloneList = cloneList.concat(item);
      }
    });
    return cloneList;
  }

  return {
    name: "proposal-partial-application",
    inherits: syntaxPartialApplication,

    visitor: {
      CallExpression(path) {
        if (!hasArgumentPlaceholder(path.node)) {
          return;
        }
        const { node, scope } = path;
        const functionLVal = newFuncLVal(scope);
        const receiverLVal = newReceiverLVal(scope);
        const nonPlaceholderArgs = unwrapArguments(node);
        const nonPlaceholderDecl = argsToVarDeclarator(
          nonPlaceholderArgs,
          scope,
        );
        const allArgs = unwrapAllArguments(node, scope);
        const finalArgs = mapNonPlaceholderToLVal(nonPlaceholderDecl, allArgs);
        const placeholderVals = placeholderLVal(allArgs);

        if (node.callee.type === "MemberExpression") {
          const data = [
            t.variableDeclaration("const", [
              t.variableDeclarator(
                receiverLVal,
                t.identifier(receiverRVal(node)),
              ),
            ]),

            t.variableDeclaration("const", [
              t.variableDeclarator(
                functionLVal,
                t.identifier(`${funcRVal(node)}`),
              ),
            ]),
          ];
          if (nonPlaceholderDecl.length !== 0) {
            data.push(t.variableDeclaration("const", nonPlaceholderDecl));
          }
          data.push(
            t.returnStatement(
              t.arrowFunctionExpression(
                placeholderVals,
                t.callExpression(
                  t.memberExpression(
                    functionLVal,
                    t.identifier("call"),
                    false,
                    false,
                  ),
                  [receiverLVal, ...finalArgs],
                ),
                false,
              ),
            ),
          );
          const finalExpression = t.callExpression(
            t.arrowFunctionExpression([], t.blockStatement(data, []), false),
            [],
          );
          path.replaceWith(finalExpression);
        } else {
          const data = [
            t.variableDeclaration("const", [
              t.variableDeclarator(
                functionLVal,
                t.identifier(node.callee.name),
              ),
            ]),
          ];
          if (nonPlaceholderDecl.length !== 0) {
            data.push(t.variableDeclaration("const", nonPlaceholderDecl));
          }
          data.push(
            t.returnStatement(
              t.arrowFunctionExpression(
                placeholderVals,
                t.callExpression(functionLVal, finalArgs),
                false,
              ),
            ),
          );
          const finalExpression = t.callExpression(
            t.arrowFunctionExpression([], t.blockStatement(data, []), false),
            [],
          );

          path.replaceWith(finalExpression);
        }
      },
    },
  };
});
