/*

to be used for updating tsconfig.json with next package

git add packages/babel-helper-validator-identifier/tsconfig.json
node ./scripts/update-tsconfig.js packages/babel-helper-validator-identifier/tsconfig.json
git add tsconfig.json
git commit -m "tsconfig packages/babel-helper-validator-identifier"

 */

const fs = require("fs").promises;
const path = require("path");

const tsConfigPath = path.join(__dirname, "..", "tsconfig.json");

async function main() {
  const data = JSON.parse(await fs.readFile(tsConfigPath));
  data.references.push({
    path: "./" + process.argv[2].replace(/\/tsconfig.json/, ""),
  });
  await fs.writeFile(tsConfigPath, JSON.stringify(data, null, 2));
}

main().then(
  () => {},
  err => console.error(err)
);
