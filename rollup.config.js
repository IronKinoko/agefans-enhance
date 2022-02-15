import { babel } from '@rollup/plugin-babel'
import image from '@rollup/plugin-image'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { defineConfig } from 'rollup'
import Copy from 'rollup-plugin-copy'
import styles from 'rollup-plugin-styles'
import pkg from './package.json'
import { genUserScriptInfo } from './template/userscript'
import typescript from 'rollup-plugin-typescript2'
export default defineConfig({
  input: 'src/index.js',
  output: {
    dir: 'dist',
    entryFileNames: 'index.user.js',
    format: 'iife',
    banner: genUserScriptInfo(pkg),
    globals: {
      'hls.js': 'Hls',
      jquery: '$',
      plyr: 'Plyr',
    },
  },
  external: ['hls.js', 'jquery', 'plyr'],
  plugins: [
    image(),
    babel({ babelHelpers: 'bundled' }),
    typescript(),
    styles(),
    nodeResolve({ browser: true }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.APP_VERSION': JSON.stringify(pkg.version),
      preventAssignment: true,
    }),
    Copy({
      targets: [
        {
          src: ['README.md', 'package.json', 'LICENSE', 'website/*'],
          dest: 'dist',
        },
      ],
    }),
  ],
})
