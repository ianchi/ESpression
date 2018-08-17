import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

import path from 'path';

const MAIN_FILE = 'src/main.ts';

export default [
  {
    input: MAIN_FILE,
    external: ['tslib'],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [typescript()],
  },

  {
    input: MAIN_FILE,
    external: [],
    output: {
      file: pkg.es2015,
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            target: 'es2015',
            declaration: true,
            declarationDir: path.dirname(pkg.types),
          },
        },
      }),
    ],
  },
];
