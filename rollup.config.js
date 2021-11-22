import eslint from '@rollup/plugin-eslint';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import fs from 'fs';
import path from 'path';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

const isProduction = !process.env.ROLLUP_WATCH;

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];

fs.mkdirSync('./build/');

export default [
  {
    input: './src/index.ts',
    output: {
      sourcemap: true,
      dir: path.dirname(pkg.exports.development),
      format: 'esm',
    },
    external,
    plugins: [
      nodeResolve(),
      eslint({
        throwOnError: isProduction,
      }),
      typescript({
        outDir: path.dirname(pkg.exports.development),
        sourceMap: true,
      }),
    ],
  },
  isProduction && {
    input: './src/index.ts',
    output: {
      sourcemap: true,
      dir: path.dirname(pkg.exports.production),
      format: 'esm',
    },
    external,
    plugins: [
      nodeResolve(),
      eslint({
        throwOnError: isProduction,
      }),
      typescript({
        outDir: path.dirname(pkg.exports.production),
        sourceMap: true,
      }),
      terser(),
    ],
  },
].filter(Boolean);
