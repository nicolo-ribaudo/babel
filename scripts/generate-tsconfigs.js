const fs = require("fs").promises;
const path = require("path");

const root = path.join(__dirname, "..");

async function loadPackages(dir) {
  const files = await fs.readdir(dir);
  return (
    await Promise.all(
      files.map(async name => {
        const pkgPath = path.join(dir, name, "package.json");

        const pkgContent =
          (await fs.lstat(pkgPath).then(
            stats => stats.isFile(),
            () => false
          )) && (await fs.readFile(pkgPath, { encoding: "utf-8" }));

        return {
          name,
          content: pkgContent,
          data: pkgContent && JSON.parse(pkgContent),
        };
      })
    )
  ).filter(({ content }) => content);
}

const getConfig = deps =>
  JSON.stringify(
    {
      extends: "../../tsconfig.base.json",
      compilerOptions: {
        outDir: "./lib",
        rootDir: "./src",
      },
      include: ["./src/**/*"],
      references: deps.map(dep => ({ path: `../babel-${dep}` })),
    },
    null,
    2
  );

async function main() {
  const packages = await loadPackages(path.join(root, "packages"));
  const nameSet = new Set(packages.map(pkg => pkg.data.name));
  for (const pkg of packages) {
    console.log(pkg.data.name);
    const babelOrgPrefix = "@babel/";
    const deps = [
      ...(pkg.data.dependencies ? Object.keys(pkg.data.dependencies) : []),
      ...(pkg.data.devDependencies
        ? Object.keys(pkg.data.devDependencies)
        : []),
    ]
      .filter(dep => dep.startsWith(babelOrgPrefix))
      .filter(dep => nameSet.has(dep))
      .map(dep => dep.substr(babelOrgPrefix.length));

    await fs.writeFile(
      path.join(root, "packages", pkg.name, "tsconfig.json"),
      getConfig(deps)
    );
  }
}

main().then(
  () => {},
  err => console.error(err)
);
