import terser from '@rollup/plugin-terser';

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import fs from 'node:fs';


const pkg = JSON.parse(fs.readFileSync('./package.json'));

const pkgExports = pkg.exports['.'];

function pgl(plugins = []) {
  return plugins;
}

const srcEntry = 'lib/index.js';

const umdDist = pkg['umd:main'];

const umdName = 'Moddle';

export default [

  // browser-friendly UMD build
  {
    input: srcEntry,
    output: {
      file: umdDist.replace(/\.js$/, '.prod.js'),
      format: 'umd',
      name: umdName
    },
    plugins: pgl([
      resolve(),
      commonjs(),
      terser()
    ])
  },
  {
    input: srcEntry,
    output: {
      file: umdDist,
      format: 'umd',
      name: umdName
    },
    plugins: pgl([
      resolve(),
      commonjs()
    ])
  },
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