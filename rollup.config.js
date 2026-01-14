import pkg from './package.json';

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
    ]
  }
];