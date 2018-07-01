import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';

import path from 'path';

const MAIN_FILE = 'src/main.ts'

export default [
  {
    input: MAIN_FILE,
    output: {
      name: pkg.name,
      file: path.join(path.dirname(pkg.browser), path.basename(pkg.browser, '.js') + '.min.js'),
      format: 'umd',
      sourcemap: true
    },
    plugins: [
      resolve(),
      uglify(),
      typescript(),
    ]
  },

  {
    input: MAIN_FILE,
    output: {
      name: pkg.name,
      file: pkg.browser,
      format: 'umd',
      sourcemap: true
    },
    plugins: [
      resolve(),
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: { declaration: true, declarationDir: path.dirname(pkg.types) }
        }
      }),
    ]
  },

  {
    input: MAIN_FILE,
    external: ['tslib', 'rxjs', 'rxjs/operators'],
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true }
    ],
    plugins: [typescript()]
  }
];
