import type * as N from "./ast";

var f: N.File<{ ESTree: true }> = {
  "type": "File",
  "start":0,"end":22,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":22}},
  "program": {
    "type": "Program",
    "start":0,"end":22,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":22}},
    "sourceType": "script",
    "interpreter": null,
    "body": [
      {
        "type": "VariableDeclaration",
        "start":0,"end":22,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":22}},
        "declarations": [
          {
            "type": "VariableDeclarator",
            "start":6,"end":21,"loc":{"start":{"line":1,"column":6},"end":{"line":1,"column":21}},
            "id": {
              "type": "Identifier",
              "start":6,"end":7,"loc":{"start":{"line":1,"column":6},"end":{"line":1,"column":7},"identifierName":"a"},
              "name": "a"
            },
            "init": {
              "type": "ImportExpression",
              "start":10,"end":21,"loc":{"start":{"line":1,"column":10},"end":{"line":1,"column":21}},
              "source": {
                "type": "Literal",
                "start":17,"end":20,"loc":{"start":{"line":1,"column":17},"end":{"line":1,"column":20}},
                "value": "a",
                "raw": "\"a\""
              }
            }
          }
        ],
        "kind": "const"
      }
    ]
  }
}

var g: N.File<{ ESTree: false }> = {
  "type": "File",
  "start":0,"end":33,"loc":{"start":{"line":1,"column":0},"end":{"line":3,"column":18}},
  "program": {
    "type": "Program",
    "start":0,"end":33,"loc":{"start":{"line":1,"column":0},"end":{"line":3,"column":18}},
    "sourceType": "script",
    "interpreter": null,
    "body": [
      {
        "type": "ExpressionStatement",
        "start":15,"end":33,"loc":{"start":{"line":3,"column":0},"end":{"line":3,"column":18}},
        "expression": {
          "type": "CallExpression",
          "start":15,"end":32,"loc":{"start":{"line":3,"column":0},"end":{"line":3,"column":17}},
          "callee": {
            "type": "Import",
            "start":15,"end":21,"loc":{"start":{"line":3,"column":0},"end":{"line":3,"column":6}}
          },
          "arguments": [
            {
              "type": "StringLiteral",
              "start":22,"end":31,"loc":{"start":{"line":3,"column":7},"end":{"line":3,"column":16}},
              "extra": {
                "rawValue": "test.js",
                "raw": "'test.js'"
              },
              "value": "test.js"
            }
          ]
        }
      }
    ],
    "directives": [
      {
        "type": "Directive",
        "start":0,"end":13,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":13}},
        "value": {
          "type": "DirectiveLiteral",
          "start":0,"end":12,"loc":{"start":{"line":1,"column":0},"end":{"line":1,"column":12}},
          "value": "use strict",
          "extra": {
            "raw": "\"use strict\"",
            "rawValue": "use strict"
          }
        }
      }
    ]
  }
}
