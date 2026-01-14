import pkg from './package.json';

const srcEntry = 'lib/index.js';

export default [
  {
    input: srcEntry,
    output: [
      { file: pkg.exports['.'], format: 'es', sourcemap: true }
    ],
    external: [
      'min-dash'
    ]
  }
];