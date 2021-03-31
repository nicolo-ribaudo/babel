module.exports = process.env.BABEL_8_BREAKING
  ? null
  : require("@babel/helper-module-transforms").getModuleName;
