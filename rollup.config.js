import fs from 'node:fs';


const pkg = JSON.parse(fs.readFileSync('./package.json'));

const pkgExports = pkg.exports['.'];

function pgl(plugins = []) {
  return plugins;
}

const srcEntry = 'lib/index.js';

export default [
  {
    input: srcEntry,
    output: [
      { file: pkgExports.require, format: 'cjs', sourcemap: true },
      { file: pkgExports.import, format: 'es', sourcemap: true }
    ],
    external: [
      'min-dash'
    ],
    plugins: pgl()
  }
];