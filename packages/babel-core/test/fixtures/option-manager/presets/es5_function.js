module.exports = function () {
  return {
    plugins: [
      [
        require('../../../../../babel-plugin-syntax-decorators'),
        { version: 'legacy' },
      ],
    ]
  };
};
