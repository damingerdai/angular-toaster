const colors = require("colors/safe");
const fs = require("fs/promises");
const fsEx = require("fs-extra");
const path = require("path");
const shelljs = require("shelljs");

const { fetchTargets } = require("./utils");

async function buildTarget(target) {
  const { code } = shelljs.exec(`ng build ${target} --configuration production`);
  if (code !== 0) {
    throw new Error(`fail to compile the ${target}`);
  }
  console.log(`${colors.blue(target)} ${colors.green("success")} 🚀`);
}

async function cssTask() {
  const sassTask = shelljs.exec(
    `node_modules/.bin/sass packages/angular-toaster/src/toaster.scss dist/angular-toaster/toaster.css`
  );
  if (sassTask.code !== 0) {
    throw new Error(`fail to compile the scss`);
  }
  const minifyTask = shelljs.exec(
    `node_modules/.bin/esbuild --bundle dist/angular-toaster/toaster.css --outfile=dist/angular-toaster/toaster.min.css --minify  --sourcemap=external`
  );
  if (minifyTask.code !== 0) {
    throw new Error(`fail to minify the css`);
  }
}

async function copyTask() {
  const copyJob = shelljs.exec(`
    node_modules/.bin/cpx LICENSE dist/angular-toaster \
    && node_modules/.bin/cpx packages/angular-toaster/README.md dist/angular-toaster \
    && node_modules/.bin/cpx packages/angular-toaster/src/toaster.scss dist/angular-toaster \
    `);
  if (copyJob.code !== 0) {
    throw new Error(`fail to copy`);
  }
}

async function run() {
  await fs.rm(`${path.resolve("./dist")}`, { force: true, recursive: true });
  const targets = await fetchTargets();
  await Promise.all(targets.map((target) => buildTarget(target)));
  await cssTask();
  await copyTask();
}

run();
