const wait = t => new Promise(res => setTimeout(res, t));

const code = "function f() {}";

transform(code, {
  plugins: [
    function() {
      return {
        async pre() {
          await wait(50);
        }
      }
    }
  ]
}, (err, res) => {});
