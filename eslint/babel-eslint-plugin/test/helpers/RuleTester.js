var RuleTester = require("eslint").RuleTester;

RuleTester.setDefaultConfig({
    parser: require.resolve('babel-eslint')
});

module.exports = RuleTester;
